import type { SeedFeatureResult } from "@/lib/firebase/mock-data-seeder"
import { seedTasksMockData } from "@/modules/tasks/services/task-mock-data"

export const mockDataFeatures = [
  { id: "tasks", label: "Tasks", seed: seedTasksMockData },
  // To add a new feature seeder:
  // 1. Create a seed function in its mock-data file (e.g., `export function seedXxxMockData() { ... }`)
  // 2. Import it here and add to this array
  // 3. Add to register-users services if not already done
]

export async function seedFeatureMockData(
  featureId: string
): Promise<SeedFeatureResult[]> {
  if (featureId === "all") {
    return Promise.all(mockDataFeatures.map((feature) => feature.seed()))
  }

  const feature = mockDataFeatures.find((item) => item.id === featureId)

  if (!feature) {
    throw new Error(`Unknown mock data feature: ${featureId}`)
  }

  return [await feature.seed()]
}
