import { getRouter } from '@/router'

let queuedQuery: Record<string, string | number> = {}
const toDelete: Set<string> = new Set()
let queued = false

export default function replaceRouterQueue(key: string, value: string | number | null) {
  const router = getRouter()

  if (value === null) {
    if (!(key in queuedQuery)) {
      toDelete.add(key)
    }
  } else {
    queuedQuery[key] = value
    toDelete.delete(key)
  }

  if (!queued) {
    queued = true
    queueMicrotask(() => {
      const currentQuery = { ...router.currentRoute.value.query }

      toDelete.forEach((key) => {
        delete currentQuery[key]
      })

      const finalQuery = {
        ...currentQuery,
        ...queuedQuery
      }

      router.replace({ query: finalQuery })

      queuedQuery = {}
      toDelete.clear()
      queued = false
    })
  }
}
