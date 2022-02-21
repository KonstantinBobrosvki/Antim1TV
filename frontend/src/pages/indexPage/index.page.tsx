import { IPage } from "../type"
import { CatRandom } from "../../components/randomCat/randomCat";
import './index.page.sass'
import { HouseDoorFill } from 'react-bootstrap-icons'
export const IndexPage: IPage = Object.assign(() => (<div className="index-page">
    <CatRandom />
</div>)
    ,
    {
        checkAccess: () => true,
        path: '/',
        pageName: (<><HouseDoorFill /> Начало</>),
        showable: true
    }

)


