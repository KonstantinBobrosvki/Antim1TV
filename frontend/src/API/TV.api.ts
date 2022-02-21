import axios from "axios";

type Tv = { name: string, id: number }
export class TVApi {
    private static hashed: Tv[];
    static GetTvs(accsess: string, renew: boolean = false): Promise<Tv[]> {
        if (this.hashed && renew)
            return Promise.resolve(this.hashed)
        return axios.get('/queues',
            {
                headers: {
                    authorization: 'Bearer '+ accsess
                }
            }).then((res) => {
                this.hashed = res.data;
                return res.data
            })
    }
}