const BadRequestError = require('./BadRequest.error')
const ForbiddenError = require('./Forbidden.error')
const InternalError = require('./Internal.error')
const NotFoundError = require('./NotFound.error')
const StandartError = require('./Standart.error')
const UnauthorizedError = require('./Unauthorized.error')

module.exports = { BadRequestError, ForbiddenError, InternalError, NotFoundError, StandartError, UnauthorizedError }