import { AxiosError } from "axios";
import { useAppDispatch } from "../hooks/redux";
import { alertsSlice } from "../store/reducers/alertsSlice";

export function guid() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function ExcepionHandler(dispatch: ReturnType<typeof useAppDispatch>) {
  return (err: any) => {
    const error = err as AxiosError;
    if (error.response) {
      console.log(error.response.data.message);

      dispatch(
        alertsSlice.actions.add({
          type: "warning",
          message: error.response.data.message,
        })
      );
    } else if (error.request) {
      dispatch(
        alertsSlice.actions.add({
          type: "warning",
          message: "Не е получен отговор от сървъра",
        })
      );

      console.log(error.request);
    } else {
      dispatch(
        alertsSlice.actions.add({
          type: "warning",
          message: "Не успяхме да пратим запитване до сървъра",
        })
      );

      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
  };
}

export const GetVideoId = (url: string) => {
  const myRegexp =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/gi;
  const match = myRegexp.exec(url);
  if (!match || match?.length < 2) throw Error("Not youtube link " + url);
  return match[1];
};
