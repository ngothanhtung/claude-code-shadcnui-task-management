---
name: nextjs-firebase-feature
description: Create a new feature module in Next.js with Firebase Firestore. Use this whenever the user wants to add a new feature with a data table, CRUD operations, or any Firestore-backed module. Triggers on requests like "add a new feature", "create a CRUD module", "new dashboard page with data table".
---

## Project context

- **TypeScript** with `@/` → `src/`
- **Next.js App Router** — page at `src/app/(dashboard)/<feature>/page.tsx`
- **Firebase Firestore** with mock-data fallback
- **@tanstack/react-table**, **react-hook-form**, **zod**, **shadcn/ui**, **lucide-react**

## Inputs

1. **Feature name** — used for folders/files
2. **Fields list** — name, email, status, etc.
3. **Required fields** — form validation
4. **Filter/sort fields** — toolbar filters + table columns

## Feature structure

```
src/app/(dashboard)/<feature>/page.tsx
src/modules/<feature>/
  services/
    <feature>-services.ts
    <feature>-mock-data.ts
    types/<feature>-types.ts
  components/
    data-table.tsx
    data-table-toolbar.tsx
    data-table-pagination.tsx
    data-table-row-actions.tsx
    add-<feature>-modal.tsx
    columns.tsx
    <feature>-stat-cards.tsx         # optional
```

## Firebase

### `getFirestoreCollection`

```typescript
import { getFirestoreCollection } from "@/lib/firebase/firestore-query"
import { <Feature>MockData } from "./<feature>-mock-data"

export async function get<Features>(): Promise<<Feature>Item[]> {
  return getFirestoreCollection<<Feature>Item>("<features>", <Feature>MockData)
}
```

### Rules

- **Collection**: plural, snake_case (`tasks`, `users`)
- **No real-time**: never use `onSnapshot`
- **No direct CRUD**: never write Firestore create/update/delete in service — handle on local state (callback pattern in page/component)
- **Fallback**: always pass mock data as fallback
- **Seed**: use `serverTimestamp()` in seeder only

## CRUD Pattern

Service only reads via `getFirestoreCollection`. Create/update/delete on local state:

```typescript
// page.tsx
const handleAdd = (item: <Feature>Item) => setItems(prev => [item, ...prev])
const handleDelete = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
const handleUpdate = (item: <Feature>Item) => setItems(prev => prev.map(i => i.id === item.id ? item : i))
```

## Types

```typescript
import { z } from "zod"

export const <feature>Schema = z.object({
  id: z.string(),
  name: z.string(),
  // fields...
})

export type <Feature>Item = z.infer<typeof <feature>Schema>
```

## Page

Client Component — init state with mock data, fetch Firestore in `useEffect`.

## Table

`@tanstack/react-table` with state: sorting, filtering, pagination, column visibility.

- Toolbar: search input + filter dropdowns + add button
- Columns: defined in `columns.tsx`
- Row actions: dropdown view/edit/delete
- Pagination: page size + prev/next

## Form

`react-hook-form` + `zod`. Input, Select, Textarea from shadcn/ui. Show error under each field.

## Required: Delete Confirmation

Every delete must show a confirmation dialog (shadcn Dialog) before executing.

## Reference implementations

- **Canonical**: `src/modules/tasks/` — full feature with stats, table, toolbar, pagination, row actions, add modal
- **Hook-form + zod**: `src/modules/users/`
- **Firestore helper**: `src/lib/firebase/firestore-query.ts`
- **Seeder**: `src/lib/firebase/mock-data-seeder.ts`

## Exclusions

- No README/docs unless requested
- No React class components
- No hardcoded Firebase config — import from `@/lib/firebase/client`
- Page route: `src/app/(dashboard)/<feature>/page.tsx`
- Service file: `src/modules/<feature>/services/<feature>-services.ts` (plural)

## Steps

1. Types (`types/<feature>-types.ts`)
2. Mock data (`<feature>-mock-data.ts`)
3. Service (`<feature>-services.ts`)
4. Columns, row actions, view options, pagination
5. Toolbar, data table, add modal
6. Page assembling everything
7. `npx tsc --noEmit`
8. `npm run dev`
