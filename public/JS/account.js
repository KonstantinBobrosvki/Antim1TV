$(document).ready(function() {
    $("td[data-postgreTime='true']").each((_, el) => {
        $(el).text($(el).text().slice(0, 23))
    })
    $("[data-getMetaDataSource]").each((_, el) => {
        console.log('here')
        $.ajax({
            type: "GET",
            url: `https://www.youtube.com/oembed?url=${$(el).attr('data-getMetaDataSource')}&format=json`,
            success: function(data) {
                $(el).text(data.title || 'Не успяхме да заредим заглавието')
            },
            error: function(error) {
                $(el).text('Не успяхме да заредим заглавието')
            }
        });
    })
});

function SendForm(form, callback) {
    let url = $(form).attr('action');

    $.ajax({
        type: "POST",
        url: url,
        data: $(form).serialize(), // serializes the form's elements.
        success: function(data) {
            if (data.Errors) {
                AddErrors(data.Errors)
            }
            if (data.Messages) {
                AddMessages(data.Messages);
            }
            if (data.success === true) {
                AddMessages(['Успешно добавено']);
                callback(true)
            }
        }
    });
}

//Returns function that will hide nearest el with card class
function HideCard(el) {
    return function(data) {
        if (data == true)
            $(el).closest('.card').remove();
    }
}