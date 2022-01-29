declare global {
    namespace jest {
        interface Matchers<R> {
            FullEqual(actual: object): R;
            CheckSignature(actual: object): R;
        }
    }
}

expect.extend({
    FullEqual: (actual: object, expected: object) => {
        const check = (objectA: object, objectB: object) => {
            for (const key in objectA) {
                if (objectA[key] == null || objectA[key] == undefined) continue;
                if (!objectB[key])
                    return {
                        message: () => `expected key ${key} in ${JSON.stringify(objectB)}`,
                        pass: false,
                    };
                else if (typeof objectA[key] == 'object') {
                    const res = check(objectA[key], objectB[key]);
                    if (!res.pass) return res;
                } else if (objectB[key] != objectA[key])
                    return {
                        message: () =>
                            `expected ${key} to be ${objectB[key]} not ${
                                objectA[key]
                            } in objects:\r\n ${JSON.stringify(objectA)} \r\n ${JSON.stringify(
                                objectB,
                            )}`,
                        pass: false,
                    };
            }
            return {
                message: () => `Expect has all keys and values of actual`,
                pass: true,
            };
        };

        return check(actual, expected);
    },

    CheckSignature: (actual, className: new () => any) => {
        const good = {
            message: () => `Expect has all keys of actual`,
            pass: true,
        };

        const res = Object.keys(new className()).reduce((acc, key: string) => {
            if (acc.pass) {
                if (!actual.hasOwnProperty(key))
                    return {
                        message: () => `Object has not key ${key}`,
                        pass: true,
                    };
            }
            return acc;
        }, good);

        return res;
    },
});

//do not delete. TS needs
export {};
