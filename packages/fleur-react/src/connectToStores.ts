import { ComponentContext, StoreClass } from '@ragg/fleur'
import * as React from 'react'

import withComponentContext from './withComponentContext'

type StoreToPropMapper<P, T> = (context: ComponentContext, props: P) => T

export interface StoreHandlerProps {
    mapStoresToProps: (...args: any[]) => any
    context: ComponentContext,
    stores: StoreClass[],
    childComponent: React.ComponentClass
}

interface StoreHandlerState {
    childrenProps: any
}

class StoreHandler extends React.PureComponent<StoreHandlerProps, StoreHandlerState> {
    public static getDerivedStateFromProps(nextProps: StoreHandlerProps, prevState: StoreHandlerState): StoreHandlerState {
        return {
            childrenProps: nextProps.mapStoresToProps(nextProps.context, prevState.childrenProps)
        }
    }

    public state: any = { childrenProps: {} }

    public componentDidMount(): any {
        const { context, stores, mapStoresToProps} = this.props

        stores.forEach(store => {
            context.getStore(store).on('onChange', () => {
                this.setState({ childrenProps: mapStoresToProps(context, this.props) })
            })
        })
    }

    public render(): any {
        const { childComponent } = this.props
        return React.createElement(childComponent, { ...this.state.childrenProps })
    }
}

const connectToStores = <Props, Mapped = {}>(stores: StoreClass[], mapStoresToProps: StoreToPropMapper<Props, Mapped>) => (
    <ComponentProps extends object>(Component: React.ComponentClass<ComponentProps>) => (
        class ConnectToStoreComponent extends React.PureComponent<Pick<ComponentProps, Exclude<keyof ComponentProps, keyof Mapped>>> {
            public render() {
                return (
                    React.createElement(withComponentContext(StoreHandler), {
                        mapStoresToProps,
                        stores,
                        childComponent: Component,
                    })
                )
            }
        }
    )
)

export { connectToStores as default }
