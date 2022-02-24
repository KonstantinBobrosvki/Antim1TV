import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";

type fetchError<T> = {
    status: number,
    body: T | {
        message: string
    }
}
export const useFetching = async <ErrorType = void>(fetcher: (...args: any[]) => Promise<AxiosResponse>) => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<fetchError<ErrorType>>()
    const [result, setResult] = useState()

    const response = fetcher().then(res => res.data).then(setResult).catch(err => {
        const error = err as AxiosError;
        if (error.response) {

            setError({ status: error.response.status, body: error.response.data })

        } else if (error.request) {
            setError({ status: 500, body: { message: 'Не е получен отговор от сървъра' } })

            console.log(error.request);
        } else {
            setError({ status: 500, body: { message: 'Не успяхме да пратим запитване до сървъра' } })

            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
    }).finally(() => setIsLoading(false))

    return { result, isLoading, error }
}