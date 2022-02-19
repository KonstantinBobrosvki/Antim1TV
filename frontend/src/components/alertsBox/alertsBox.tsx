import { useAppSelector } from '../../hooks/redux'
import './alertsBox.sass'

export const AlertsBox = () => {

    const errors = useAppSelector(state => state.alertsReducer.alerts);

    return (<div id="MessagesArea">
        {errors.map(error =>
        (<div key={error.id} className={`flash alert alert-${error.type} ${error.type == 'danger' ? 'error-hide' : 'message-hide'}`} role="alert">
            {error.message}
        </div>)
        )}

    </div>)
}