import { FC, LegacyRef, memo, useEffect, useRef, useState } from "react"
import { UserDto } from "../../../../../backend/src/users/dto/user.dto"
import { RightsEnum, RightsEnumTranslated } from "../../../shared/RightEnum"
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Tooltip, OverlayTrigger, Row, Modal } from "react-bootstrap";
import './UserRows.sass'
import { ArrowDown, ArrowUp } from "react-bootstrap-icons";
import { Center } from "../../../components/Center/Center";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import UsersApi from "../../../API/Users.api";
import { alertsSlice } from "../../../store/reducers/alertsSlice";
import { ExcepionHandler } from "../../../shared/helpers";

type UserRowProps = {
    user: UserDto,
    onSelfChange: (changedUser: UserDto) => any
    onSelfDelete: (changedUser: UserDto) => any
}

type UserRightsProps = {
    rights: RightsEnum[]
    renderDeleteButton?: boolean
    onRightDelete: (right: RightsEnum) => any
}
type UserPriorityProps = {
    priority: number,
    onChange: (newPrior: number) => any
}

type NewRightModalProps = {
    onSelect: (right: RightsEnum | '') => any,
    alreadyGiven: RightsEnum[],
    show: boolean
}

type BanUserModalProps = {
    onConfirm: (should: boolean) => any
    show: boolean
}



const UserRights: FC<UserRightsProps> = ({ rights, renderDeleteButton = false, onRightDelete }) => {
    return (
        <Row as='ul' className="rights-container">
            {
                rights.map(right =>
                (<Col as='li' className='right' key={right}>
                    <span>{RightsEnumTranslated[right]}</span>
                    {renderDeleteButton && <Button variant="danger" onClick={() => onRightDelete(right)}>Изтрий</Button>}
                </Col>
                ))
            }
        </Row>
    )
}

const UserPriority: FC<UserPriorityProps> = ({ priority, onChange }) => {
    return (
        <>
            <div className="priority-container">
                <Center>
                    Текущ:{priority}
                </Center>
                <Row>
                    <Button className='priority-change-button' onClick={() => onChange(priority + 1)}>
                        <OverlayTrigger
                            overlay={
                                <Tooltip >
                                    Увеличи приоритет.
                                </Tooltip>
                            }>
                            <ArrowUp />
                        </OverlayTrigger>
                    </Button>
                    <Button className='priority-change-button' onClick={() => onChange(priority - 1)}>
                        <OverlayTrigger
                            overlay={
                                <Tooltip >
                                    Понижи приоритет.
                                </Tooltip>
                            }>
                            <ArrowDown />
                        </OverlayTrigger>
                    </Button>

                </Row>
            </div>
        </>
    )
}

const NewRightModal: FC<NewRightModalProps> = ({ alreadyGiven, onSelect, show }) => {
    const ref = useRef() as any
    console.log(alreadyGiven);

    const onSubmit = () => {
        const value = ref?.current?.value
        onSelect(value)

    }
    return (<Modal show={show}>
        <Modal.Dialog>
            <Modal.Header>
                <Modal.Title>Добави ново право</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <select ref={ref}>
                    <option value={''}>Списък</option>
                    {Object.keys(RightsEnum).filter(k => !isNaN(+k)).filter(k => !alreadyGiven.includes(+k)).map(key =>
                        (<option key={key} value={key}>{RightsEnumTranslated[key as unknown as RightsEnum]}</option>)
                    )}
                </select>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => onSelect('')}>Затвори</Button>
                <Button variant="primary" onClick={onSubmit}>Подтвърди</Button>
            </Modal.Footer>
        </Modal.Dialog>
    </Modal>)
}

const BanUserModal: FC<BanUserModalProps> = ({ show, onConfirm }) => {
    return (<Modal show={show}>
        <Modal.Dialog>
            <Modal.Header>
                <Modal.Title>Изтриване на потребител</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h2>Тази операция е необратима</h2>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={() => onConfirm(false)}>Затвори</Button>
                <Button variant="danger" onClick={() => onConfirm(true)}>Подтвърди</Button>
            </Modal.Footer>
        </Modal.Dialog>
    </Modal>)
}

const UserRow: FC<UserRowProps> = ({ user: propsedUser, onSelfChange, onSelfDelete }) => {
    const [user, setUser] = useState(propsedUser);
    const [isRightModalOpened, setIsRightModalOpened] = useState(false)
    const [isBanModalOpened, setIsBanModalOpened] = useState(false)

    useEffect(() => {
        onSelfChange(user)
    }, [user])

    const state = useAppSelector(state => state.userReducer.user);
    const access = state!.access;
    const me = state!.user
    const dispatch = useAppDispatch();

    const onRightDelete = (right: RightsEnum) => {
        UsersApi.DeleteRight(access, user.id, right).then(() => {
            dispatch(alertsSlice.actions.add({ type: 'info', message: 'Успешно изтрито' }))
            setUser({ ...user, rights: user.rights.filter(el => el != right) })
        })
            .catch(ExcepionHandler(dispatch))
    }

    const onPriorityChange = (value: number) => {
        console.log(value);
        UsersApi.ChangePriority(access, user.id, value).then(() => {
            dispatch(alertsSlice.actions.add({ type: 'info', message: 'Успешно сменено' }))
            setUser({ ...user, priority: value })
        })
            .catch(ExcepionHandler(dispatch))
    }

    const onNewRightAdd = (selected: RightsEnum | '') => {
        setIsRightModalOpened(false)
        if (selected === '')
            return;

        UsersApi.AddRight(access, user.id, selected).then(() => {
            dispatch(alertsSlice.actions.add({ type: 'info', message: 'Успешно добавено' }));
            setUser({ ...user, rights: [...user.rights, selected] })
        })
            .catch(ExcepionHandler(dispatch))
    }

    const onBanClick = (should: boolean) => {
        setIsBanModalOpened(false)
        if (!should)
            return;
        UsersApi.BanUser(access, user.id,).then(() => {
            dispatch(alertsSlice.actions.add({ type: 'info', message: 'Успешно блокиран' }));
            onSelfDelete(user);
        })
            .catch(ExcepionHandler(dispatch))
    }

    return (
        <tr className="user-row">
            <th scope="row">{user.id}</th>
            <td>
                <h2>{user.username}</h2>
                {me.rights.includes(RightsEnum.BanUser) && (<Button variant="danger" className="ban-user-button" onClick={() => setIsBanModalOpened(true)}>
                    Изтрий потребител
                </Button>)}
                {isBanModalOpened && <BanUserModal show={isBanModalOpened} onConfirm={onBanClick} />}

            </td>
            <td><UserPriority priority={user.priority} onChange={onPriorityChange} /></td>
            <td>
                <UserRights
                    rights={user.rights}
                    onRightDelete={onRightDelete}
                    renderDeleteButton={me.rights.includes(RightsEnum.ChangeRight)} />
                {me.rights.includes(RightsEnum.ChangeRight) && <Center><Button onClick={() => setIsRightModalOpened(!isRightModalOpened)}>Добави ново</Button></Center>}
                {isRightModalOpened && <NewRightModal show={isRightModalOpened} onSelect={onNewRightAdd} alreadyGiven={user.rights} />}
            </td>
        </tr >
    )
}

export default memo(UserRow)