import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore"
import type { RegisterUserItem } from "./types/register-users-types"

const COLLECTION_NAME = "register_users"

const registerUsersMockData: RegisterUserItem[] = []

export async function getRegisterUsers(): Promise<RegisterUserItem[]> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    if (snapshot.empty) return registerUsersMockData
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as RegisterUserItem
      return { ...data, id: data.id ?? docSnap.id }
    })
  } catch {
    return registerUsersMockData
  }
}

export async function addRegisterUser(user: RegisterUserItem): Promise<string> {
  const { db } = await import("@/lib/firebase/client")
  const { id, ...data } = user
  const docRef = await addDoc(collection(db, COLLECTION_NAME), data)
  return docRef.id
}

export async function updateRegisterUser(
  id: string,
  data: Partial<RegisterUserItem>
): Promise<void> {
  const { db } = await import("@/lib/firebase/client")
  await updateDoc(doc(db, COLLECTION_NAME, id), data)
}

export async function deleteRegisterUser(id: string): Promise<void> {
  const { db } = await import("@/lib/firebase/client")
  await deleteDoc(doc(db, COLLECTION_NAME, id))
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
