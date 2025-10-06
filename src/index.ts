import type { App } from 'vue'
import type { Router } from 'vue-router'
import { setRouter } from './router'

export * from './composables/useQuerySync'
export * from './utils/replaceRouterQueue'
export * from './router'
export * from './types/index'

export default {
  install(app: App, options: { router: Router }) {
    setRouter(options.router)
  }
}
