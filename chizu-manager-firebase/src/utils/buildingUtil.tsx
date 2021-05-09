import firebase from 'firebase';
import { BasicFloor, BasicRoom, Building, } from '../types/map';

export function updateBuilding(
    buildingRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
    oldData: Building,
    newData: Building
) {
    const batch = firebase.firestore().batch();
    if (newData.name !== oldData.name) {
        batch.update(buildingRef, { name: newData.name });
    }
    /* フロア情報の追加（変更はない） */
    Array.from(newData.floors.values()).forEach(newFloor => {
        const oldFloor = oldData.floors.get(newFloor.id);
        const newFloorRef = buildingRef.collection('floors').doc(newFloor.id);
        if (oldFloor) {
            /* 部屋情報の追加変更 */
            Array.from(newFloor.rooms.values()).forEach(newRoom => {
                const oldRoom = oldFloor.rooms.get(newRoom.id);
                const newRoomRef = newFloorRef.collection('rooms').doc(newRoom.id);
                if (oldRoom) {
                    /* 部屋の変更 */
                    if (newRoom.roomNumber !== oldRoom.roomNumber) {
                        batch.update(newRoomRef, { roomNumber: newRoom.roomNumber });
                    }
                } else {
                    /* 部屋の追加 */
                    const newBasicRoom: BasicRoom = {
                        roomNumber: newRoom.roomNumber,
                        orderNumber: newRoom.orderNumber,
                        statusRef: newRoom.statusRef,
                        comment: newRoom.comment,
                    }
                    batch.set(newRoomRef, newBasicRoom);
                }
            });

            /* 部屋の削除 */
            Array.from(oldFloor.rooms.values()).forEach(oldRoom => {
                const newRoom = newFloor.rooms.get(oldRoom.id);
                if (!newRoom) {
                    const oldRoomRef = newFloorRef.collection('rooms').doc(oldRoom.id);
                    batch.delete(oldRoomRef);
                }
            });
        } else {
            /* フロア情報の追加 */
            const newBasicFloor: BasicFloor = {
                number: newFloor.number,
            };
            batch.set(newFloorRef, newBasicFloor);

            /* 部屋情報の追加変更 */
            Array.from(newFloor.rooms.values()).forEach(newRoom => {
                const newRoomRef = newFloorRef.collection('rooms').doc(newRoom.id);
                batch.set(newRoomRef, newRoom);
            });
        }
    });
    /* フロア情報の削除 */
    Array.from(oldData.floors.values()).forEach(oldFloor => {
        const newFloor = newData.floors.get(oldFloor.id);
        if (!newFloor) {
            const oldFloorRef = buildingRef.collection('floors').doc(oldFloor.id);
            batch.delete(oldFloorRef);
        }
    });
    batch.commit();
}