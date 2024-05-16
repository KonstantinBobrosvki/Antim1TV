import { useState, ChangeEvent, useEffect } from "react"
import { Col, Container, Form } from "react-bootstrap"
import useDebounce from "../../../hooks/useDebounce"
import { RightsEnum } from "../../../shared/RightEnum"
import { UserState } from "../../../store/reducers/userSlice"
import { IPage } from "../../type"
import UsersTable from "./usersTable"

const ModerateUsersPage: IPage = Object.assign(() => {

    const [searchInput, setValue] = useState<string>('')

    const debouncedValue = useDebounce<string>(searchInput, 500)


    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)

    }

    useEffect(() => {
        window.document.title = 'Други потребители'
    }, [])

    return (<Container>
        <Col xs={12} md={{ offset: 3, span: 6 }}>
            <Form>
                <Form.Label>Как се казва потребителя, когото търсите?</Form.Label>
                <Form.Control className="bg-dark text-light rounded" type="text" onChange={handleChange} />
            </Form>
        </Col>
        <UsersTable searchPattern={debouncedValue} />
    </Container>)
},
    {
        checkAccess: (state: UserState): boolean => state.authed && (
            state.user?.user.rights.includes(RightsEnum.BanUser) as boolean ||
            state.user?.user.rights.includes(RightsEnum.ChangePriority) as boolean ||
            state.user?.user.rights.includes(RightsEnum.ChangeRight) as boolean),
        path: '/users',
        pageName: (<>Други потребители</>),
        showable: true
    })

export default ModerateUsersPage