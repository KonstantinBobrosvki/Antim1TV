import { useEffect, useState, useRef, useCallback } from "react";
import { Button, Col, Placeholder } from "react-bootstrap"
import { TVApi } from "../../../API/TV.api";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { userSlice } from "../../../store/reducers/userSlice";

export const TvSection = () => {
    const userState = useAppSelector(state => state.userReducer);
    const dispatch = useAppDispatch();
    const savedTvs = useAppSelector(state => state.userReducer.TvsId);
    const [remoteTvs, setRemoteTvs] = useState<Awaited<ReturnType<typeof TVApi.GetTvs>>>();
    const selectRef = useRef(null);

    const [loading, setLoading] = useState(true)


    useEffect(() => {
        TVApi.GetTvs(userState.user!.access).then(tvs => setRemoteTvs(tvs)).then(_ => setLoading(false))
    }, [])

    const tvIdToName = useCallback((id: number) => {
        if (!remoteTvs)
            return 'Изтрит телевизор'
        return remoteTvs.find(tv => tv.id == id)?.name || 'Изтрит телевизор'
    }, [remoteTvs])

    const onTvsChange = () => {
        const select = selectRef.current as any as { selectedOptions: any[] }
        dispatch(userSlice.actions.setTvs([...select.selectedOptions].map(input => input.value)))
    }

    return (<Col className="d-flex justify-content-evenly flex-column" xs={12} md={{ offset: 3, span: 6 }} >
        <h2 className="bg-dark text-light p-2 rounded-pill" style={{ textAlign: 'center' }}>Вашите стандартни телевизори:</h2>

        {(typeof savedTvs === 'undefined' || savedTvs.length === 0) &&
            (<h2 className="bg-warning rounded text-center">Изберете телевизор, който ще се ползва по подразбиране!</h2>)
        }

        {loading ?
            <Placeholder as="p" animation="glow">
                <Placeholder xs={12} />
            </Placeholder>
            :
            <>
                <ul className="d-flex justify-content-evenly mb-4 overflow-auto">


                    {savedTvs?.map((tv) =>
                    (<li key={tv} className="list-group-item bg-dark text-light me-2 ">
                        <span>{tvIdToName(tv)}</span>
                    </li>)
                    )}

                </ul>

                <h2 className="rounded text-center">Промени</h2>
                <select ref={selectRef} className="form-select bg-dark text-light border-round" multiple={true}>
                    {
                        remoteTvs?.map(tv => (
                            <option key={tv.id} value={tv.id}>{tv.name}</option>
                        ))
                    }
                </select>
                <Button variant='dark' className='mt-1 mx-auto' onClick={onTvsChange}>Промени</Button>
            </>
        }



    </Col>)
}