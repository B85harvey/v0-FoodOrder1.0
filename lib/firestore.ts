import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// Types
export interface Recipe {
  id?: string
  name: string
  description: string
  difficulty: string
  prepTime: string
  cookTime: string
  ingredients: Ingredient[]
  isActive: boolean
}

export interface Ingredient {
  id?: string
  name: string
  amount: string
  unit: string
  required: boolean
}

export interface InventoryItem {
  id?: string
  name: string
  category: string
  currentStock: number
  unit: string
  minLevel: number
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

export interface Order {
  id?: string
  studentId: string
  studentName: string
  classId: string
  className: string
  date: Timestamp
  recipeId: string
  recipeName: string
  ingredients: {
    id: string
    name: string
    amount: string
    unit: string
  }[]
  status: "pending" | "completed"
}

export interface User {
  id?: string
  email: string
  displayName: string
  role: "teacher" | "student"
  classId?: string
}

// Recipes
export const getRecipes = async (): Promise<Recipe[]> => {
  const recipesCollection = collection(db, "recipes")
  const recipesSnapshot = await getDocs(recipesCollection)
  return recipesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Recipe[]
}

export const getRecipe = async (id: string): Promise<Recipe | null> => {
  const recipeDoc = doc(db, "recipes", id)
  const recipeSnapshot = await getDoc(recipeDoc)

  if (!recipeSnapshot.exists()) {
    return null
  }

  return {
    id: recipeSnapshot.id,
    ...recipeSnapshot.data(),
  } as Recipe
}

export const addRecipe = async (recipe: Omit<Recipe, "id">): Promise<string> => {
  const recipesCollection = collection(db, "recipes")
  const docRef = await addDoc(recipesCollection, recipe)
  return docRef.id
}

export const updateRecipe = async (id: string, recipe: Partial<Recipe>): Promise<void> => {
  const recipeDoc = doc(db, "recipes", id)
  await updateDoc(recipeDoc, recipe)
}

export const deleteRecipe = async (id: string): Promise<void> => {
  const recipeDoc = doc(db, "recipes", id)
  await deleteDoc(recipeDoc)
}

// Inventory
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const inventoryCollection = collection(db, "inventory")
  const inventorySnapshot = await getDocs(inventoryCollection)
  return inventorySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as InventoryItem[]
}

export const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
  const itemDoc = doc(db, "inventory", id)
  const itemSnapshot = await getDoc(itemDoc)

  if (!itemSnapshot.exists()) {
    return null
  }

  return {
    id: itemSnapshot.id,
    ...itemSnapshot.data(),
  } as InventoryItem
}

export const addInventoryItem = async (item: Omit<InventoryItem, "id">): Promise<string> => {
  const inventoryCollection = collection(db, "inventory")
  const docRef = await addDoc(inventoryCollection, item)
  return docRef.id
}

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<void> => {
  const itemDoc = doc(db, "inventory", id)
  await updateDoc(itemDoc, item)
}

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const itemDoc = doc(db, "inventory", id)
  await deleteDoc(itemDoc)
}

// Classes
export const getClasses = async (): Promise<Class[]> => {
  const classesCollection = collection(db, "classes")
  const classesSnapshot = await getDocs(classesCollection)
  return classesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Class[]
}

export const getClass = async (id: string): Promise<Class | null> => {
  const classDoc = doc(db, "classes", id)
  const classSnapshot = await getDoc(classDoc)

  if (!classSnapshot.exists()) {
    return null
  }

  return {
    id: classSnapshot.id,
    ...classSnapshot.data(),
  } as Class
}

export const addClass = async (classData: Omit<Class, "id">): Promise<string> => {
  const classesCollection = collection(db, "classes")
  const docRef = await addDoc(classesCollection, classData)
  return docRef.id
}

export const updateClass = async (id: string, classData: Partial<Class>): Promise<void> => {
  const classDoc = doc(db, "classes", id)
  await updateDoc(classDoc, classData)
}

export const deleteClass = async (id: string): Promise<void> => {
  const classDoc = doc(db, "classes", id)
  await deleteDoc(classDoc)
}

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const ordersCollection = collection(db, "orders")
  const ordersSnapshot = await getDocs(ordersCollection)
  return ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]
}

export const getOrdersByClass = async (classId: string): Promise<Order[]> => {
  const ordersCollection = collection(db, "orders")
  const q = query(ordersCollection, where("classId", "==", classId))
  const ordersSnapshot = await getDocs(q)
  return ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]
}

export const getOrdersByStudent = async (studentId: string): Promise<Order[]> => {
  const ordersCollection = collection(db, "orders")
  const q = query(ordersCollection, where("studentId", "==", studentId))
  const ordersSnapshot = await getDocs(q)
  return ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[]
}

export const addOrder = async (order: Omit<Order, "id">): Promise<string> => {
  const ordersCollection = collection(db, "orders")
  const docRef = await addDoc(ordersCollection, order)
  return docRef.id
}

export const updateOrder = async (id: string, order: Partial<Order>): Promise<void> => {
  const orderDoc = doc(db, "orders", id)
  await updateDoc(orderDoc, order)
}

export const deleteOrder = async (id: string): Promise<void> => {
  const orderDoc = doc(db, "orders", id)
  await deleteDoc(orderDoc)
}

// Users
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userDoc = doc(db, "users", userId)
  const userSnapshot = await getDoc(userDoc)

  if (!userSnapshot.exists()) {
    return null
  }

  return {
    id: userSnapshot.id,
    ...userSnapshot.data(),
  } as User
}

export const createUserProfile = async (userId: string, userData: Omit<User, "id">): Promise<void> => {
  const userDoc = doc(db, "users", userId)
  await updateDoc(userDoc, userData)
}

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userDoc = doc(db, "users", userId)
  await updateDoc(userDoc, userData)
}

// Shopping List Generation
export const generateShoppingList = async (): Promise<
  Record<string, { required: number; inStock: number; toOrder: number; unit: string }>
> => {
  // Get all orders
  const orders = await getOrders()

  // Get current inventory
  const inventory = await getInventoryItems()

  // Calculate required ingredients
  const requiredIngredients: Record<string, { required: number; inStock: number; toOrder: number; unit: string }> = {}

  // Process orders to calculate required ingredients
  orders.forEach((order) => {
    order.ingredients.forEach((ingredient) => {
      if (!requiredIngredients[ingredient.name]) {
        const inventoryItem = inventory.find((item) => item.name === ingredient.name)
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

  return requiredIngredients
}
