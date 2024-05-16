import { AxiosError } from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../../../API/auth.api';
import { useAppDispatch } from '../../../hooks/redux';
import { alertsSlice } from '../../../store/reducers/alertsSlice';
import { userSlice } from '../../../store/reducers/userSlice';
import './authForm.sass'

export const SignInForm = () => {
    const [password, setpassword] = useState<string>('');
    const [credit, setCredit] = useState<string>('');
    const dispatch = useAppDispatch();
    const navigate=useNavigate()
    const onSubmit = async (event: React.MouseEvent<HTMLInputElement>) => {
        event.stopPropagation();

        try {
            const user = await AuthApi.SignIn(credit, password)
            dispatch(userSlice.actions.login(user))
            setTimeout(() => navigate('/users/me'),10)

        } catch (error) {
            const status = (error as AxiosError).response?.status
            const message: string = (error as AxiosError).response?.data.message
            dispatch(alertsSlice.actions.add({ type: 'danger', message }))
           
        }
    }

    return (
        <form action="/enter/login" name="login" method="POST">
            <p className="text-muted"> Моля въведете име или email и парола!</p>
            <input value={credit} onChange={(event) => setCredit(event.target.value)} type="text" name="usernameOrEmail" placeholder="Име или email" />
            <input type="password" value={password} onChange={(event) => setpassword(event.target.value)} name="password" placeholder="Парола" />
            <input onClick={onSubmit} type="button" name="" value="Login" />
        </form>
    )
}