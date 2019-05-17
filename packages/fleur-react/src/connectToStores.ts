import { ComponentContext, StoreClass } from '@ragg/fleur'
import * as React from 'react'

import { useStore } from './useStore'
import { WithRef } from './WithRef'

export type StoreGetter = ComponentContext['getStore']

type StoreToPropMapper<P, T> = (getStore: StoreGetter, props: P) => T

type ConnectedComponent<Props, MappedProps> = React.ComponentType<
  WithRef<Pick<Props, Exclude<keyof Props, keyof MappedProps>>>
>

const connectToStores = <Props, MappedProps = {}>(
  stores: StoreClass[],
  mapStoresToProps: StoreToPropMapper<Props, MappedProps>,
) => <ComponentProps extends object>(
  Component: React.ComponentType<ComponentProps>,
): ConnectedComponent<ComponentProps, MappedProps> => {
  return React.forwardRef((props: any, ref) => {
    const mappedProps = useStore(stores, getStore =>
      mapStoresToProps(getStore, props),
    )

    console.log(mappedProps)
    return React.createElement(Component, { ref, ...props, ...mappedProps })
  })
}

export { connectToStores as default }
