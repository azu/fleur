import { Store, StoreClass } from '@fleur/fleur'
import { Operation, OperationArgs } from '@fleur/fleur/typings/Operations'
import { ActionIdentifier } from '@fleur/fleur'
import { MockStore } from './mockStore'

export class MockOperationContext {
  public dispatchs: { action: ActionIdentifier<any>; payload: any }[] = []
  private stores: MockStore[] = []

  constructor(stores: MockStore[]) {
    this.stores = stores
  }

  public async executeOperation<O extends Operation>(
    operation: O,
    ...args: OperationArgs<O>
  ): Promise<void> {
    await Promise.resolve(operation(this as any, ...args))
  }

  public getStore<T extends StoreClass<any>>(StoreClass: T): InstanceType<T> {
    if (!StoreClass.storeName || StoreClass.storeName === '')
      throw new Error(`Store.storeName must be defined in ${Store.name}`)

    const store = this.stores.find(entry => entry.name === StoreClass.storeName)
    if (!store) throw new Error(`Store \`${StoreClass.storeName}\` not found`)

    return store.store as any
  }

  public dispatch<AI extends ActionIdentifier<any>>(
    action: AI,
    payload: ReturnType<AI>,
  ): void {
    this.dispatchs.push({ action, payload })
    this.stores.forEach(({ store }) => {
      Object.keys(store)
        .filter(
          key =>
            (store as any)[key] != null && (store as any)[key].__fleurHandler,
        )
        .forEach(key => {
          if ((store as any)[key].__action === action) {
            ;(store as any)[key].producer(payload)
          }
        })
    })
  }
}

export const mockOperationContext = (options: {
  stores: MockStore[]
}): MockOperationContext => {
  return new MockOperationContext(options.stores)
}
