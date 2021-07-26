$('#myFormTabs a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
})

$(function() {
    $.validator.addMethod("alloweddomain",
        function(value, element) {
            let domain = value.split("@")[1]
            const allowedEmails = ['gmail.com', 'abv.bg', 'yandex.ru', 'yahoo.com']
            return allowedEmails.includes(domain);
        },
        "Извенете, позволени са само gmail.com, abv.bg, yandex.ru, yahoo.com ."
    );

    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    $("form[name='login']").validate({
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            usernameOrEmail: "required",

            password: {
                required: true,
                minlength: 5
            }
        },
        // Specify validation error messages
        messages: {
            usernameOrEmail: "Моля въведете име или email",
            password: {
                required: "Моля въведете парола",
                minlength: "Моля въведете парола по дълга от 5 символа"
            },
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            form = $(form);
            let url = form.attr('action');

            $.ajax({
                type: "POST",
                url: url,
                data: form.serialize(), // serializes the form's elements.
                success: function(data) {

                    if (data.Errors) {
                        AddErrors(data.Errors)
                    }
                    if (data.Messages) {
                        AddMessages(data.Messages);
                    }
                    if (data.success) {
                        //expires is counted in 24 hour so 0.125 is 3 hours
                        Cookies.set('access', data.access, { expires: 0.125 })
                        window.location = '/account'
                    }
                }
            });
        }
    });

    $("form[name='signup']").validate({
        // Specify validation rules
        rules: {
            // The key name on the left side is the name attribute
            // of an input field. Validation rules are defined
            // on the right side
            username: {
                required: true,
                minlength: 6
            },
            email: {
                required: true,
                // Specify that email should be validated
                // by the built-in "email" rule
                email: true,
                alloweddomain: true

            },
            password: {
                required: true,
                minlength: 5
            }
        },
        // Specify validation error messages
        messages: {
            username: {
                required: "Моля въведете име",
                minlength: "Моля въведете име по-дълго от 5 символа"
            },
            password: {
                required: "Моля въведете парола",
                minlength: "Моля въведете парола по дълга от 5 символа"
            },
            email: {
                email: "Моля въведете истински email адрес",
                alloweddomain: "Извенете, позволени са само gmail.com, abv.bg, yandex.ru, yahoo.com ."
            }
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            form = $(form);
            let url = form.attr('action');

            $.ajax({
                type: "POST",
                url: url,
                data: form.serialize(), // serializes the form's elements.
                success: function(data) {

                    if (data.Errors) {
                        AddErrors(data.Errors)
                    }
                    if (data.Messages) {
                        AddMessages(data.Messages);
                    }
                    if (data.success) {
                        //expires is counted in 24 hour so 0.125 is 3 hours
                        Cookies.set('access', data.access, { expires: 0.125 })
                        window.location = '/account'
                    }
                }
            });


        }
    });

});