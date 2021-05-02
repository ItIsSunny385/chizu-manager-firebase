import { Fragment } from 'react';
import HouseMarker from './HouseMarker';
import { House } from '../types/map';
import { Status } from '../types/model';

interface Props {
    data: Array<House>,
    statusMap: Map<string, Status>,
    setData: (houses: Array<House>) => void,
}

export default function HouseMarkers({ data, statusMap, setData }: Props) {
    return <Fragment>
        {
            data.map((x, i) => {
                const setHouseInfo = (newHouseInfo: House) => {
                    const newHouses = [...data];
                    newHouses[i] = newHouseInfo;
                    setData(newHouses);
                };
                const deleteHouseInfo = () => {
                    const newHouses = [...data];
                    newHouses.splice(i, 1);
                    setData(newHouses);
                };
                return <HouseMarker
                    key={i}
                    data={x}
                    statusMap={statusMap}
                    set={setHouseInfo}
                    delete={deleteHouseInfo}
                />;
            })
        }
    </Fragment>;
}