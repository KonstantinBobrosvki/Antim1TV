$(function() {
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