import React from "react";
import { UserState } from "../store/reducers/userSlice";

export type IPage = {
    checkAccess: (user: UserState) => boolean;
    path:string;
    pageName:string;
    (...args: any[]): ReturnType<typeof React.createElement>;
};


