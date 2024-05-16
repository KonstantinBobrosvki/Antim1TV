import React from "react";
import { UserState } from "../store/reducers/userSlice";

export type IPage = {
    checkAccess: (user: UserState) => boolean;
    path: string;
    showable:boolean
    pageName: string | ReturnType<typeof React.createElement>;
    (...args: any[]): ReturnType<typeof React.createElement>;
};


