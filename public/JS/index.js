let player;
let playlist = ['b_XKnkQZkOM', 'dnNt78eGjSM','3rtkCBmeA9A'];
let playlistIndex = 0;

$(window).on('load',function () {
    player = new YT.Player('player', {
        height: '240',
        width: '300',
        events: {
            onReady: onPlayerReady,
            onStateChange: onStateChange,
            onError: onError
        }
    });
});

function onPlayerReady(event) {
    player.loadVideoById(playlist[playlistIndex++])
}

function onStateChange(event) {

    switch (event.data) {
        //On finish
        case 0:
            player.loadVideoById(playlist[playlistIndex++])
            break;

        default:
            console.log('default')
            break;
    }

}

function onError(event) {
    switch (event.data) {
        case 2:
            console.log('request contains an invalid parameter value')
            break
        case 5:
            console.log('The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.')
            break
        case 100:
            console.log('The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.')
            break
        case 101:
        case 150:
            console.log('Uploader has blocked this content from embedded playback')
            break
        default:
            console.log('error code: ' + event.data)

    }
}
