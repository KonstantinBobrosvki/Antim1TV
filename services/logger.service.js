class LoggerService {
    Debug(object) {
        if (process.env.NODE_ENV.toString().replace(/ /g, '') == "dev") {
            console.log('[DEBUG]' + JSON.stringify(object))
        }
    }

    Error(error) {
        if (process.env.NODE_ENV.toString().replace(/ /g, '') == "dev") {
            console.error('[ERROR]');
            console.error(error);

        }
    }

}

module.exports = new LoggerService();