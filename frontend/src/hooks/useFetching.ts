import { AxiosError } from "axios";
import { useState, useEffect } from "react";

type fetchError<T> = {
    status: number,
    body: T | {
        message: string
    }
}
export const useFetching = <ResponseType = any, ErrorType = void>(fetcher: Promise<ResponseType>, deps: Array<any> = []) => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<fetchError<ErrorType>>()
    const [result, setResult] = useState<ResponseType>()
    useEffect(() => {
        let notDemounted = true;

        fetcher.then(res=>notDemounted && setResult(res)).catch(err => {
            if (!notDemounted)
                return;
            const error = err as AxiosError;
            if (error.response) {

                setError({ status: error.response.status, body: error.response.data.message })

            } else if (error.request) {
                setError({ status: 500, body: { message: 'Не е получен отговор от сървъра' } })

                console.log(error.request);
            } else {
                setError({ status: 500, body: { message: 'Не успяхме да пратим запитване до сървъра' } })

                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
        }).finally(() => notDemounted && setIsLoading(false))

        return () => {
            notDemounted = false;
        }
    }, deps)


    return { result, isLoading, error }
}