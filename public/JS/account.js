console.log($('#video-cards').html());
const videosTemplate  = Handlebars.compile($('#video-cards').html())

$(document).ready(function () {

    RenewTags()
});

function RenewTags() {
    $("td[data-postgreTime='true']").each((_, el) => {
        $(el).text($(el).text().slice(0, 23))
    })
    $("[data-getMetaDataSource]").each((_, el) => {
        $.ajax({
            type: "GET",
            url: `https://www.youtube.com/oembed?url=${$(el).attr('data-getMetaDataSource')}&format=json`,
            success: function (data) {
                $(el).text(data.title || 'Не успяхме да заредим заглавието')
            },
            error: function (error) {
                $(el).text('Не успяхме да заредим заглавието')
            }
        });
    })

}

function SendForm(form, callback) {
    let url = $(form).attr('action');

    $.ajax({
        type: $(form).attr('method') ?? "POST",
        url: url,
        data: $(form).serialize(), // serializes the form's elements.
        success: function (data) {
            if (data.Messages) {
                AddMessages(data.Messages);
            }
            if (data.success === true) {
                AddMessages(['Успешно']);
                callback(data)
            }
        }
    });
}

//Returns function that will hide nearest el with card class
function HideCard(el) {
    return function (data) {
        $(el).closest('.card').parent().remove();
    }
}

function GetAllowedVideos(form) {
    SendForm(form, (data) => {
        console.log(data);
        const html = videosTemplate({ allowedVideos: data.allowedVideos });
        console.log(videosTemplate);
        $('#AllowedVideosRow').html(html)

        RenewTags()
    })

}