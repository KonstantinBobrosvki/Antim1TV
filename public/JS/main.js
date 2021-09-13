$.ajaxSetup({
    headers: { 'Accept': 'application/json; charset=utf-8' }
});

$(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
    let errors = jqXHR.responseJSON.Errors;
    if (errors) {
        AddErrors(errors)
    }
});

const messagesArea = $('#MessagesArea')

function AddMessages(messages) {
    AddTextInfos(messages, 'flash alert alert-info message-hide w-100')
}

function AddErrors(errors) {
    AddTextInfos(errors, 'flash alert alert-danger error-hide w-100')
}

function AddTextInfos(texts, classes) {

    if (!Array.isArray(texts))
        texts = [texts]



    texts.forEach(message => {
        messagesArea.append(`<div class="${classes}" role="alert" >${message}</div>`)
    });

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function GetYoutubeMetadata(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
            success: function (data) {
                resolve(data)
            },
            error: function (error) {
                reject(error)
            }
        });
    })

}

