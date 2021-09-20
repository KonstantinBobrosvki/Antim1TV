module.exports = {
    Equals: function (v1, v2, options) {
        if (v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    Raw: function (options) {
        return options.fn()
    },
    RightToText:function (key) {
        const obj={'1': "Предложи контент",
        '2': 'Одобри видео' ,
        '4': 'Одобри реклама' ,
        '8': 'Промени приоритет' ,
        '16': 'Изтрий потребител',
        //That means control youtube frame with websockets
        '32': 'Контролирай опашката' ,
        //Change rights of some user
        '64': 'Промени права' ,
        '128': 'Одобри цитат'}

        return obj[key]
    }
}