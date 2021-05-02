import { Fragment } from "react";
import { Building } from "../types/map";
import { Status } from "../types/model";
import BuildingMarker from "./BuildingMarker";

interface Props {
    data: Array<Building>,
    statusMap: Map<string, Status>,
    buildingStatusMap: Map<string, Status>,
    setData: (buildings: Array<Building>) => void,
}

export default function BuildingMarkers({ data, statusMap, buildingStatusMap, setData }: Props) {
    return <Fragment>
        {
            data.map((x, i) => {
                const setBuilding = (newBuilding: Building) => {
                    const newBuildings = [...data];
                    newBuildings[i] = newBuilding;
                    setData(newBuildings);
                };
                const deleteBuilding = () => {
                    const newBuildings = [...data];
                    newBuildings.splice(i, 1);
                    setData(newBuildings);
                };
                return <BuildingMarker
                    key={i}
                    data={x}
                    statusMap={statusMap}
                    buildingStatusMap={buildingStatusMap}
                    set={setBuilding}
                    delete={deleteBuilding}
                />;
            })
        }
    </Fragment>;
}