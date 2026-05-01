// Status/type options used by toolbar, columns, add/edit modals

export const customerStatuses = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
  { value: "lead", label: "Lead", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "prospect", label: "Prospect", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { value: "vip", label: "VIP", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
] as const

export const customerTypes = [
  { value: "individual", label: "Individual" },
  { value: "business", label: "Business" },
] as const
