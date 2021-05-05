import firebase from 'firebase';
import { Building, Floor, House, MapData, Room } from '../types/map';

export function getMapDataArrayWithNoChildByQuerySnapshot(snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>): Array<MapData> {
    return snapshot.docs.map(x => {
        const mapData: MapData = {
            id: x.id,
            name: x.data().name,
            status: x.data().status,
            borderCoords: x.data().borderCoords,
            buildings: new Map<string, Building>(),
            houses: new Map<string, House>(),
        }
        return mapData;
    });
}

/*
export async function getMapDataWithChildrenById(db: firebase.firestore.Firestore, id: string): Promise<MapData | undefined> {
    const mapSnap = await db.collection('maps').doc(id).get();
    const mapData = mapSnap.data();
    if (!mapData) {
        return undefined;
    }
    const housesSnap = await mapSnap.ref.collection('houses').get();
    const houses = housesSnap.docs.map(x => ({
        id: x.id,
        latLng: x.data().latLng,
        statusRef: x.data().statusRef,
    }));
    const buildingsSnap = await mapSnap.ref.collection('buildings').get();
    const buildings = await Promise.all(buildingsSnap.docs.map(async x => {
        const floorsSnap = await x.ref.collection('floors').orderBy('number', 'asc').get();
        const floors = await Promise.all(floorsSnap.docs.map(async y => {
            const roomsSnap = await y.ref.collection('rooms').orderBy('orderNumber', 'asc').get();
            const rooms = roomsSnap.docs.map(z => ({
                id: z.id,
                orderNumber: z.data().orderNumber,
                roomNumber: z.data().roomNumber,
                statusRef: z.data().statusRef,
            }));
            return {
                id: y.id,
                number: y.data().number,
                rooms: rooms,
            };
        }));
        return {
            id: x.id,
            name: x.data().name,
            latLng: x.data().latLng,
            statusRef: x.data().statusRef,
            floors: floors,
        };
    }));
    return {
        id: mapSnap.id,
        orderNumber: mapData.orderNumber,
        name: mapData.name,
        status: mapData.status,
        borderCoords: mapData.borderCoords,
        badgeLatLng: mapData.badgeLatLng,
        buildings: buildings,
        houses: houses,
    } as MapData;
}
*/

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
            const newMapData: MapData = { ...mapDataRef.current };
            newMapData.name = newData.name;
            newMapData.status = newData.status;
            newMapData.borderCoords = newData.borderCoords;
            setMapData(newMapData);
        } else {
            const newMapData: MapData = {
                id: mapSnap.id,
                name: newData.name,
                status: newData.status,
                borderCoords: newData.borderCoords,
                buildings: new Map<string, Building>(),
                houses: new Map<string, House>(),
            };
            setMapData(newMapData);
            mapRef.collection('houses').onSnapshot((housesSnap) => {
                if (!mapDataRef.current) {
                    return;
                }
                const newMapData1 = { ...mapDataRef.current };
                for (let changeH of housesSnap.docChanges()) {
                    if (changeH.type === 'added') {
                        newMapData1.houses.set(changeH.doc.id, {
                            id: changeH.doc.id,
                            latLng: changeH.doc.data().latLng,
                            statusRef: changeH.doc.data().statusRef,
                        });
                    } else if (changeH.type === 'modified') {
                        const newHouse = { ...newMapData1.houses.get(changeH.doc.id) } as House;
                        newHouse.latLng = changeH.doc.data().latLng;
                        newHouse.statusRef = changeH.doc.data().statusRef;
                        newMapData1.houses.set(changeH.doc.id, newHouse);
                    } else if (changeH.type === "removed") {
                        newMapData1.houses.delete(changeH.doc.id);
                    }
                }
                setMapData(newMapData1);
            });
            mapRef.collection('buildings').onSnapshot((buildingsSnap) => {
                if (!mapDataRef.current) {
                    return;
                }
                const newMapData1 = { ...mapDataRef.current };
                for (let changeB of buildingsSnap.docChanges()) {
                    if (changeB.type === 'added') {
                        newMapData1.buildings.set(changeB.doc.id, {
                            id: changeB.doc.id,
                            name: changeB.doc.data().name,
                            latLng: changeB.doc.data().latLng,
                            statusRef: changeB.doc.data().statusRef,
                            floors: new Map<string, Floor>(),
                        } as Building);
                        changeB.doc.ref.collection('floors').orderBy('number', 'asc').onSnapshot((floorsSnap) => {
                            if (!mapDataRef.current) {
                                return;
                            }
                            const newMapData2 = { ...mapDataRef.current };
                            const newBuilding1 = newMapData2.buildings.get(changeB.doc.id);
                            if (!newBuilding1) {
                                return;
                            }
                            for (let changeF of floorsSnap.docChanges()) {
                                if (changeF.type === 'added') {
                                    newBuilding1.floors.set(changeF.doc.id, {
                                        id: changeF.doc.id,
                                        number: changeF.doc.data().number,
                                        rooms: new Map<string, Room>(),
                                    });
                                    changeF.doc.ref.collection('rooms').orderBy('orderNumber', 'asc').onSnapshot((roomsSnap) => {
                                        if (!mapDataRef.current) {
                                            return;
                                        }
                                        const newMapData3 = { ...mapDataRef.current };
                                        const newBuilding2 = newMapData3.buildings.get(changeB.doc.id);
                                        if (!newBuilding2) {
                                            return;
                                        }
                                        const newFloor = newBuilding2.floors.get(changeF.doc.id);
                                        if (!newFloor) {
                                            return;
                                        }
                                        for (let changeR of roomsSnap.docChanges()) {
                                            if (changeR.type === 'added') {
                                                newFloor.rooms.set(changeR.doc.id, {
                                                    id: changeR.doc.id,
                                                    orderNumber: changeR.doc.data().orderNumber,
                                                    roomNumber: changeR.doc.data().roomNumber,
                                                    statusRef: changeR.doc.data().statusRef
                                                })
                                            } else if (changeR.type === 'modified') {
                                                const newRoom = { ...newFloor.rooms.get(changeR.doc.id) } as Room;
                                                newRoom.orderNumber = changeR.doc.data().orderNumber;
                                                newRoom.roomNumber = changeR.doc.data().roomNumber;
                                                newRoom.statusRef = changeR.doc.data().statusRef;
                                                newFloor.rooms.set(changeR.doc.id, newRoom);
                                            } else if (changeR.type === 'removed') {
                                                newFloor.rooms.delete(changeR.doc.id);
                                            }
                                        }
                                        setMapData(newMapData3);
                                    });
                                } else if (changeF.type === 'modified') {
                                    const newFloor = { ...newBuilding1.floors.get(changeF.doc.id) } as Floor;
                                    newFloor.number = changeF.doc.data().number;
                                    newBuilding1.floors.set(changeF.doc.id, newFloor);
                                } else if (changeF.type === 'removed') {
                                    newBuilding1.floors.delete(changeF.doc.id);
                                }
                            }
                            setMapData(newMapData2);
                        });
                    } else if (changeB.type === 'modified') {
                        const newBuilding = { ...newMapData1.buildings.get(changeB.doc.id) } as Building;
                        newBuilding.name = changeB.doc.data().name;
                        newBuilding.latLng = changeB.doc.data().latLng;
                        newBuilding.statusRef = changeB.doc.data().statusRef;
                        newMapData1.buildings.set(changeB.doc.id, newBuilding);
                    } else if (changeB.type === "removed") {
                        newMapData1.buildings.delete(changeB.doc.id);
                    }
                }
                setMapData(newMapData1);
            });
        }
    });
}