const tvId = +$('#tvId').val();
let remotePlayerPosition = 1;
let player;
const GetNextVideo = CreateLocalqueue();

$(window).on('load', function () {
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
    console.log('onPlayerReady');

    player.loadVideoById(GetNextVideo())
}

function onStateChange(event) {

    switch (event.data) {
        //On finish
        case 0:
            console.log('onStateChange');
            player.loadVideoById(GetNextVideo())
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

function CreateLocalqueue() {
    //if there is no video
    const randomvids = ['jNQXAC9IVRw', 'H9154xIoYTA', 'qLGNj-xrgvY', 'Ay6K0_4ZZ_0', 'e9dZQelULDk', 'BE4oz2u6OHY'];

    let playlist = [];

    //for shifting que
    return function () {
        GetRemoteVideo().then(url => { playlist.push(url); }).catch((error) => { console.log(error); })
        const shifted = playlist.shift();
        if (shifted) {
            return shifted;
        }
        else {
            console.log('Local que');
            return randomvids[getRandomInt(0, randomvids.length)]
        }
    }
}

//Gets next video from remote server
async function GetRemoteVideo() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: `${window.location.pathname}/GetNextVideo`,
            data: { tvId:tvId, played: remotePlayerPosition },
            success: function (data) {
                remotePlayerPosition = ++remotePlayerPosition || 1
                if (data.Errors) {
                    console.log(data.Errors);

                    return reject(data.Errors)
                }
                if (data.Messages) {
                    console.log(data.Messages);
                }
                if (data.video) {
                    const video = data.video;
                    const videoUrl = video.video.videoLink;
                    console.log(video);
                    console.log(videoUrl);
                    resolve(videoUrl);
                }
            }
        });
    })

}