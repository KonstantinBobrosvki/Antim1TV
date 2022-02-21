import { IndexPage } from "./indexPage/index.page";
import { AuthPage } from './authPage/auth.page'
import { SuggestPage } from "./suggestPage/suggest.page";
import { route } from "../shared/types";
import { accountRoutes } from "./accountPages";


export const routes: route[] = [
    {
        Page: IndexPage,
    },
    {
        Page: AuthPage,
    },
    {
        Page: SuggestPage,
    },
    accountRoutes
]