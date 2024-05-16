import { FC } from "react"
import './textLoader.sass'
type TextLoaderProps = {
    text?: string
}
export const TextLoader: FC<TextLoaderProps> = ({ children, text = '.' }) => {
    return (
        <>
            {children}
            <span style={{ ['--text' as any]: `"${text}"` }} className="text-loader-dots"></span>
        </>
    )
}