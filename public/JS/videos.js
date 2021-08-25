$(function() {
    LoadAllowedVideos();

    $("input[name='link'").bind("propertychange change click keyup input paste", function(event) {
        let value = $("input[name='link'").val();
        if (value.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/))
            $('#linkError').html('')
    })

    $.validator.addMethod("youtubeLink",
        function(value, element) {
            return value.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
        },
        "Извенете, позволени са само gmail.com, abv.bg, yandex.ru, yahoo.com ."
    );

    $("#VideoSuggest").validate({

        rules: {
            link: {
                required: true,
                youtubeLink: true
            }
        },
        // Specify validation error messages
        messages: {
            link: {
                required: "Моля въведете линк за ютуб",
                youtubeLink: "Линка не е от ютуб"
            }
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form, event) {

            event.preventDefault();
            $('#linkError').html('')
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
                    }
                    $("input[name='link'").val('')
                }
            });

            return false;
        },
        errorPlacement: function(error, element) {
            console.log(error)
            $('#linkError').html(error[0]['textContent'])
        }
    });
});

function LoadAllowedVideos() {
    $.ajax({
        type: "GET",
        url: '/videos/getVideos',
        success: function(data) {
            let html = ''
            data.forEach(el => {
                html += `<div class="card col-sm-5 col-md-4 col-lg-2 mx-1 mx-md-5 mt-2">
                <img src="https://img.youtube.com/vi/${el.video.videoLink}/hqdefault.jpg" loading="lazy" class="card-img-top w-100" alt="Preview">
                <div class="card-body">
                  <h5 data-youtubeId='${el.video.videoLink}' class="card-title">Card title</h5>
                  <button href="#" class="btn btn-primary" data-videoId='${el.id}' onclick='SendVote(this)'>Гласувай</button>
                </div>
                </div>`
            })
            $('#VideosForVote').html(html);

            $('#VideosForVote .card .card-body .card-title').each(SpanLoad)

            setTimeout(() => { $('#VideosForVote').height($('#VideosForVote .card').first().height() * 1.5) }, 1000)

            function SpanLoad() {
                GetYoutubeMetadata($(this).attr('data-youtubeId')).then(meta => { $(this).text(meta.title) }).catch(console.log)
            }
        }
    });
}

function ToogleShowing(button) {
    if ($('#VideosForVote').attr('style')) {
        $('#VideosForVote').removeAttr('style')
        $(button).text('Покажи по-малко')
    } else {
        $('#VideosForVote').height($('#VideosForVote .card').first().height() * 1.5)
        $(button).text('Покажи повече')
    }
}

function SendVote(button) {
    $.ajax({
        type: "POST",
        data: $.param({ videoId: $(button).attr('data-videoId') }),
        url: `/videos/vote`,
        success: function(data) {
            console.log(data)
        },
        error: function(error) {
            console.log(error)
        }
    });
}