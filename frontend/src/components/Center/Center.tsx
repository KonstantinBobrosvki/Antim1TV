import { FC } from 'react'
import './center.sass'
type props = {
    className?: string
}
export const Center: FC<props> = ({ children, className = '' }) => (<span className={'center-container ' + className}>{children}</span>)
