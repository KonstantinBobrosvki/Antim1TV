const tvId = +$('#tvId').val();

const socket = io();

Handlebars.registerHelper('PlayerStateToText', function (value) {

    const translate = ['не започнало', 'приключило', 'вървящо', 'паузирано', 'буферизация', 'в опашка']

    return translate[value + 1]
});

const statesTemplate = Handlebars.compile($('#tv-state-cards').html())

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
        console.log(this.AttempsWithError);
        if (arguments.length != 0) {
            this.AttempsWithError++;
        }
        if (this.AttempsWithError == 10 && !this.isFetchingNew)
            this.isFetchingNew = true
        else if (this.AttempsWithError == 12) {
            console.log('11 bati');
            AddErrors(['Няма нови видеа. Otiwam kum purwoto']);
            this.isFetchingNew = false
            this.LoadFirst()
            return;
        } else if (this.AttempsWithError > 12) {
            AddErrors(['Спирам да работя.']);
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
    GetVolume() {
        return this.YoutubePlayer.getVolume()
    },

    ToogleMute() {
        //Yes checks have logic, trust me
        if (this.YoutubePlayer.isMuted()) {
            this.YoutubePlayer.unMute();
            $('#ToogleMuteButton span:nth-child(1)').text('Изключи звук')
            $('#ToogleMuteButton span:nth-child(3)').addClass('d-none')
            $('#ToogleMuteButton span:nth-child(4)').removeClass('d-none')
        } else if (!this.YoutubePlayer.isMuted()) {
            this.YoutubePlayer.mute();
            $('#ToogleMuteButton span:nth-child(1)').text('Включи звук')
            $('#ToogleMuteButton span:nth-child(3)').removeClass('d-none')
            $('#ToogleMuteButton span:nth-child(4)').addClass('d-none')
        }
    },

    TooglePlayerState() {
        if (this.YoutubePlayer.getPlayerState() == 1) {
            console.log('pause');
            return this.Pause()
        }


        this.Play();
    },

    YoutubePlayer: null,

    StartVideo(video) {
        this.AttempsWithError = 0;
        console.log(video);
        this.CurrentVideo.position = video.played
        this.CurrentVideo.url = video.video.videoLink
        this.YoutubePlayer.loadVideoById(video.video.videoLink)
        this.Play();
    },

    async Bootstrap() {
        this.LoadFirst()
    },

    GetState() {
        return {
            Volume: this.YoutubePlayer.getVolume(),
            IsMuted: this.YoutubePlayer.isMuted(),
            CurrentVideoID: this.CurrentVideo.url,
            CurrentVideoPosition: this.CurrentVideo.position,
            PlayerState: this.YoutubePlayer.getPlayerState(),
            Seconds: this.YoutubePlayer.getCurrentTime(),
            Name: $('input[name="tvName"]').val()
        }
    }



}



$(window).on('load', function () {
    const onPlayerReady = (event) => {
        console.log('ready player');
        Player.Bootstrap();
    }

    const onStateChange = (event) => {

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

    const onError = (event) => {
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
        videoId: 'd5zqQtlbSJI'
    });

    StartUpSocket()

    console.log('Before');

    StartSchedule();
    //one day
    setInterval(StartSchedule, 1000 * 60 * 60 * 24);


});

function StartUpSocket() {

    socket.on('receiveAction', ({ action }) => {
        // 
        console.log(action);

        DoAction(true, action)


    })
    let states = []
    socket.on('ReceiveState', ({ state }) => {
        states.push(state)

        states.reverse()


        states = states.filter((value, index, self) => {
            return self.findIndex(v => v.Name === value.Name) === index;
        })

        const html = statesTemplate({ states });
        console.log(html);
        $('#StatesReults').html(html)



    })



}


function ButtonControllClick(button) {
    const act = $(button).attr('data-action')
    socket.emit('sendAction', act)

    DoAction(false, act)

}

function DoAction(isRemovedCommand, action) {

    switch (action) {
        case 'RefreshPage':
            if (isRemovedCommand)
                window.location.reload(true);
            else {
                $('#RefreshPageButton div.bi').toggleClass('rotate-360')
            }
            break;
        case 'GetStates':
            if (isRemovedCommand)
                socket.emit('sendState', Player.GetState())
            else {

            }
            break;

        default:
            if (Player[action]) {
                Player.YoutubePlayer.unMute();
                Player[action]();
            }
            else
                console.log('SHTO NE BACHKASH KUFTE OT PLUH');
            break;
    }

}


function StartSchedule() {
    console.log('Started schedule ');
    const OnStartOfLesson = () => {
        console.log('start of lesson');
        if (Player.GetVolume() >= 10)
            Player.SetVolume(10)
    }

    const OnEndOfLesson = () => {
        console.log('end of lesson');

        if (Player.GetVolume() <= 60)
            Player.SetVolume(60)
    }

    const schedule = new Shared.Schedule();


    const lessonsTime = [
        { start: '8:00', end: '8:40' },
        { start: '8:50', end: '9:30' },
        { start: '9:40', end: '10:20' },
        { start: '10:40', end: '11:20' },
        { start: '11:30', end: '12:10' },
        { start: '12:20', end: '13:00' },
        { start: '13:10', end: '13:50' }
    ]

    /* lessonsTime.forEach(el => {
         el.start = Number(el.start.split(':')[0]) + 11 + `:${el.start.split(':')[1]}`
         el.end = Number(el.end.split(':')[0]) + 11 + `:${el.end.split(':')[1]}`
     })
    */
    console.log(lessonsTime);

    const lessonsDates = lessonsTime.map(el => {
        const start = new Date();
        start.setHours(el.start.split(':')[0])
        start.setMinutes(el.start.split(':')[1])

        const end = new Date();
        end.setHours(el.end.split(':')[0])
        end.setMinutes(el.end.split(':')[1])

        return { start, end }
    })

    lessonsDates.forEach(lesson => {
        try {

            schedule.AddTimer(lesson.start, OnStartOfLesson)

        } catch (error) {
            console.log(error.message);
        }
        try {
            schedule.AddTimer(lesson.end, OnEndOfLesson)

        } catch (error) {
            console.log(error.message);
        }


    });

}