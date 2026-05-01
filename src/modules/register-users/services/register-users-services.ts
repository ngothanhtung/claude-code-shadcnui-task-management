import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"
import { getFirestoreCollection } from "@/lib/firebase/firestore-query"
import { db } from "@/lib/firebase/client"
import type { RegisterUserItem } from "./types/register-users-types"

export async function getRegisterUsers(): Promise<RegisterUserItem[]> {
  return getFirestoreCollection<RegisterUserItem>("register_users", [])
}

export async function addRegisterUser(user: RegisterUserItem): Promise<string> {
  const { id, ...data } = user
  const docRef = await addDoc(collection(db, "register_users"), data)
  return docRef.id
}

export async function updateRegisterUser(
  id: string,
  data: Partial<RegisterUserItem>
): Promise<void> {
  const docRef = doc(db, "register_users", id)
  const { id: _id, ...payload } = data
  await updateDoc(docRef, payload)
}

export async function deleteRegisterUser(id: string): Promise<void> {
  const docRef = doc(db, "register_users", id)
  await deleteDoc(docRef)
}

export function getRegisterUserStats(users: RegisterUserItem[]) {
  const total = users.length
  const today = new Date().toISOString().slice(0, 10)

  return {
    total,
    today: users.filter((u) => u.createdAt?.startsWith(today)).length,
    withPhone: users.filter((u) => Boolean(u.phone?.trim())).length,
    withMessage: users.filter((u) => Boolean(u.message?.trim())).length,
  }
}
