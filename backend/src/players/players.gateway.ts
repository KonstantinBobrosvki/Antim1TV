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

@WebSocketGateway({ transport: ['socket.io'], cors: true })
export class PlayersGateway implements OnGatewayConnection {
    constructor(private readonly jwtService: JwtService) { }

    handleConnection(client: Socket, ...args: any[]) {

        const close = () => {
            client.emit('logout', 'Не сте влезли или нямате нужните права');
            client.disconnect(true);
        };
        if (!client.handshake.headers.authorization) {
            close();
            return
        }
        const authHeader = client.handshake.headers.authorization;
        if (!authHeader) {
            close();
            return
        }


        try {
            const [bearer, token] = authHeader.split(' ');

            if (bearer == 'Bearer' && token) {
                const user = this.jwtService.verify<UserDto>(token);
                if (!user.rights.includes(RightsEnum.ControllPlayer)) {
                    close();
                    return
                }

            }
            else{
                close();
                return
            }
        } catch (error) {
            close();
            return
        }

        const tvId = +client.handshake.headers.tvid;
        if (isNaN(tvId)) {
            close();
            return
        }
        
        client.join(tvId.toString());
    }

    @SubscribeMessage('sendAction')
    sendAction(@MessageBody() data: ActionDto, @ConnectedSocket() client: Socket) {
        console.log(data);
        
        client.to(data.queueId.toString()).emit('receiveAction', data);
    }

    @SubscribeMessage('shareState')
    shareState(@MessageBody() data: StateDto, @ConnectedSocket() client: Socket) {
        console.log(data);

        client.to(data.CurrentVideo.video.queueId.toString()).emit('receiveState', data);
    }
}
