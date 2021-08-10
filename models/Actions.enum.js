//Describes actions that user can do
const Actions = {
    Suggest: '1',
    AllowVideo: '2',
    AllowAds: '4',
    ChangePriority: '8',
    BanUser: '16'
}

Object.freeze(Actions);

module.exports = Actions