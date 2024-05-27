import { IPage } from "../type";
import { UserState } from "../../store/reducers/userSlice";
import { Tv } from "react-bootstrap-icons";
import { RightsEnum } from "../../shared/RightEnum";
import { useAppSelector } from "../../hooks/redux";
import { useTvs } from "../../hooks/useTvs";
import { TextLoader } from "../../components/Loaders/TextLoader/TextLoader";
import { SimpleLoader } from "../../components/Loaders/SimpleLoader/simpleLoader";
import { Card, Col, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { Center } from "../../components/Center/Center";
import { useFetching } from "../../hooks/useFetching";
import PlayerApi from "../../API/Player.api";
import { VideosApi } from "../../API/Videos.api";
import { BrokenImageURL } from "../../shared/consts";
import { useEffect } from "react";
const ChooseTvPage: IPage = Object.assign(
  () => {
    const bearer = useAppSelector((state) => state.userReducer.user!.access);
    const { tvs } = useTvs();

    const lastVideos = Promise.all(
      (tvs ?? []).map((tv) => new PlayerApi(tv.id, bearer).GetLast())
    );
    const lastVideosMetadata = lastVideos.then((videos) =>
      Promise.all(
        videos.map(async (video) => {
          const metadata = await VideosApi.GetYouTubeMetadata(
            video.video.link
          ).then((res) => res.data);
          return { ...video, ...metadata };
        })
      )
    );

    useEffect(() => {
      window.document.title = "Телевизори";
    }, []);

    const { result, isLoading } = useFetching(lastVideosMetadata, [tvs]);

    if (typeof tvs === "undefined" || isLoading)
      return (
        <>
          <TextLoader>Екраните зареждат</TextLoader>
          <div style={{ width: "100%", height: "50vh" }}>
            <SimpleLoader />
          </div>
        </>
      );
    return (
      <div>
        <Center>
          <h1>Текущи екрани</h1>
        </Center>
        <Row>
          {tvs.map((tv) => (
            <Col xs={6} md={3} key={tv.id}>
              <Card>
                <Card.Img
                  src={
                    result?.find((v) => v.video.queueId === tv.id)
                      ?.thumbnail_url ?? BrokenImageURL
                  }
                ></Card.Img>
                <Card.Body>
                  <Card.Title>{tv.name}</Card.Title>
                  <NavLink to={"/tvs/" + tv.id}>Отиди към гледане</NavLink>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  },
  {
    checkAccess: (state: UserState): boolean =>
      state.authed &&
      !!state.user?.user.rights.includes(
        RightsEnum.ControllPlayer || RightsEnum.ChangeTv
      ),
    path: "/tv",
    pageName: (
      <>
        <Tv />
        Екрани
      </>
    ),
    showable: true,
  }
);

export default ChooseTvPage;
