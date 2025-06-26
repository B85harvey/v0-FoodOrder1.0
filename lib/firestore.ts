import { db } from "./firebase" // Ensure 'db' is correctly exported from your firebase setup file
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  setDoc,
  // serverTimestamp, // Consider using for createdAt/updatedAt
  // arrayUnion,
  // arrayRemove,
} from "firebase/firestore"

// --- Interfaces ---

export interface Ingredient {
  id?: string // Can be a sub-collection or an array of objects
  name: string
  quantity: string // e.g., "2", "100", "0.5" - consider storing as number if possible
  unit: string // e.g., "cups", "grams", "tbsp"
}

export interface Recipe {
  id?: string
  name: string
  description: string
  instructions: string[] // Array of instruction steps
  ingredients: Ingredient[]
  prepTime?: string // e.g., "30 minutes"
  cookTime?: string // e.g., "1 hour"
  servings?: number
  imageUrl?: string
  createdBy?: string // User ID of the creator
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface InventoryItem {
  id?: string
  name: string
  quantity: number
  unit: string // e.g., "kg", "liters", "pieces"
  category?: string
  expiryDate?: Timestamp
  lastUpdated?: Timestamp
  lowStockThreshold?: number
}

export interface Class {
  id?: string
  name: string // e.g., "Year 9 Food Tech - Group A"
  day: string // e.g., "Monday"
  time: string // e.g., "10:00 AM - 11:30 AM"
  students: number // Number of students enrolled
  room: string // e.g., "Kitchen 1"
  teacher: string // Teacher's name or ID
  // studentIds?: string[]; // Optional: list of student UIDs enrolled
}

export interface OrderItem {
  recipeId: string
  recipeName: string // Denormalized for easier display
  quantity: number // Number of portions/servings of this recipe
}

export interface Order {
  id?: string
  studentId: string
  studentName?: string // Denormalized
  classId: string
  className?: string // Denormalized
  orderDate: Timestamp // The date for which the food is being ordered
  items: OrderItem[]
  status: "pending" | "approved" | "rejected" | "prepared" | "collected"
  createdAt?: Timestamp
  notes?: string // Optional notes from student
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  role: "student" | "teacher" | "admin"
  classId?: string // For students, the ID of their class
  // any other relevant profile information
}

// --- Firestore Collection References ---
const inventoryCollection = collection(db, "inventory")
const recipesCollection = collection(db, "recipes")
const classesCollection = collection(db, "classes")
const ordersCollection = collection(db, "orders")
const usersCollection = collection(db, "users") // For user profiles

// --- Inventory Functions ---
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const snapshot = await getDocs(inventoryCollection)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as InventoryItem)
}

export const addInventoryItem = async (itemData: Omit<InventoryItem, "id" | "lastUpdated">): Promise<string> => {
  const docRef = await addDoc(inventoryCollection, { ...itemData, lastUpdated: Timestamp.now() })
  return docRef.id
}

export const updateInventoryItem = async (
  itemId: string,
  updates: Partial<Omit<InventoryItem, "id" | "lastUpdated">>,
): Promise<void> => {
  const itemDoc = doc(db, "inventory", itemId)
  await updateDoc(itemDoc, { ...updates, lastUpdated: Timestamp.now() })
}

export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  const itemDoc = doc(db, "inventory", itemId)
  await deleteDoc(itemDoc)
}

// --- Recipe Functions ---
export const getRecipes = async (): Promise<Recipe[]> => {
  const snapshot = await getDocs(recipesCollection)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Recipe)
}

export const getRecipe = async (recipeId: string): Promise<Recipe | null> => {
  const recipeDoc = doc(db, "recipes", recipeId)
  const snapshot = await getDoc(recipeDoc)
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Recipe) : null
}

export const addRecipe = async (recipeData: Omit<Recipe, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const docRef = await addDoc(recipesCollection, {
    ...recipeData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export const updateRecipe = async (
  recipeId: string,
  updates: Partial<Omit<Recipe, "id" | "createdAt">>,
): Promise<void> => {
  const recipeDoc = doc(db, "recipes", recipeId)
  await updateDoc(recipeDoc, { ...updates, updatedAt: Timestamp.now() })
}

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  const recipeDoc = doc(db, "recipes", recipeId)
  await deleteDoc(recipeDoc)
}

// --- Class Functions ---
export const getClasses = async (): Promise<Class[]> => {
  const snapshot = await getDocs(classesCollection)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Class)
}

export const getClass = async (classId: string): Promise<Class | null> => {
  const classDoc = doc(db, "classes", classId)
  const snapshot = await getDoc(classDoc)
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Class) : null
}

export const addClass = async (classData: Omit<Class, "id">): Promise<string> => {
  const docRef = await addDoc(classesCollection, classData)
  return docRef.id
}

export const updateClass = async (classId: string, updates: Partial<Omit<Class, "id">>): Promise<void> => {
  const classDoc = doc(db, "classes", classId)
  await updateDoc(classDoc, updates)
}

export const deleteClass = async (classId: string): Promise<void> => {
  const classDoc = doc(db, "classes", classId)
  await deleteDoc(classDoc)
}

// --- Order Functions ---
export const addOrder = async (orderData: Omit<Order, "id" | "createdAt">): Promise<string> => {
  const docRef = await addDoc(ordersCollection, { ...orderData, createdAt: Timestamp.now() })
  return docRef.id
}

export const getOrders = async (): Promise<Order[]> => {
  const snapshot = await getDocs(ordersCollection)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
}

export const getOrdersByStudent = async (studentId: string): Promise<Order[]> => {
  const q = query(ordersCollection, where("studentId", "==", studentId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
}

export const getOrdersByClass = async (classId: string): Promise<Order[]> => {
  const q = query(ordersCollection, where("classId", "==", classId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)
}

export const updateOrder = async (
  orderId: string,
  updates: Partial<Omit<Order, "id" | "createdAt">>,
): Promise<void> => {
  const orderDoc = doc(db, "orders", orderId)
  await updateDoc(orderDoc, updates)
}

// --- User Profile Functions ---
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = doc(db, "users", uid)
  const snapshot = await getDoc(userDoc)
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null
}

export const createUserProfile = async (
  uid: string,
  email: string,
  role: UserProfile["role"],
  displayName?: string,
): Promise<void> => {
  const userDoc = doc(db, "users", uid)
  const profileData: UserProfile = {
    uid,
    email,
    role,
    displayName: displayName || email.split("@")[0],
  }
  await setDoc(userDoc, profileData)
}

export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "email">>,
): Promise<void> => {
  const userDoc = doc(db, "users", uid)
  await setDoc(userDoc, updates, { merge: true })
}

// --- Shopping List Function ---
/**
 * Generates a shopping list based on approved orders for a specific class and date,
 * comparing required ingredients against current inventory.
 *
 * NOTE: This function is a simplified placeholder. Real-world implementation
 * requires robust unit parsing/conversion for ingredients and inventory items.
 */
export const generateShoppingList = async (classId: string, targetDate: Date): Promise<any[]> => {
  console.log(`Generating shopping list for class ${classId} for date ${targetDate.toDateString()}`)

  // Define start and end of the target day for querying orders
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const ordersQuery = query(
    ordersCollection,
    where("classId", "==", classId),
    where("orderDate", ">=", Timestamp.fromDate(startOfDay)),
    where("orderDate", "<=", Timestamp.fromDate(endOfDay)),
    where("status", "==", "approved"), // Only consider approved orders
  )

  const ordersSnapshot = await getDocs(ordersQuery)
  const relevantOrders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)

  if (relevantOrders.length === 0) {
    console.log("No approved orders found for the specified class and date.")
    return []
  }

  // Aggregate all ingredients needed
  const aggregatedIngredients: {
    [key: string]: { name: string; totalQuantity: number; unit: string; recipeIds: Set<string> }
  } = {}

  for (const order of relevantOrders) {
    for (const orderItem of order.items) {
      const recipe = await getRecipe(orderItem.recipeId)
      if (recipe && recipe.ingredients) {
        for (const ingredient of recipe.ingredients) {
          const ingKey = `${ingredient.name.toLowerCase()}_${ingredient.unit.toLowerCase()}`
          const quantity = Number.parseFloat(ingredient.quantity) * orderItem.quantity

          if (isNaN(quantity)) {
            console.warn(`Could not parse quantity for ingredient: ${ingredient.name} in recipe: ${recipe.name}`)
            continue
          }

          if (!aggregatedIngredients[ingKey]) {
            aggregatedIngredients[ingKey] = {
              name: ingredient.name,
              totalQuantity: 0,
              unit: ingredient.unit,
              recipeIds: new Set<string>(),
            }
          }
          aggregatedIngredients[ingKey].totalQuantity += quantity
          aggregatedIngredients[ingKey].recipeIds.add(recipe.id!)
        }
      }
    }
  }

  // Get current inventory
  const inventoryItems = await getInventoryItems()
  const inventoryMap: { [key: string]: InventoryItem } = {}
  inventoryItems.forEach((item) => {
    const invKey = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`
    inventoryMap[invKey] = item
  })

  // Calculate items to shop for
  const shoppingList: any[] = []
  for (const key in aggregatedIngredients) {
    const neededItem = aggregatedIngredients[key]
    const stockItem = inventoryMap[key]

    let quantityToOrder = neededItem.totalQuantity
    if (stockItem) {
      // This assumes units are directly comparable. Real-world needs conversion.
      quantityToOrder = Math.max(0, neededItem.totalQuantity - stockItem.quantity)
    }

    if (quantityToOrder > 0) {
      shoppingList.push({
        name: neededItem.name,
        unit: neededItem.unit,
        quantityNeeded: neededItem.totalQuantity,
        quantityInStock: stockItem ? stockItem.quantity : 0,
        quantityToOrder: quantityToOrder,
        // usedInRecipes: Array.from(neededItem.recipeIds) // Optional: for traceability
      })
    }
  }
  console.log("Final shopping list:", shoppingList)
  return shoppingList
}
