export enum RightsEnum {
    Suggest = 1,
    AllowVideo = 2,
    ChangePriority = 8,
    BanUser = 16,
    //That means control youtube frame with websockets
    ControllPlayer = 32,
    //Change rights of some user
    ChangeRight = 64,
    //add or remove tv
    ChangeTv = 128,
}
