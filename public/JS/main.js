let messagesArea = document.getElementById('MessagesArea')

function AddMessages(messages) {
    AddTextInfos(messages, 'flash alert alert-info message-hide w-100')
}

function AddErrors(errors) {
    AddTextInfos(errors, 'flash alert alert-danger error-hide w-100')
}

function AddTextInfos(texts, classes) {
    let html = texts.reduce((acc, message) => {
        acc += `<div class="${classes}" role="alert" >${message}</div>`
        return acc
    }, ``);

    messagesArea.innerHTML += html
    const animated = messagesArea.querySelectorAll('.flash');
    animated.forEach(el => {
        el.addEventListener('animationend', () => {
            $(el).remove();
        });
    })

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}