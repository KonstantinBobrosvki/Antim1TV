const Actions = require('../models/enums/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')

const { Op } = require('sequelize')

const Errors = require('../Errors/index.error');
const tvService = require('../services/tv.service');
const JWTService = require('../services/JWT.service');


class SocketController {

    async SocketHandling(client) {
        const cookies = parseCookies(client.handshake)

        try {
            const token = await JWTService.ReadToken(cookies.access)
            if (!token.user.rights.includes(Actions.ControllPlayer)) {
                return client.disconnect()
            }

        } catch (error) {
            return client.disconnect()
        }

        const addres = client.handshake.headers.referer;
        const regex = new RegExp('\/tv\/([0-9]*)')

        const match = addres.match(regex)
        if (!match || (!match[1] || isNaN(match[1]))){
            return client.disconnect()
        }

        const tvId=match[1]

        client.join(tvId)


        client.on('sendAction', function (action) {
            client.to(tvId).emit('receiveAction', { action })
        });

        client.on('sendState', function (state) {
            client.to(tvId).emit('ReceiveState', { state })
        });

        

    }
}


function parseCookies(request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

module.exports = new SocketController();