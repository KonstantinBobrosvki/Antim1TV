const StandartError = require('./Standart.error');

class NotFoundError extends StandartError {
    constructor(errors) {
        if (arguments.length)
            super(404, errors)
        else
            super(404, 'Няма такъв ресурс')
    }
}

module.exports=NotFoundError