import firebase from 'firebase';
import { MapData } from '../types/map';

export function getMapDataArrayWithNoChildByQuerySnapshot(snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>): Array<MapData> {
    return snapshot.docs.map(x => ({
        id: x.id,
        orderNumber: x.data().orderNumber,
        name: x.data().name,
        status: x.data().status,
        borderCoords: x.data().borderCoords,
        badgeLatLng: x.data().badgeLatLng,
        buildings: [],
        houses: [],
    }));
}

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