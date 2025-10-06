# vue-router-query-sync

![demo](src/assets/demo.gif)

> Effortlessly sync Vue Router query parameters with your store or local refs — no boilerplate.

[![npm version](https://img.shields.io/npm/v/vue-router-query-sync.svg)](https://www.npmjs.com/package/vue-router-query-sync)
[![license](https://img.shields.io/npm/l/vue-router-query-sync.svg)](LICENSE)

---

## ✨ What is this?

`vue-router-query-sync` is a tiny, fully-typed Vue 3 utility that keeps your reactive state
(Pinia store fields or local refs) in sync with the current URL query string — both ways.

- Changes in your store update the URL query.
- Changes in the URL query update your store.
- Batched updates to avoid excessive router.replace calls.

---

## ✅ Requirements

- Vue 3 (`vue@^3.3.13`)
- Vue Router 4 (`vue-router@^4.0.3`)

---

## 🚀 Installation

```bash
npm install vue-router-query-sync
# or
yarn add vue-router-query-sync
# or
pnpm add vue-router-query-sync
```

---

## ⚙️ Setup

```ts
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routerQuerySync from 'vue-router-query-sync'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: []
})

createApp(App)
  .use(router)
  .use(routerQuerySync, { router })
  .mount('#app')
```

---

## 🧩 Basic Usage

Sync a value with a query param named `tab`:

```ts
import { useQuerySync } from 'vue-router-query-sync'
import { ref } from 'vue'

const tab = ref<'favorite' | 'all'>('all')

useQuerySync(
  'tab',
  () => tab.value,
  (val) => (tab.value = val)
)
```

Now:
- Visiting `?tab=favorite` sets `tab.value = 'favorite'`.
- Changing `tab.value = 'all'` updates the URL to `?tab=all`.

---

## 🔧 API

```ts
function useQuerySync<T extends string | number>(
  key: string,
  get: () => T | null,
  set: (val: T) => void,
  options?: QuerySyncOptions
): void

type QuerySyncOptions = {
  deps?: Ref<unknown>[]
  context?: string
}
```

- **key**: Query parameter name, e.g., `'tab'`.
- **get**: Function returning the current value from your store/ref. Return `null` to indicate “no value”.
- **set**: Function that writes the value to your store/ref.
- **options.deps**: Array of refs. If provided, the initial sync runs after any of these deps change (useful when state is populated asynchronously).
- **options.context**: If the same query key may be used multiple times on the same page, provide a unique context to avoid collisions. The actual query key becomes `${context}_${key}`.

---

## ❗ Important

If a page can have multiple components with the same query key, pass a unique `context` to avoid conflicts.
The real key used in the URL will be `${context}_${key}`. Otherwise, use unique keys per component.

---

## 🏷️ Context Example

If two widgets on the same page need a `tab` param, use unique contexts:

```ts
useQuerySync('tab', () => usersStore.tab, (v) => (usersStore.tab = v), { context: 'users' })
useQuerySync('tab', () => ordersStore.tab, (v) => (ordersStore.tab = v), { context: 'orders' })
// URL keys will be: users_tab and orders_tab
```

---

## ⏳ Delayed/Dependent Initialization

If your state becomes available later (e.g., after a request), delay the initial sync with `deps`:

```ts
const isReady = ref(false)

useQuerySync('sort', () => store.sort, (v) => (store.sort = v), { deps: [isReady] })

// Later when data is loaded:
isReady.value = true
```

---

## 📦 Exports

```ts
import routerQuerySync, { useQuerySync, replaceRouterQueue } from 'vue-router-query-sync'
```

- **default**: Vue plugin to register with `app.use(routerQuerySync, { router })`.
- **useQuerySync**: The composable described above.
- **replaceRouterQueue**: Internal helper that batches query updates (exported in case you need manual batching).

Note: `setRouter/getRouter` are internal; prefer using the plugin install.

---

## 🔒 TypeScript

`useQuerySync` is fully typed. You can annotate the expected type if needed:

```ts
useQuerySync<number>('page', () => page.value, (v) => (page.value = v))
```

Values must be `string` or `number`.

---

## 📄 License

MIT © Ivan Chikachev


