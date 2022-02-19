import { useEffect, useState } from "react"
import './randomcat.sass'
export const CatRandom = () => {
    const [catty, setCatty] = useState();
    useEffect(() => {
        fetch('https://api.thecatapi.com/v1/images/search')
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setCatty(data[0].url)
            });
    }, [])

    return (<img className="catty" src={catty} />)
}