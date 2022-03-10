import { IndexPage } from "./indexPage/index.page";
import { AuthPage } from './authPage/auth.page'
import { SuggestPage } from "./suggestPage/suggest.page";
import { route } from "../shared/types";
import { accountRoutes } from "./accountPages";
import ChooseTvPage from "./tvPages/chooseTV.page";
import PlayerPage from "./tvPages/Player.page/Player.page";


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
    {
        Page: ChooseTvPage
    },
    {
        Page:PlayerPage
    },
    accountRoutes
]