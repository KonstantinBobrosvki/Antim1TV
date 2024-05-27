import React, { useEffect, useMemo, useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import { VideosApi } from "../../../API/Videos.api";
import { Center } from "../../../components/Center/Center";
import { SimpleLoader } from "../../../components/Loaders/SimpleLoader/simpleLoader";
import { TextLoader } from "../../../components/Loaders/TextLoader/TextLoader";
import { CatRandom } from "../../../components/randomCat/randomCat";
import { VideoBox } from "../../../components/videoBox/videobox";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { useFetching } from "../../../hooks/useFetching";
import { useTvs } from "../../../hooks/useTvs";
import { RightsEnum } from "../../../shared/RightEnum";
import { alertsSlice } from "../../../store/reducers/alertsSlice";
import { UserState } from "../../../store/reducers/userSlice";
import { IPage } from "../../type";

const ModerateVideosPage: IPage = Object.assign(
  () => {
    const accses = useAppSelector((state) => state.userReducer.user!.access);
    const dispatch = useAppDispatch();
    const { tvIdToName } = useTvs();
    const [refreshCount, setRefreshCount] = useState(0);
    const { result, isLoading, error } = useFetching(
      VideosApi.GetUnmoderated(accses, 0),
      []
    );
    const [moderated, setModerated] = useState<number[]>([]);

    useEffect(() => {
      window.document.title = "Провери видеа";
    }, []);

    const filtredResults = useMemo(() => {
      if (isLoading || error) return [];
      return result!.filter(
        (el) => true !== moderated.some((broken) => broken === el.id)
      );
    }, [result, moderated, isLoading, error]);

    const RejectVideo = (videoId: number) => {
      VideosApi.RejectVideo(videoId, accses).then(() => {
        dispatch(
          alertsSlice.actions.add({ type: "info", message: "Успешно изтрито" })
        );
        setModerated([videoId, ...moderated]);
      });
    };

    const AllowVideo = (videoId: number) => {
      VideosApi.AllowVideo(videoId, accses).then(() => {
        dispatch(
          alertsSlice.actions.add({
            type: "info",
            message: "Успешно позволено",
          })
        );
        setModerated([videoId, ...moderated]);
      });
    };

    const onRefreshClick = () => {
      setRefreshCount((count) => count + 1);
      dispatch(
        alertsSlice.actions.add({
          type: "info",
          message: "Подновихте видеата " + (refreshCount + 1) + " пъти! Браво!",
        })
      );
    };

    if (isLoading) {
      return (
        <>
          <Center>
            <TextLoader>Видеата за проверка зареждат</TextLoader>
          </Center>
          <Center>
            <div style={{ width: "50vw", height: "50vh" }}>
              <SimpleLoader />
            </div>
          </Center>
        </>
      );
    }
    if (error) {
      dispatch(
        alertsSlice.actions.add({
          type: "danger",
          message: (error.body as any).message,
        })
      );
      return (
        <Center>
          {" "}
          <h1>Възникна грешка. Опитайте отново</h1>
        </Center>
      );
    }
    return (
      <Col sm={12}>
        <Center>
          {" "}
          <h2>Видеа за проверка</h2>{" "}
        </Center>
        <Row>
          {filtredResults.length === 0 && (
            <React.Fragment key={refreshCount}>
              <Center>
                <h3>Проверихте всички видеа. Честито! Ето ви котка</h3>
              </Center>
              <br />
              <CatRandom />
            </React.Fragment>
          )}
          {filtredResults?.map((video) => {
            return (
              <Col sm={6} lg={4} className="my-3" key={video.id}>
                <VideoBox
                  videoUrl={video.link}
                  onFailLoad={() => setModerated([...moderated, video.id])}
                >
                  <p className="card-text">
                    За екран:{tvIdToName(video.queueId)}
                  </p>
                  <p className="card-text">
                    Линк:{" "}
                    <a target="_blank" rel="noreferrer" href={`${video.link}`}>
                      Изгледай клипчето
                    </a>
                  </p>
                  <Row>
                    <Col>
                      <Button
                        variant="info"
                        onClick={() => AllowVideo(video.id)}
                      >
                        Позволи
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        variant="danger"
                        onClick={() => RejectVideo(video.id)}
                      >
                        Изтрий
                      </Button>
                    </Col>
                  </Row>
                </VideoBox>
              </Col>
            );
          })}
        </Row>
        <Center>
          <Button variant="primary" className="mt-5" onClick={onRefreshClick}>
            Поднови
          </Button>
        </Center>
      </Col>
    );
  },
  {
    checkAccess: (state: UserState): boolean =>
      state.authed &&
      (state.user?.user.rights.includes(RightsEnum.AllowVideo) as boolean),
    path: "/moderate",
    pageName: <>Одобри контент</>,
    showable: true,
  }
);

export default ModerateVideosPage;
