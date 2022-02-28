import { FC } from "react"
import './simpleLoader.sass'
export const SimpleLoader: FC = ({ children }) => {
    return (<div className="simple-loader">
        {children}
    </div>)
}