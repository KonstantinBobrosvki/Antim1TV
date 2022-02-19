import { Tab, Tabs } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';
import './authForm.sass'
import { SignInForm } from "./signin";
import { SignUpForm } from "./signup";
export const AuthFrom = () => {

    return (
        <div className=" col-md-6 offset-md-3">
            <div className="forms-container">
                <Tabs
                    defaultActiveKey="singip"
                    className="justify-content-between mb-3 w-100 p-1"
                    variant='pills'
                    >
                    <Tab eventKey="singip" title="Влезни" tabClassName='tab-name-auth'>
                        <SignInForm />
                    </Tab>
                    <Tab eventKey="singup" title="Регистрирай се" tabClassName='tab-name-auth'>
                        <SignUpForm />
                    </Tab>

                </Tabs>
            </div>
        </div>
    )
}