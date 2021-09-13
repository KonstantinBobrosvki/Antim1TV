const StandartError = require('./Standart.error');

class BadRequestError extends StandartError {
    constructor(errors) {
        if (arguments.length)
            super(400, errors)
        else
            super(400, 'Грешно запитване до сървъра')
    }
}

module.exports=BadRequestError