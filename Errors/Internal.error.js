const loggerService = require('../services/logger.service');
const StandartError = require('./Standart.error');

class InternalError extends StandartError {
    constructor(errors, source) {
        if (arguments.length !== 2 || source instanceof Error === false) {
            if (source instanceof Error) {
                throw source;
            } else {
                throw new Error('Need trigger error in internal error')
            }
        }
        else {
            super(500, errors || 'Грешка на сървъра :—(')
            this.Source = source;
            loggerService.Error(source)
        }

    }
}

module.exports = InternalError