import { FC } from 'react'
import { PropsWithStyle } from './PropsWithStyle'
export type StyledComponent<T = {}> = FC<PropsWithStyle<T>>