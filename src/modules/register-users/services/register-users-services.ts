import { getFirestoreCollection } from "@/lib/firebase/firestore-query"
import type { RegisterUserItem } from "./types/register-users-types"

export async function getRegisterUsers(): Promise<RegisterUserItem[]> {
  return getFirestoreCollection<RegisterUserItem>("register_users", [])
}

export function getRegisterUserStats(users: RegisterUserItem[]) {
  const total = users.length
  return {
    total,
    pending: users.filter((u) => u.status === "pending").length,
    contacted: users.filter((u) => u.status === "contacted").length,
    completed: users.filter((u) => u.status === "completed").length,
  }
}
