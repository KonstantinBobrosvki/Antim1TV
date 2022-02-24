import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import './authForm.sass'

import { AuthApi } from '../../../API/auth.api';
import { AxiosError } from 'axios';
import { useAppDispatch } from '../../../hooks/redux';
import { userSlice } from '../../../store/reducers/userSlice';
import { alertsSlice } from '../../../store/reducers/alertsSlice';

export const SignUpForm = () => {
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('')
    const [errors, setError] = useState<Set<string>>(new Set())
    const dispatch = useAppDispatch();

    const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const message = 'Потребителското име трябва да е от 6 до 29 символа'
        setUsername(event.target.value)
        if (event.target.value.length < 6 || event.target.value.length > 29)
            errors.add(message)
        else
            errors.delete(message)
    }
    const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const messageEmail = 'Трябва да въведете email от abv, gmail или yandex'
        setEmail(event.target.value)
        if (!event.target.value.match(/(..*)@(abv\.bg|gmail\.com|yandex\.ru)$/i))
            errors.add(messageEmail)
        else
            errors.delete(messageEmail)
    }
    const onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const message = 'Паролата трябва да е от 7 до 63 символа'
        setPassword(event.target.value)
        if (event.target.value.length < 7 || event.target.value.length > 63)
            errors.add(message)
        else
            errors.delete(message)
    }


    const onSubmit = async (event: React.MouseEvent<HTMLInputElement>) => {
        event.stopPropagation();
        if (errors.size != 0) {
            dispatch(alertsSlice.actions.add({ type: 'danger', message: 'Моля прегледайте информацията!' }))

        }
        try {
            const user = await AuthApi.SignUp(username, email, password)
            dispatch(userSlice.actions.login(user))

        } catch (error) {
            const status = (error as AxiosError).response?.status
            const message: string = (error as AxiosError).response?.data.message
            dispatch(alertsSlice.actions.add({ type: 'danger', message }))
        }
    }

    return (
        <form name="signup" >
            <p className="text-muted"> Моля въведете име, email и парола!</p>
            <p className='d-flex flex-column align-items-center'>
                {
                    [...errors as any].map(error =>
                        (<span key={error} className='text-danger'>{error}</span>))
                }
            </p>
            <input value={username} onChange={onUsernameChange} type="text" name="username" placeholder="Име" />
            <input value={email} onChange={onEmailChange} type="text" name="email" placeholder="Email" />
            <input value={password} onChange={onPasswordChange} type="password" name="password" placeholder="Парола" />
            <input type="button" onClick={onSubmit} value="SingUp" />
        </form>
    )
}