import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

admin.initializeApp()

const db = admin.firestore()

// Function to generate shopping lists weekly
export const generateWeeklyShoppingList = functions.pubsub
  .schedule("0 0 * * 1") // Run every Monday at midnight
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      console.log("Starting weekly shopping list generation...")

      // Get all orders for the upcoming week
      const now = new Date()
      const oneWeekLater = new Date()
      oneWeekLater.setDate(now.getDate() + 7)

      const ordersSnapshot = await db
        .collection("orders")
        .where("date", ">=", now)
        .where("date", "<=", oneWeekLater)
        .get()

      console.log(`Found ${ordersSnapshot.size} orders for the upcoming week`)

      // Get current inventory
      const inventorySnapshot = await db.collection("inventory").get()
      const inventory: Record<string, { currentStock: number; unit: string }> = {}

      inventorySnapshot.forEach((doc) => {
        const data = doc.data()
        inventory[data.name] = {
          currentStock: data.currentStock,
          unit: data.unit,
        }
      })

      // Calculate required ingredients
      const requiredIngredients: Record<string, { required: number; inStock: number; toOrder: number; unit: string }> =
        {}

      // Process orders to calculate required ingredients
      ordersSnapshot.forEach((doc) => {
        const order = doc.data()
        order.ingredients.forEach((ingredient: { name: string; amount: string; unit: string }) => {
          if (!requiredIngredients[ingredient.name]) {
            const inventoryItem = inventory[ingredient.name]
            requiredIngredients[ingredient.name] = {
              required: 0,
              inStock: inventoryItem ? inventoryItem.currentStock : 0,
              toOrder: 0,
              unit: ingredient.unit,
            }
          }

          // Parse amount and convert to number
          const amount = Number.parseFloat(ingredient.amount)
          if (!isNaN(amount)) {
            requiredIngredients[ingredient.name].required += amount
          }
        })
      })

      // Calculate how much to order
      Object.keys(requiredIngredients).forEach((ingredient) => {
        const item = requiredIngredients[ingredient]
        item.toOrder = Math.max(0, item.required - item.inStock)
      })

      // Save the shopping list to Firestore
      const shoppingListRef = db.collection("shoppingLists").doc()
      await shoppingListRef.set({
        date: admin.firestore.Timestamp.now(),
        items: requiredIngredients,
        status: "pending",
        generatedBy: "system",
      })

      console.log(`Shopping list saved with ID: ${shoppingListRef.id}`)

      // Send notification to teachers
      const teachersSnapshot = await db.collection("users").where("role", "==", "teacher").get()
      const teacherIds: string[] = []

      teachersSnapshot.forEach((doc) => {
        teacherIds.push(doc.id)
      })

      // Create notifications
      const batch = db.batch()
      teacherIds.forEach((teacherId) => {
        const notificationRef = db.collection("notifications").doc()
        batch.set(notificationRef, {
          userId: teacherId,
          title: "Weekly Shopping List Generated",
          message: "The shopping list for the upcoming week has been generated.",
          link: `/shopping-lists/${shoppingListRef.id}`,
          read: false,
          createdAt: admin.firestore.Timestamp.now(),
        })
      })

      await batch.commit()
      console.log(`Notifications sent to ${teacherIds.length} teachers`)

      return { success: true, message: "Shopping list generated successfully", listId: shoppingListRef.id }
    } catch (error) {
      console.error("Error generating shopping list:", error)
      throw new functions.https.HttpsError("internal", "Failed to generate shopping list")
    }
  })

// Function to send reminder notifications for pending orders
export const sendOrderReminders = functions.pubsub
  .schedule("0 12 * * *") // Run every day at noon
  .timeZone("America/New_York")
  .onRun(async (context) => {
    try {
      console.log("Starting order reminder process...")

      // Get all classes
      const classesSnapshot = await db.collection("classes").get()
      const classes: Record<string, { name: string; students: number }> = {}

      classesSnapshot.forEach((doc) => {
        const data = doc.data()
        classes[doc.id] = {
          name: data.name,
          students: data.students,
        }
      })

      // Get upcoming classes in the next 3 days
      const now = new Date()
      const threeDaysLater = new Date()
      threeDaysLater.setDate(now.getDate() + 3)

      let totalReminders = 0

      // For each class, check if all students have submitted orders
      for (const [classId, classData] of Object.entries(classes)) {
        // Get orders for this class
        const ordersSnapshot = await db
          .collection("orders")
          .where("classId", "==", classId)
          .where("date", ">=", now)
          .where("date", "<=", threeDaysLater)
          .get()

        const orderCount = ordersSnapshot.size
        const pendingOrders = classData.students - orderCount

        if (pendingOrders > 0) {
          console.log(`Class ${classData.name} has ${pendingOrders} pending orders`)

          // Get students in this class
          const studentsSnapshot = await db
            .collection("users")
            .where("role", "==", "student")
            .where("classId", "==", classId)
            .get()

          // Create a set of students who have already submitted orders
          const submittedStudents = new Set<string>()
          ordersSnapshot.forEach((doc) => {
            const order = doc.data()
            submittedStudents.add(order.studentId)
          })

          // Send notifications to students who haven't submitted orders
          const batch = db.batch()
          studentsSnapshot.forEach((doc) => {
            if (!submittedStudents.has(doc.id)) {
              const notificationRef = db.collection("notifications").doc()
              batch.set(notificationRef, {
                userId: doc.id,
                title: "Reminder: Submit Your Recipe Order",
                message: `Please submit your recipe order for the upcoming class in ${classData.name}.`,
                link: "/dashboard/student",
                read: false,
                createdAt: admin.firestore.Timestamp.now(),
              })
              totalReminders++
            }
          })

          await batch.commit()
        }
      }

      console.log(`Sent ${totalReminders} reminder notifications`)
      return { success: true, message: "Reminders sent successfully", count: totalReminders }
    } catch (error) {
      console.error("Error sending reminders:", error)
      throw new functions.https.HttpsError("internal", "Failed to send reminders")
    }
  })

// Function to update inventory when orders are completed
export const updateInventoryOnOrderCompletion = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data()
    const previousValue = change.before.data()

    // Only proceed if the order status changed from pending to completed
    if (previousValue.status === "pending" && newValue.status === "completed") {
      try {
        console.log(`Updating inventory for completed order: ${context.params.orderId}`)

        // Get the ingredients from the order
        const ingredients = newValue.ingredients

        // Update inventory for each ingredient
        const batch = db.batch()

        for (const ingredient of ingredients) {
          // Find the inventory item
          const inventoryQuery = await db.collection("inventory").where("name", "==", ingredient.name).get()

          if (!inventoryQuery.empty) {
            const inventoryDoc = inventoryQuery.docs[0]
            const inventoryData = inventoryDoc.data()

            // Parse amount and convert to number
            const amount = Number.parseFloat(ingredient.amount)
            if (!isNaN(amount)) {
              // Subtract the used amount from current stock
              const newStock = Math.max(0, inventoryData.currentStock - amount)

              // Update the inventory
              batch.update(inventoryDoc.ref, {
                currentStock: newStock,
                lastUpdated: admin.firestore.Timestamp.now(),
              })

              console.log(`Updated ${ingredient.name}: ${inventoryData.currentStock} -> ${newStock}`)
            }
          }
        }

        await batch.commit()
        console.log("Inventory updated successfully")
        return { success: true, message: "Inventory updated successfully" }
      } catch (error) {
        console.error("Error updating inventory:", error)
        throw new functions.https.HttpsError("internal", "Failed to update inventory")
      }
    }

    return null
  })

// Function to create user profile when a new user is created
export const createUserProfileOnSignUp = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`Creating profile for new user: ${user.uid}`)

    // Create a user profile document
    await db
      .collection("users")
      .doc(user.uid)
      .set({
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "New User",
        role: "student", // Default role
        createdAt: admin.firestore.Timestamp.now(),
        lastLogin: admin.firestore.Timestamp.now(),
      })

    console.log(`User profile created successfully for: ${user.email}`)
    return { success: true, message: "User profile created successfully" }
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw new functions.https.HttpsError("internal", "Failed to create user profile")
  }
})

// HTTP function to manually trigger shopping list generation (for testing)
export const generateShoppingListManual = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated and is a teacher
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated")
  }

  const userDoc = await db.collection("users").doc(context.auth.uid).get()
  const userData = userDoc.data()

  if (!userData || userData.role !== "teacher") {
    throw new functions.https.HttpsError("permission-denied", "Only teachers can generate shopping lists")
  }

  // Call the same logic as the scheduled function
  return generateWeeklyShoppingList.run({} as any, {} as any)
})
