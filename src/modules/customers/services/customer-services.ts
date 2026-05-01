import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore"
import type { Customer } from "./types/customer-types"

const COLLECTION_NAME = "customers"

export async function getCustomers(): Promise<Customer[]> {
  const { db } = await import("@/lib/firebase/client")
  const snapshot = await getDocs(collection(db, COLLECTION_NAME))
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Customer
    return { ...data, id: data.id ?? docSnap.id }
  })
}

export async function addCustomer(customer: Customer): Promise<string> {
  const { db } = await import("@/lib/firebase/client")
  const docRef = await addDoc(collection(db, COLLECTION_NAME), customer)
  return docRef.id
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  const { db } = await import("@/lib/firebase/client")
  await updateDoc(doc(db, COLLECTION_NAME, id), data as Record<string, unknown>)
}

export async function deleteCustomer(id: string): Promise<void> {
  const { db } = await import("@/lib/firebase/client")
  await deleteDoc(doc(db, COLLECTION_NAME, id))
}

export function getCustomerStats(customers: Customer[]) {
  const total = customers.length
  const active = customers.filter((c) => c.status === "active").length
  const vip = customers.filter((c) => c.status === "vip").length
  const prospect = customers.filter((c) => c.status === "prospect").length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent ?? 0), 0)

  return {
    total,
    active,
    vip,
    prospect,
    totalRevenue,
  }
}
