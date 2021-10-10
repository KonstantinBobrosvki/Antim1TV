const Actions = require('../../models/enums/Actions.enum');
const Translated=require('../../public/JS/utils/shared'). rightsTranslated()

module.exports = {
    Equals: function (v1, v2, options) {
        if (v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    },
    Raw: function (options) {
        return options.fn()
    },
    RightToText: function (key) {

        return Translated[key]
    },
    HaveRight: function (rights, right, options) {
        if (rights.includes(right))
            return options.fn(this);
        return options.inverse(this);
    },
    GetTVname(tvs, id) {
        return tvs.find(tv => tv.id === id)?.name
    }
}