//returns id
function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}


$(function () {



    $.validator.addMethod("validID",
        function (value, element) {
            var result= youtube_parser(value);
            return result!==false;
        },
        "Извенете, не можем да открием id на това видео."
    );

    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("form[name='suggest-video']").validate({
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            youtube_video: {
                required: true,
                validID: true
            }


        },
        // Specify validation error messages
        messages: {
           
            youtube_video: {
                required: "Моля въведете линк",
                validID: "Извенете, не можем да открием id на това видео."
            },
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function (form) {
            form.submit();
        }
    });

});