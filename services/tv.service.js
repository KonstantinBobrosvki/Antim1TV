//Hashes tv ids (I know about redis,yes)
const { Tvs } = require('../models/Models');

let Hashed;

class TvService {
    constructor() {
        ReHashTvs();
    }

    GetTvs() {
        return Hashed;
    }

    async ReHash() {
        ReHashTvs();
    }

    GetDefaults(){
        return [Hashed[0]]
    }

}

async function ReHashTvs() {
    try {
        Hashed = await Tvs.findAll({});
    } catch (error) {
        throw error
    }
}

module.exports=new TvService();