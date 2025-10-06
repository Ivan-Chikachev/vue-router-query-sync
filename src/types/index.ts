import { Ref } from 'vue'

export type QuerySyncOptions = {
  deps?: Ref<unknown>[]
  context?: string
}
