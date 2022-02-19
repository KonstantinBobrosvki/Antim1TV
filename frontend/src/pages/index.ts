import { IndexPage } from "./indexPage/index.page";
import { AuthPage } from './auth.page'
import { SuggestPage } from "./suggest.page";
import { route } from "../shared/types";


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
]