import { onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { QuerySyncOptions } from '@/types'
import replaceRouterQueue from '@/utils/replaceRouterQueue'
import { getRouter } from '@/router'

/**
 * Synchronizes a store value with a query parameter in the URL.
 *
 * @param key - The name of the query parameter, e.g. "tab".
 * @param get - A function that returns the current value from the store.
 * @param set - A function that updates the value in the store.
 * @param options.deps - A list of reactive dependencies that must change before synchronization occurs.
 * @param options.context - A unique context identifier, required when multiple instances use the same query key on the same page.
 *
 * ⚠️ Important:
 * If multiple components on the same page use the same query key,
 * you must provide a unique `context` to prevent conflicts.
 * Alternatively, always use unique query keys (for example, instead of "page", use "usersPage").
 */

export function useQuerySync<T extends string | number>(
  key: string,
  get: () => T | null,
  set: (val: T) => void,
  options: QuerySyncOptions = {}
) {
  const router = getRouter()
  const route = router.currentRoute
  const { deps = [], context } = options
  const fullKey = context ? `${context}_${key}` : key

  const applyQuery = (queryVal: unknown, force = false) => {
    if (typeof queryVal === 'string') {
      const val = (isNaN(Number(queryVal)) ? queryVal : Number(queryVal)) as T
      if (force || val !== get()) {
        set(val)
        const adjustedVal = get() // Проверяем, изменилось ли значение после set (например, из-за корректировки в set)
        if (adjustedVal !== val && adjustedVal !== null) {
          replaceRouterQueue(fullKey, adjustedVal) // Автоматически обновляем query, если set скорректировал значение
        }
      }
    } else {
      const storeVal = get()
      if (storeVal !== null) {
        // query пустой, но store есть → кладём его в url
        replaceRouterQueue(fullKey, storeVal)
      }
    }
  }

  // при mount
  onBeforeMount(() => {
    if (deps.length > 0) {
      watch(deps, () => applyQuery(route.value.query[fullKey]))
    } else {
      applyQuery(route.value.query[fullKey])
    }
  })
  // при изменении store обновляем query
  watch(get, (newVal) => {
    const q = route.value.query[fullKey]
    if (newVal === null) {
      if (q !== undefined) {
        replaceRouterQueue(fullKey, null)
      }
    } else if (q !== String(newVal)) {
      replaceRouterQueue(fullKey, newVal)
    }
  })

  // при изменении query обновляем store
  watch(
    () => route.value.query[fullKey],
    (newVal) => {
      applyQuery(newVal)
    }
  )

  onBeforeUnmount(() => {
    replaceRouterQueue(fullKey, null)
  })
}
