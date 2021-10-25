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

    exports.Schedule = class {
        constructor() {
            console.log('its me');
            this.timeouts = [];
        }

        AddTimer(date, callback) {
            const delay = date.getTime() - Date.now();

            if (delay < 0)
                throw new Error('Error in delay. It is ' + delay)

            console.log('added timer. will fire after '+delay );
            const timer = setTimeout(() => {
                console.log('Timer fired');
                this.timeouts = this.timeouts.filter(el => el !== timer)
                callback();
            }, delay)

            this.timeouts.push(timer)
        }

        GetTimers() {
            return this.timeouts
        }


    }

})(typeof exports === 'undefined' ? this['Shared'] = {} : exports);