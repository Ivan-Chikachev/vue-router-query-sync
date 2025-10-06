import { onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { QuerySyncOptions } from '@/types'
import replaceRouterQueue from '@/utils/replaceRouterQueue'
import { getRouter } from '@/router'

/**
 * Синхронизирует значение из стора с query-параметром в адресной строке
 *
 * @param key - имя параметра в query, например "tab"
 * @param get - функция, возвращающая текущее значение из стора
 * @param set - функция, устанавливающая значение в стор
 * @param options.deps - список зависимостей, чтобы синхронизировать только после их изменения
 * @param options.context - конекст использования query-параметра, обязателен, если на странице нессколько одинаковых query-параметра
 *
 * ⚠️ Важно:
 * Если на одной странице может быть несколько компонентов с одинаковыми query-ключами —
 * обязательно передавайте уникальный `context`, чтобы не было конфликтов.
 * Или всегда использовать уникальные ключи (например вместо "page" - "usersPage").
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
