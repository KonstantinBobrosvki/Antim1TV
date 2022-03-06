import { useEffect, useState } from "react"

const useDebounce = <T>(value: T, timeout: number = 500) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debounced != value)
                setDebounced(value)
        }, timeout)

        return () => {
            clearTimeout(timer)
        }
    }, [value, timeout])

    return debounced
}

export default useDebounce