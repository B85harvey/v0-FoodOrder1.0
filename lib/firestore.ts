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
} from "firebase/firestore"

// --- Interfaces ---

export interface Ingredient {
  id?: string
  name: string
  quantity: string // Stored as string, parsed to number when used in calculations
  unit: string
}

export interface Recipe {
  id?: string
  name: string
  description: string
  instructions: string[]
  ingredients: Ingredient[] // Ingredients as defined for the recipe template
  prepTime?: string
  cookTime?: string
  servings?: number
  imageUrl?: string
  createdBy?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface InventoryItem {
  id?: string
  name: string
  quantity: number // Current stock quantity
  unit: string
  category?: string
  expiryDate?: Timestamp
  lastUpdated?: Timestamp
  lowStockThreshold?: number
}

export interface Class {
  id?: string
  name: string
  day: string
  time: string
  students: number
  room: string
  teacher: string
}

// This is the corrected Order interface
export interface Order {
  id?: string
  studentId: string
  studentName?: string
  classId: string
  className?: string
  recipeName: string // Name of the single recipe ordered
  // Ingredients for that recipe, denormalized on the order.
  // 'amount' here is the specific amount for THIS order, derived from the recipe.
  ingredients: Array<{ id?: string; name: string; amount: string; unit: string }>
  date: Timestamp // The date for which the food is being ordered / practical lesson date
  status: "pending" | "approved" | "rejected" | "prepared" | "collected"
  createdAt?: Timestamp // Date the order was placed
  notes?: string
}

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  role: "student" | "teacher" | "admin"
  classId?: string
}

// --- Firestore Collection References ---
const inventoryCollection = collection(db, "inventory")
const recipesCollection = collection(db, "recipes")
const classesCollection = collection(db, "classes")
const ordersCollection = collection(db, "orders")
const usersCollection = collection(db, "users")

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

// --- Shopping List Function (Client-side version) ---
// This client-side generateShoppingList is now aligned with the Cloud Function's expectation
// that orders have denormalized ingredients.
export const generateShoppingList = async (
  // classId: string, // No longer needed if we fetch all relevant orders
  // targetDate: Date // Or a date range
): Promise<Record<string, { required: number; inStock: number; toOrder: number; unit: string }>> => {
  console.log(`Generating shopping list from client...`)

  // Fetch all orders (or filter by date range if needed)
  // For simplicity, let's assume we get all 'pending' or 'approved' orders for an upcoming period.
  // This logic should mirror the Cloud Function's order fetching logic.
  const now = new Date()
  const oneWeekLater = new Date()
  oneWeekLater.setDate(now.getDate() + 7)

  const ordersQuery = query(
    ordersCollection,
    where("date", ">=", Timestamp.fromDate(now)),
    where("date", "<=", Timestamp.fromDate(oneWeekLater)),
    // where("status", "in", ["pending", "approved"]) // Consider which statuses to include
  )

  const ordersSnapshot = await getDocs(ordersQuery)
  const relevantOrders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Order)

  if (relevantOrders.length === 0) {
    console.log("No relevant orders found for the upcoming period.")
    return {}
  }

  const aggregatedIngredients: Record<string, { name: string; totalQuantity: number; unit: string }> = {}

  for (const order of relevantOrders) {
    if (order.ingredients && order.ingredients.length > 0) {
      for (const ingredient of order.ingredients) {
        const ingKey = `${ingredient.name.toLowerCase()}_${ingredient.unit.toLowerCase()}`
        const quantity = Number.parseFloat(ingredient.amount)

        if (isNaN(quantity)) {
          console.warn(`Could not parse quantity for ingredient: ${ingredient.name} in order: ${order.id || "unknown"}`)
          continue
        }

        if (!aggregatedIngredients[ingKey]) {
          aggregatedIngredients[ingKey] = {
            name: ingredient.name,
            totalQuantity: 0,
            unit: ingredient.unit,
          }
        }
        aggregatedIngredients[ingKey].totalQuantity += quantity
      }
    }
  }

  const inventoryItems = await getInventoryItems()
  const inventoryMap: Record<string, InventoryItem> = {}
  inventoryItems.forEach((item) => {
    const invKey = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`
    inventoryMap[invKey] = item
  })

  const shoppingListResult: Record<string, { required: number; inStock: number; toOrder: number; unit: string }> = {}

  for (const key in aggregatedIngredients) {
    const neededItem = aggregatedIngredients[key]
    const stockItem = inventoryMap[key]

    const requiredQuantity = neededItem.totalQuantity
    const quantityInStock = stockItem ? stockItem.quantity : 0
    const quantityToOrder = Math.max(0, requiredQuantity - quantityInStock)

    // Only add to shopping list if something needs to be ordered
    // if (quantityToOrder > 0) { // Or show all items for clarity
    shoppingListResult[neededItem.name] = {
      // Using item name as key for the final list
      required: requiredQuantity,
      inStock: quantityInStock,
      toOrder: quantityToOrder,
      unit: neededItem.unit,
    }
    // }
  }
  console.log("Client-generated shopping list:", shoppingListResult)
  return shoppingListResult
}
