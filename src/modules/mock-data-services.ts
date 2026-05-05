import type { SeedFeatureResult } from "@/lib/firebase/mock-data-seeder"
import { seedTasksMockData } from "@/modules/tasks/services/task-mock-data"

export const mockDataFeatures = [
  { id: "tasks", label: "Tasks", seed: seedTasksMockData },
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
