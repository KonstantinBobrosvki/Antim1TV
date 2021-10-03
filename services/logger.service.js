class LoggerService {
    Debug(object) {
        if (process.env.NODE_ENV == "dev") {
            console.log('[DEBUG]' + JSON.stringify(object))
        }
    }

    Error(error) {
        if (process.env.NODE_ENV == "dev") {
            console.log('[ERROR]');
            console.error(error);
        }
    }

}

module.exports = new LoggerService();