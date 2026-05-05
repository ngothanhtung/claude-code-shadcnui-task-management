import { writeBatch, doc, Timestamp } from "firebase/firestore"

import { db } from "@/lib/firebase/client"

export interface MockDataCollection {
  collectionName: string
  documents: unknown[]
  getDocumentId?: (document: Record<string, unknown>, index: number) => string
}

export interface SeedCollectionResult {
  collectionName: string
  count: number
}

export interface SeedFeatureResult {
  feature: string
  collections: SeedCollectionResult[]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]"
}

export function toFirestoreData(value: unknown): unknown {
  if (value instanceof Date) {
    return value
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toFirestoreData(item))
      .filter((item) => item !== undefined)
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, toFirestoreData(item)] as const)
        .filter(([, item]) => item !== undefined)
    )
  }

  if (
    typeof value === "function" ||
    typeof value === "symbol" ||
    value === undefined
  ) {
    return undefined
  }

  return value
}

export async function seedMockDataCollections(
  feature: string,
  collections: MockDataCollection[]
): Promise<SeedFeatureResult> {
  const batch = writeBatch(db)
  const results: SeedCollectionResult[] = []

  for (const seedCollection of collections) {
    seedCollection.documents.forEach((document, index) => {
      const sanitized = toFirestoreData(document) as Record<string, unknown>
      const documentId =
        seedCollection.getDocumentId?.(sanitized, index) ??
        String(sanitized.id ?? `${seedCollection.collectionName}-${index + 1}`)

      batch.set(
        doc(db, seedCollection.collectionName, documentId),
        {
          ...sanitized,
          seededAt: Timestamp.now(),
        },
        { merge: true }
      )
    })

    results.push({
      collectionName: seedCollection.collectionName,
      count: seedCollection.documents.length,
    })
  }

  await batch.commit()

  return {
    feature,
    collections: results,
  }
}
