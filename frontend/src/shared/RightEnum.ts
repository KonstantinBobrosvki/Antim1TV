//Copy of same file in backend

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

export const RightsEnumTranslated = {
    1: "Предложи контент",
    2: 'Одобри видео',
    8: 'Промени приоритет',
    16: 'Изтрий потребител',
    //That means control youtube frame with websockets
    32: 'Контролирай опашката',
    //Change rights of some user
    64: 'Промени права',
    128: 'Промени телевизори'
}
