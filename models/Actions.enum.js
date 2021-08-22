//Describes actions that user can do
const Actions = {
    Suggest: '1',
    AllowVideo: '2',
    AllowAds: '4',
    ChangePriority: '8',
    BanUser: '16',
    //That means control youtube frame with websockets
    ControllPlayer: '32',
    //Change rights of some user
    ChangeRight: '64',
    AllowQuote: '128'
}

Object.freeze(Actions);

module.exports = Actions