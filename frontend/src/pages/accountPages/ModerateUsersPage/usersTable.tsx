import { memo, FC, useState, useEffect } from "react"
import { Button, Row, Table } from "react-bootstrap"
import { UserDto } from "../../../types/user.dto"
import UsersApi from "../../../API/Users.api"
import { SimpleLoader } from "../../../components/Loaders/SimpleLoader/simpleLoader"
import { TextLoader } from "../../../components/Loaders/TextLoader/TextLoader"
import { useAppSelector } from "../../../hooks/redux"
import { useFetching } from "../../../hooks/useFetching"
import UserRow from "./userRow"

type UsersTableProps = {
    searchPattern: string;
}

const usersPerPage = 30;

const UsersTable: FC<UsersTableProps> = ({ searchPattern }) => {
    const token = useAppSelector(state => state.userReducer.user!.access)
    const [page, setPage] = useState(0)
    const { result, isLoading, error } = useFetching(UsersApi.GetUsers(token, searchPattern, usersPerPage * page, usersPerPage), [searchPattern, page])
    const [users, setUser] = useState(result)

    useEffect(() => {
        setUser(result)
    }, [result])

    const onUserChange = (user: UserDto) => {
        setUser(users?.map((el) => el.id != user.id ? el : user))
    }

    const onSelfDelete = (user: UserDto) => {
        setUser(users?.filter((el) => el.id != user.id))
    }

    if (isLoading)
        return (
            <>
                <TextLoader>Потребителите зареждат</TextLoader>
                <SimpleLoader />
            </>
        )

    return (
        <>
            <Table variant="dark" style={{ marginTop: '3em' }} responsive='md'>
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Име</th>
                        <th scope="col">Приоритет</th>
                        <th scope="col">Права</th>
                    </tr>
                </thead>
                <tbody>
                    {users?.map((user) => {
                        return (<UserRow user={user} key={user.id} onSelfChange={onUserChange} onSelfDelete={onSelfDelete} />)
                    })}
                </tbody>
            </Table>
            <Row className="justify-content-between">
                <Button className="w-25" onClick={() => setPage(page - 1 > 0 ? page - 1 : 0)}>Предишна страница</Button>
                <Button className="w-25" onClick={() => setPage(page + 1)}>Следваща страница</Button>
            </Row>
        </>)
}

export default memo(UsersTable)