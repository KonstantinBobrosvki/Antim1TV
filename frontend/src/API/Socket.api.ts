import io, { Socket } from 'socket.io-client';
import { StateDto } from '../../../backend/src/players/dto/state.dto'
import { ActionDto } from '../../../backend/src/players/dto/action.dto'
import { Actions } from '../shared/ActionsEnum';

class SocketApi {
    private socket: Socket;
    private tvId: number;
    private callbacks: {
        'receiveAction': Function[],
        'receiveState': Function[]
    } = {
            'receiveAction': [],
            'receiveState': []
        }

    constructor(tvId: number, bearer: string) {
        this.socket = io({
            extraHeaders: {
                authorization: "Bearer " + bearer,
                tvId: tvId.toString()
            }
        });
        this.tvId = tvId
        this.socket.connect();
        (Object.keys(this.callbacks) as Array<keyof typeof this.callbacks>).forEach(key => {

            this.socket.on(key, (data) => {
                this.callbacks[key].forEach(func => {
                    func(data);
                });
            })
        })
    }

    public Close(): void {
        this.socket.close();
    }

    public SendState(state: StateDto): void {
        this.socket.emit('shareState', state)
    }
    public SendAction(action: Actions, tvId: number = this.tvId) {
        this.socket.emit('sendAction', {
            queueId: tvId,
            action
        })
    }

    public clearCallbacks(key: 'receiveAction' | 'receiveState') {
        if (key in this.callbacks) {
            (this.callbacks as any)[key] = []
        }
    }

    public addReceiveActionCallback(callback: (a: ActionDto) => any) {
        this.callbacks.receiveAction.push(callback);
    }
    public addReceivereceiveStateallback(callback: (a: StateDto) => any) {
        this.callbacks.receiveState.push(callback);
    }

}

export default SocketApi