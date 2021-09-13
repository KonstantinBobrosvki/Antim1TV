//Base class for all non ok http respones
class StandartError extends Error {

    /**
     * @param  {int} code 
     * @param  {Array} errors
     */
    constructor(code, errors) {
        super(errors)
        //http code
        this.code = code;
        //ARRAY of errors
        if (Array.isArray(errors))
            this.errors = errors;
        else
            this.errors = [errors]
    }
}

module.exports = StandartError