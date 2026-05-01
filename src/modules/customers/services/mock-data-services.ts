import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"
import { customerSchema } from "./types/customer-types"
import customersData from "./data/customers.json"

const customerMockData = customerSchema.array().parse(customersData)

export function seedCustomersMockData() {
  return seedMockDataCollections("customers", [
    {
      collectionName: "customers",
      documents: customerMockData,
      getDocumentId: (_, index) => `CUST-${1001 + index}`,
    },
  ])
}
