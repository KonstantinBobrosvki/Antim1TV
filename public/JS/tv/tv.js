const tvId = +$('#tvId').val();

$(document).off('ajaxError');

const Player = {

    isFetchingNew: false,

    AttempsWithError: 0,

    CurrentVideo: {
        url: null,
        pos: 1,
        set position(pos) {
            if (isNaN(pos))
                return;
            if (pos < 1)
                return;

            this.pos = pos;
            $('#video-position').text(pos)

        },
        get position() {
            return this.pos
        }

    },

    History: [],

    LoadFirst() {

        this.FetchNVideo(1).then(data => {
            this.AttempsWithError = 0;
            this.StartVideo(data.video)
        }).catch(err => this.Work(err))
    },

    LoadPrevious() {
        this.FetchNVideo(this.CurrentVideo.position - 1).then(data => {
            this.AttempsWithError = 0;
            this.StartVideo(data.video)
        }).catch(err => this.Work(err))

    },

    LoadNext() {
        this.FetchNVideo(this.CurrentVideo.position + 1).then(data => {
            this.StartVideo(data.video)
        }).catch(err => this.Work(err))
    },

    LoadNewest() {
        this.isFetchingNew = true
        const me = this;
        $.ajax({
            type: "POST",
            url: `${window.location.pathname}/GetNewestVideo`,
            data: { tvId: tvId, played: this.CurrentVideo.position },
            success: function (data) {
                if (data.video) {
                    $('#player-overlay').addClass('d-none')
                    me.StartVideo(data.video)
                }
            },
            error: function (error) {
                if (error.responseJSON.Errors.includes('Няма видеа в опашката')) {
                    AddErrors(['Няма нови видеа'])
                    me.AttempsWithError++;
                }
                me.Work(error)
            }
        });
    },

    //n is position
    async FetchNVideo(n) {
        this.isFetchingNew = false;
        const pp = this;
        this.YoutubePlayer.stopVideo()
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "GET",
                url: `${window.location.pathname}/GetPlayedVideo`,
                data: { tvId: tvId, played: n },
                success: function (data) {
                    if (data.video) {
                        console.log(data);
                        $('#player-overlay').addClass('d-none')
                        resolve(data);
                    }
                },
                error: function (error) {

                    pp.CurrentVideo.position = n
                    $('#player-overlay').removeClass('d-none')

                    reject(error)
                }
            });
        })
    },

    Work() {

        if (arguments.length != 0) {
            this.AttempsWithError++;
        }
        if (this.AttempsWithError > 10 && !this.isFetchingNew)
            this.isFetchingNew = true
        else if (this.AttempsWithError > 10) {
            return;
        }

        this.isFetchingNew ? this.LoadNewest() : this.LoadNext();
        $('#player-overlay').addClass('d-none')
    },

    Pause() {
        this.YoutubePlayer.pauseVideo()
        $('#PlayerStateToogler').children('span').text('Пусни')
        $('#PlayerStateToogler').children('i.bi-pause-btn').addClass('d-none')
        $('#PlayerStateToogler').children('i.bi-play-btn').removeClass('d-none')

    },
    Play() {
        this.YoutubePlayer.playVideo()
        $('#PlayerStateToogler').children('span').text('Стоп')
        $('#PlayerStateToogler').children('i.bi-pause-btn').removeClass('d-none')
        $('#PlayerStateToogler').children('i.bi-play-btn').addClass('d-none')
    },

    UpVolume() {
        this.SetVolume(this.YoutubePlayer.getVolume() + 5 >= 100 ? 100 : this.YoutubePlayer.getVolume() + 5)
    },
    DownVolume() {
        this.SetVolume(this.YoutubePlayer.getVolume() - 5 <= 0 ? 0 : this.YoutubePlayer.getVolume() - 5)

    },
    SetVolume(value) {
        this.YoutubePlayer.setVolume(value)
    },

    TooglePlayerState() {
        if (this.YoutubePlayer.getPlayerState() == 1)
            return this.Pause()

        this.Play();
    },

    YoutubePlayer: null,

    StartVideo(video) {
        this.AttempsWithError = 0;
        console.log(video);
        this.CurrentVideo.position = video.played
        this.YoutubePlayer.loadVideoById(video.video.videoLink)
    },

    async Bootstrap() {
        this.LoadFirst()
    }



}



$(window).on('load', function () {
    Player.YoutubePlayer = new YT.Player('player', {
        height: '240',
        width: '300',
        events: {
            onReady: onPlayerReady,
            onStateChange: onStateChange,
            onError: onError
        },
        playerVars: {
            'cc_lang_pref': 'bg',
            'cc_load_policy': 1,
            'disablekb': 1,
            'autoplay': 1
        },

    });
});

function onPlayerReady(event) {
    Player.Bootstrap();
}

function onStateChange(event) {

    switch (event.data) {
        /*
-1 (unstarted)
0 (ended)
1 (playing)
2 (paused)
3 (buffering)
5 (video cued)
        */

        //On finish
        case 0:
            console.log('video ended');
            Player.Work();
            break;

        default:
            // console.log(event)
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
            break;
        case 150:
            console.log('Uploader has blocked this content from embedded playback')
            break
        default:
            console.log('error code: ' + event.data)

    }
}

function ButtonControllClick(button) {
    const act = $(button).attr('data-action')

    switch (act) {
        case 'Stop':
            console.log('pause');
            break;

        default:
            Player[act]();
            break;
    }
}

