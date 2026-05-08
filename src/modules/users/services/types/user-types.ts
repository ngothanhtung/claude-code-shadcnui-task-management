export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  plan: string
  billing: string
  status: string
  joinedDate: string
  lastLogin: string
}

export type UserStatus = "Active" | "Pending" | "Error" | "Inactive"
export type UserRole = "Admin" | "Author" | "Editor" | "Maintainer" | "Subscriber"

export interface UserFormValues {
  name: string
  email: string
  role: string
  plan: string
  billing: string
  status: string
}
