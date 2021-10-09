//Shared for back and front
(function (exports) {

    // your code goes here

    exports.rightsTranslated = function () {
        return {
            '1': "Предложи контент",
            '2': 'Одобри видео',
            '4': 'Одобри реклама',
            '8': 'Промени приоритет',
            '16': 'Изтрий потребител',
            //That means control youtube frame with websockets
            '32': 'Контролирай опашката',
            //Change rights of some user
            '64': 'Промени права',
            '128': 'Одобри цитат',
            '256': 'Промени телевизори'
        }
    };

})(typeof exports === 'undefined' ? this['Shared'] = {} : exports);