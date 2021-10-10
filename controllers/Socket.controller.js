const Actions = require('../models/enums/Actions.enum');
const { sequelize, Users, Rights, Priorities, Videos, AllowedVideos, UserVideoVotes } = require('../models/Models')

const { Op } = require('sequelize')

const Errors = require('../Errors/index.error');
const tvService = require('../services/tv.service');
const JWTService = require('../services/JWT.service');


class SocketController {

    async SocketHandling(client) {
        //TODO: check which tv should be controlled
        const cookies = parseCookies(client.handshake)

        try {
            const token = await JWTService.ReadToken(cookies.access)
            if (!token.user.rights.includes(Actions.ControllPlayer)) {
                console.log('ne manqk');
                return client.disconnect()
            }

        } catch (error) {
            console.log('ne manqk');
            return client.disconnect()
        }

        console.log('Golqm manqk');

        client.on('sendAction', function (action) {
            client.broadcast.emit('receiveAction', { action })
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