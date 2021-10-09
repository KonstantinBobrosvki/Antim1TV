const rights = GetRights();
const RightBlock = Handlebars.compile($('#right-show-element').html())
const usersTemplate = Handlebars.compile($('#user-table-row').html())

Handlebars.registerHelper('rightToText', function (key) {
    return rights[key]
})

Handlebars.registerPartial('RightBlock', RightBlock);

$(document).ready(function () {
    $('#search-form').submit(function (event) {
        event.preventDefault();

        const url = $(this).attr('action') + '?' + $(this).serialize();

        $.ajax({
            type: "GET",
            url,
            success: function (data) {
                const table = $("#search-results-table")
                table.children('tbody').html('')
                if (Array.isArray(data)) {
                    const html = usersTemplate({ users: data, rights });

                    table.children('tbody').html(html)
                }
                RenewFormsAjax();
            }
        });
    })

});

function RenewFormsAjax() {
    const selector='form[data-form-selector]'
    $(selector).each(function() {
        $(this).unbind('submit')
        $(this).submit(function (event) {
            console.log('submiting');
            event.preventDefault();
            const url = $(this).attr('action');
            const form = $(this)
            $.ajax({
                type: "POST",
                data: $(this).serialize(),
                url,
                success: OnSuccess.bind(form)
            });
        })
    })


}

function OnSuccess(data) {
    //this is form
    if (data.success === true) {
        switch ($(this).attr('data-form-selector')) {

            case 'changePriority':

                const new_priority = data.new_priority;
                AddMessages(['Успешно променено на:' + new_priority]);
                $(this).closest('.forms-priority-container').children('.form-priority-result').text(new_priority)

                break;

            case 'addRight':

                $(this).find('select').val('');
                const html = RightBlock(data.result);

                const myLi = $(this).closest('li')
                myLi.before(html)
                AddMessages(['Добавено право']);
                RenewFormsAjax();

                break;

            case 'deleteRight':

                AddMessages(['Изтрито право']);
                $(this).closest('li').remove()
                break;
        }
    }
}

function SearchForGiver(button) {
    
    const giver=button.getAttribute('data-right-giver-id')
    console.log(giver);
    $('#user-search-input').val(`id=${giver}`)
}