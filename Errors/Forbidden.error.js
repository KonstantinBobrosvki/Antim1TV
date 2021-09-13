const StandartError = require('./Standart.error');

class ForbiddenError extends StandartError {
    constructor(errors) {
        if (arguments.length)
            super(403, errors)
        else
            super(403, 'Нямате право на достъп')
    }
}

module.exports=ForbiddenError