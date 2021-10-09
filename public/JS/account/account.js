
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



//Returns function that will hide nearest el with card class
function HideCard(el) {
    return function (data) {
        $(el).closest('.card').parent().remove();
    }
}

