import firebase from 'firebase';
import { Building, Floor, House, MapData, Room } from '../types/map';

export function getMapDataArrayWithNoChildByQuerySnapshot(snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>): Array<MapData> {
    return snapshot.docs.map(x => {
        const mapData: MapData = {
            id: x.id,
            name: x.data().name,
            using: x.data().using,
            borderCoords: x.data().borderCoords,
            managers: x.data().managers,
            allEditable: x.data().allEditable,
            editors: x.data().editors,
            allUsable: x.data().allUsable,
            users: x.data().users,
            buildings: new Map<string, Building>(),
            houses: new Map<string, House>(),
        }
        return mapData;
    });
}

export function listeningMapQueryWithNoChildren(
    query: firebase.firestore.Query<firebase.firestore.DocumentData>,
    mapDataMapRef: React.MutableRefObject<Map<string, MapData>>,
    setMapDataMap: (data: Map<string, MapData>) => void,
    reset: (mapId: string) => void,
) {
    query.onSnapshot((snapshot) => {
        const newMapDataMap = cloneMapDataMap(mapDataMapRef.current);
        for (let change of snapshot.docChanges()) {
            if (change.type === 'added') {
                if (newMapDataMap.get(change.doc.id)) {
                    // 権限を変更した場合に、deletedより先に add が動いてしまった場合
                    const intervalId = setInterval(() => {
                        const newMapDataMap2 = cloneMapDataMap(mapDataMapRef.current);
                        if (newMapDataMap2.get(change.doc.id)) {
                            return;
                        }
                        const newMapData: MapData = {
                            id: change.doc.id,
                            name: change.doc.data().name,
                            using: change.doc.data().using,
                            borderCoords: change.doc.data().borderCoords,
                            managers: change.doc.data().managers,
                            editors: change.doc.data().editors,
                            allEditable: change.doc.data().allEditable,
                            users: change.doc.data().users,
                            allUsable: change.doc.data().allUsable,
                            buildings: new Map<string, Building>(),
                            houses: new Map<string, House>(),
                        };
                        newMapDataMap2.set(change.doc.id, newMapData);
                        setMapDataMap(newMapDataMap2);
                        clearInterval(intervalId);
                    }, 1000);
                } else {
                    const newMapData: MapData = {
                        id: change.doc.id,
                        name: change.doc.data().name,
                        using: change.doc.data().using,
                        borderCoords: change.doc.data().borderCoords,
                        managers: change.doc.data().managers,
                        editors: change.doc.data().editors,
                        allEditable: change.doc.data().allEditable,
                        users: change.doc.data().users,
                        allUsable: change.doc.data().allUsable,
                        buildings: new Map<string, Building>(),
                        houses: new Map<string, House>(),
                    };
                    newMapDataMap.set(change.doc.id, newMapData);
                }
            } else if (change.type === 'modified') {
                const newMMapData = newMapDataMap.get(change.doc.id)!;
                newMMapData.name = change.doc.data().name;
                newMMapData.using = change.doc.data().using;
                newMMapData.borderCoords = change.doc.data().borderCoords;
                newMMapData.managers = change.doc.data().managers;
                newMMapData.editors = change.doc.data().editors;
                newMMapData.allEditable = change.doc.data().allEditable;
                newMMapData.users = change.doc.data().users;
                newMMapData.allUsable = change.doc.data().allUsable;
            } else if (change.type === 'removed') {
                if (!newMapDataMap.get(change.doc.id)) {
                    continue;
                }
                newMapDataMap.delete(change.doc.id);
                reset(change.doc.id);
            }
        }
        setMapDataMap(newMapDataMap);
    });
}

export function listeningHouseMap(
    getHouseMap: () => Map<string, House> | undefined,
    housesSnap: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
    setHouseMap: (houseMap: Map<string, House>) => void
) {
    const houses = getHouseMap();
    if (!houses) return;
    for (let changeH of housesSnap.docChanges()) {
        if (changeH.type === 'added') {
            houses.set(changeH.doc.id, {
                id: changeH.doc.id,
                latLng: changeH.doc.data().latLng,
                comment: changeH.doc.data().comment,
                statusRef: changeH.doc.data().statusRef,
            });
        } else if (changeH.type === 'modified') {
            const newHouse = houses.get(changeH.doc.id)!;
            newHouse.latLng = changeH.doc.data().latLng;
            newHouse.comment = changeH.doc.data().comment;
            newHouse.statusRef = changeH.doc.data().statusRef;
        } else if (changeH.type === "removed") {
            houses.delete(changeH.doc.id);
        }
    }
    setHouseMap(houses);
}

export function listeningBuildingMap(
    getBuildingMap: () => Map<string, Building> | undefined,
    buildingsSnap: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>,
    setBuildingMap: (buildingMap: Map<string, Building>) => void
) {
    const buildings1 = getBuildingMap();
    if (!buildings1) return;
    for (let changeB of buildingsSnap.docChanges()) {
        if (changeB.type === 'added') {
            const newBuilding1: Building = {
                id: changeB.doc.id,
                name: changeB.doc.data().name,
                comment: changeB.doc.data().comment,
                latLng: changeB.doc.data().latLng,
                statusRef: changeB.doc.data().statusRef,
                floors: new Map<string, Floor>(),
            };
            buildings1.set(changeB.doc.id, newBuilding1);
            changeB.doc.ref.collection('floors').orderBy('number', 'asc').onSnapshot((floorsSnap) => {
                const buildings2 = getBuildingMap();
                if (!buildings2) return;
                const newBuilding2 = buildings2.get(changeB.doc.id);
                if (!newBuilding2) {
                    return;
                }
                for (let changeF of floorsSnap.docChanges()) {
                    if (changeF.type === 'added') {
                        newBuilding2.floors.set(changeF.doc.id, {
                            id: changeF.doc.id,
                            number: changeF.doc.data().number,
                            rooms: new Map<string, Room>(),
                        });
                        changeF.doc.ref.collection('rooms').orderBy('orderNumber', 'asc').onSnapshot((roomsSnap) => {
                            const buildings3 = getBuildingMap();
                            if (!buildings3) return;
                            const newBuilding3 = buildings3.get(changeB.doc.id);
                            if (!newBuilding3) {
                                return;
                            }
                            const newFloor = newBuilding3.floors.get(changeF.doc.id);
                            if (!newFloor) {
                                return;
                            }
                            for (let changeR of roomsSnap.docChanges()) {
                                if (changeR.type === 'added') {
                                    newFloor.rooms.set(changeR.doc.id, {
                                        id: changeR.doc.id,
                                        orderNumber: changeR.doc.data().orderNumber,
                                        roomNumber: changeR.doc.data().roomNumber,
                                        statusRef: changeR.doc.data().statusRef,
                                        comment: changeR.doc.data().comment,
                                    })
                                } else if (changeR.type === 'modified') {
                                    const newRoom = { ...newFloor.rooms.get(changeR.doc.id) } as Room;
                                    newRoom.orderNumber = changeR.doc.data().orderNumber;
                                    newRoom.roomNumber = changeR.doc.data().roomNumber;
                                    newRoom.statusRef = changeR.doc.data().statusRef;
                                    newRoom.comment = changeR.doc.data().comment;
                                    newFloor.rooms.set(changeR.doc.id, newRoom);
                                } else if (changeR.type === 'removed') {
                                    newFloor.rooms.delete(changeR.doc.id);
                                }
                            }
                            setBuildingMap(buildings3);
                        });
                    } else if (changeF.type === 'modified') {
                        const newFloor = { ...newBuilding2.floors.get(changeF.doc.id) } as Floor;
                        newFloor.number = changeF.doc.data().number;
                        newBuilding2.floors.set(changeF.doc.id, newFloor);
                    } else if (changeF.type === 'removed') {
                        newBuilding2.floors.delete(changeF.doc.id);
                    }
                }
                setBuildingMap(buildings2);
            });
        } else if (changeB.type === 'modified') {
            const newBuilding = buildings1.get(changeB.doc.id)!;
            newBuilding.name = changeB.doc.data().name;
            newBuilding.comment = changeB.doc.data().comment;
            newBuilding.latLng = changeB.doc.data().latLng;
            newBuilding.statusRef = changeB.doc.data().statusRef;
        } else if (changeB.type === "removed") {
            buildings1.delete(changeB.doc.id);
        }
    }
    setBuildingMap(buildings1);
}

export function listeningMapChildrenAndSetMapDataMap(
    mapRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
    mapDataMapRef: React.MutableRefObject<Map<string, MapData>>,
    setMapDataMap: (data: Map<string, MapData>) => void
) {
    mapRef.collection('houses').onSnapshot((housesSnap) => {
        listeningHouseMap(
            (): Map<string, House> | undefined => {
                const newMapDataMap1 = cloneMapDataMap(mapDataMapRef.current);
                const newMapData1 = newMapDataMap1.get(mapRef.id);
                return newMapData1 ? newMapData1.houses : undefined;
            },
            housesSnap,
            (houseMap: Map<string, House>) => {
                const newMapDataMap2 = cloneMapDataMap(mapDataMapRef.current);
                const newMapData2 = newMapDataMap2.get(mapRef.id);
                if (!newMapData2) return;
                newMapData2.houses = houseMap;
                setMapDataMap(newMapDataMap2);
            }
        );
    });

    mapRef.collection('buildings').onSnapshot((buildingsSnap) => {
        listeningBuildingMap(
            (): Map<string, Building> | undefined => {
                const newMapDataMap1 = cloneMapDataMap(mapDataMapRef.current);
                const newMapData1 = newMapDataMap1.get(mapRef.id);
                return newMapData1 ? newMapData1.buildings : undefined;
            },
            buildingsSnap,
            (buildingMap: Map<string, Building>) => {
                const newMapDataMap2 = cloneMapDataMap(mapDataMapRef.current);
                const newMapData2 = newMapDataMap2.get(mapRef.id);
                if (!newMapData2) return;
                newMapData2.buildings = buildingMap;
                setMapDataMap(newMapDataMap2);
            }
        );
    });
}

export function listeningMapInfoWithChildren(
    mapRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
    mapDataRef: React.MutableRefObject<MapData | undefined>,
    setMapData: (data: MapData | undefined) => void,
) {
    mapRef.onSnapshot((mapSnap) => {
        const newData = mapSnap.data();
        if (!newData) {
            setMapData(undefined);
            return;
        }
        if (mapDataRef.current) {
            const newMapData = cloneMapData(mapDataRef.current);
            newMapData.name = newData.name;
            newMapData.using = newData.using;
            newMapData.borderCoords = newData.borderCoords;
            newMapData.managers = newData.managers;
            newMapData.allEditable = newData.allEditable;
            newMapData.editors = newData.editors;
            newMapData.allUsable = newData.allUsable;
            newMapData.users = newData.users;
            setMapData(newMapData);
        } else {
            const newMapData: MapData = {
                id: mapSnap.id,
                name: newData.name,
                using: newData.using,
                borderCoords: newData.borderCoords,
                managers: newData.managers,
                editors: newData.editors,
                allEditable: newData.allEditable,
                users: newData.users,
                allUsable: newData.allUsable,
                buildings: new Map<string, Building>(),
                houses: new Map<string, House>(),
            };
            setMapData(newMapData);
            mapRef.collection('houses').onSnapshot((housesSnap) => {
                listeningHouseMap(
                    () => {
                        if (!mapDataRef.current) return undefined;
                        const newMapData1 = cloneMapData(mapDataRef.current);
                        return newMapData1.houses;
                    },
                    housesSnap,
                    (houseMap) => {
                        if (!mapDataRef.current) return;
                        const newMapData2 = cloneMapData(mapDataRef.current);
                        newMapData2.houses = houseMap;
                        setMapData(newMapData2);
                    }
                )
            });
            mapRef.collection('buildings').onSnapshot((buildingsSnap) => {
                listeningBuildingMap(
                    () => {
                        if (!mapDataRef.current) return undefined;
                        const newMapData1 = cloneMapData(mapDataRef.current);
                        return newMapData1.buildings;
                    },
                    buildingsSnap,
                    (buildingMap) => {
                        if (!mapDataRef.current) return;
                        const newMapData2 = cloneMapData(mapDataRef.current);
                        newMapData2.buildings = buildingMap;
                        setMapData(newMapData2);
                    }
                )
            });
        }
    });
}

export function cloneMapDataMap(mapDataMap: Map<string, MapData>): Map<string, MapData> {
    const newMapDataMap = new Map<string, MapData>(
        Array.from(mapDataMap.entries()).map(([id, x]) => {
            return [id, cloneMapData(x)];
        })
    );
    return newMapDataMap;
}

export function cloneMapData(mapData: MapData): MapData {
    const newMapData: MapData = {
        id: mapData.id,
        name: mapData.name,
        using: mapData.using,
        borderCoords: [...mapData.borderCoords],
        managers: [...mapData.managers],
        editors: [...mapData.editors],
        allEditable: mapData.allEditable,
        users: [...mapData.users],
        allUsable: mapData.allUsable,
        buildings: new Map<string, Building>(
            Array.from(mapData.buildings.entries()).map(([id, building]) => [id, cloneBuilding(building)])
        ),
        houses: new Map<string, House>(
            Array.from(mapData.houses.entries()).map(([id, house]) => [id, cloneHouse(house)])
        )
    };
    return newMapData;
}

export function cloneHouse(house: House) {
    const newHouse: House = {
        id: house.id,
        latLng: house.latLng,
        comment: house.comment,
        statusRef: house.statusRef,
    };
    return newHouse;
}

export function cloneBuilding(building: Building) {
    const newBuilding: Building = {
        id: building.id,
        name: building.name,
        comment: building.comment,
        latLng: building.latLng,
        statusRef: building.statusRef,
        floors: new Map<string, Floor>(
            Array.from(building.floors.entries()).map(([id, floor]) => [id, cloneFloor(floor)])
        )
    };
    return newBuilding;
}

export function cloneFloor(floor: Floor) {
    const newFloor: Floor = {
        id: floor.id,
        number: floor.number,
        rooms: new Map<string, Room>(
            Array.from(floor.rooms.entries()).map(([id, room]) => [id, cloneRoom(room)])
        )
    };
    return newFloor;
}

export function cloneRoom(room: Room) {
    const newRoom: Room = {
        id: room.id,
        orderNumber: room.orderNumber,
        roomNumber: room.roomNumber,
        statusRef: room.statusRef,
        comment: room.comment,
    };
    return newRoom;
}