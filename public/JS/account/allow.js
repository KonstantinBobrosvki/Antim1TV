Handlebars.registerHelper('notNull', function (value, options) {
    if (value === null || value === undefined) {
        return options.inverse(this);
    }
    return options.fn(this);
   
});

const videosTemplate = Handlebars.compile($('#video-cards').html())

function GetAllowedVideos(form) {
    SendForm(form, (data) => {
        console.log(data);
        const html = videosTemplate({ allowedVideos: data.allowedVideos });
        console.log(videosTemplate);
        $('#AllowedVideosRow').html(html)

        RenewTags()
    })

}

function HideCard(el) {
    return function (data) {
        $(el).closest('.card').parent().remove();
    }
}

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
