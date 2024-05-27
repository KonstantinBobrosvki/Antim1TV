import React from "react";
import { UserDto } from "../types/user.dto";
import { IPage } from "../pages/type";

export type SubRoute = {
  baseUrl: string;
  name: string | ReturnType<typeof React.createElement>;
  subRoutes: IPage[];
};
export type route = { Page: IPage } | SubRoute;

export type UserResponse = {
  user: UserDto;
  access: string;
};

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
