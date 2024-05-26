import { RightsEnum } from "../shared/RightEnum";

export type UserDto = {
  id: number;

  username: string;

  email: string;

  rights: RightsEnum[];

  priority: number;
};
