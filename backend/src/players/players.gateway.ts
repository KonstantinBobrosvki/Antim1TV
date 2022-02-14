import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserDto } from '../users/dto/user.dto';
import { RightsEnum } from '../users/Models/Enums/rights.enum';
import { ActionDto } from './dto/action.dto';
import { StateDto } from './dto/state.dto';

@WebSocketGateway({ transport: ['socket.io'] })
export class PlayersGateway implements OnGatewayConnection {
    constructor(private readonly jwtService: JwtService) {}

    handleConnection(client: Socket, ...args: any[]) {
        const close = () => {
            client.emit('disconnect', 'Не сте влезли или нямате нужните права');
            client.disconnect(true);
        };
        if (!client.handshake.headers.authorization) {
            close();
        }
        const authHeader = client.handshake.headers.authorization;
        if (!authHeader) close();

        try {
            const [bearer, token] = authHeader.split(' ');

            if (bearer == 'Bearer' && token) {
                const user = this.jwtService.verify<UserDto>(token);
                if (!user.rights.includes(RightsEnum.ControllPlayer)) close();
            }
        } catch (error) {
            close();
        }

        const addres = client.handshake.headers.referer;
        const regex = new RegExp('/tv/([0-9]*)');

        const match = addres.match(regex);
        if (!match || !match[1] || isNaN(match[1] as any as number)) {
            return client.disconnect();
        }

        const tvId = match[1];

        client.join(tvId.toString());
    }

    @SubscribeMessage('sendAction')
    sendAction(@MessageBody() data: ActionDto, @ConnectedSocket() client: Socket) {
        client.to(data.queueId.toString()).emit('receiveAction', data);
    }

    @SubscribeMessage('shareState')
    shareState(@MessageBody() data: StateDto, @ConnectedSocket() client: Socket) {
        client.to(data.CurrentVideo.video.queueId.toString()).emit('receiveState', data);
    }
}
