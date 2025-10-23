import { onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { QuerySyncOptions } from '@/types'
import replaceRouterQueue from '@/utils/replaceRouterQueue'

function parseQueryValue(queryVal: string): string | number {
  if (queryVal === '') {
    return queryVal
  }
  const numVal = Number(queryVal)
  if (!isNaN(numVal)) {
    return numVal
  }
  return queryVal
}

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

  const applyQueryToStore = (queryVal: unknown, force = false) => {
    if (typeof queryVal === 'string') {
      const parsedVal = parseQueryValue(queryVal) as T

      if (force || parsedVal !== get()) {
        set(parsedVal)

        // Проверяем, изменилось ли значение после set
        // (например, из-за валидации в setter)
        const adjustedVal = get()
        if (adjustedVal !== parsedVal && adjustedVal !== null) {
          // Автоматически обновляем query, если set скорректировал значение
          replaceRouterQueue(fullKey, adjustedVal)
        }
      }
    } else if (queryVal === undefined) {
      // Query параметр отсутствует
      const storeVal = get()
      if (storeVal !== null) {
        // Store не пустой → синхронизируем его в URL
        replaceRouterQueue(fullKey, storeVal)
      }
    }
  }

  const syncStoreToQuery = (newVal: T | null) => {
    const currentQueryVal = route.value.query[fullKey]

    if (newVal === null) {
      if (currentQueryVal !== undefined) {
        replaceRouterQueue(fullKey, null)
      }
    } else {
      const queryString = String(newVal)
      if (currentQueryVal !== queryString) {
        replaceRouterQueue(fullKey, newVal)
      }
    }
  }

  onBeforeMount(() => {
    if (deps.length > 0) {
      watch(deps, () => applyQueryToStore(route.value.query[fullKey]))
    } else {
      applyQueryToStore(route.value.query[fullKey])
    }
  })

  watch(get, syncStoreToQuery)

  watch(
    () => route.value.query[fullKey],
    (newVal) => applyQueryToStore(newVal)
  )

  onBeforeUnmount(() => {
    replaceRouterQueue(fullKey, null)
  })
}
