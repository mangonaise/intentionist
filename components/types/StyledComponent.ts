import { FC } from 'react'
export type StyledComponent<T = {}> = FC<{ className?: string } & T>