import type { Router } from 'vue-router'

let _router: Router | null = null

export function setRouter(router: Router) {
  _router = router
}

export function getRouter(): Router {
  if (!_router) {
    throw new Error(
      '[vue-router-query-sync] Router instance not set. Call setRouter(router) before using composables.'
    )
  }
  return _router
}
