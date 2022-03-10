import { IPage } from "../type"
import { CatRandom } from "../../components/randomCat/randomCat";
import './index.page.sass'
import { HouseDoorFill } from 'react-bootstrap-icons'
import { useEffect } from "react";
export const IndexPage: IPage = Object.assign(() => {
    useEffect(() => {
        window.document.title = 'Антим 1 тв'
    }, [])
    return (<div className="index-page">
        <CatRandom />
    </div>)
}
    ,
    {
        checkAccess: () => true,
        path: '/',
        pageName: (<><HouseDoorFill /> Начало</>),
        showable: true
    }

)


