const { join } = require('path')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { default: next } = require('next')

const nextjsDistDir = join('src', require('./src/next.config.js').distDir)

const nextjsServer = next({
    dev: false,
    conf: {
        distDir: nextjsDistDir,
    },
})
const nextjsHandle = nextjsServer.getRequestHandler()

exports.nextjsFunc = functions.https.onRequest((req, res) => {
    return nextjsServer.prepare().then(() => nextjsHandle(req, res))
})

admin.initializeApp()

/* Authenticationからユーザの削除用関数 */
exports.onCreateDeleteAuthUser = functions.firestore
    .document('delete_auth_users/{docId}')
    .onCreate(async (snapshot, { params }) => {
        admin.auth().deleteUser(snapshot.get('uid'))
    })

/* 地図の削除用関数 */
exports.onnDeleteMap = functions.firestore
    .document('maps/{mapId}')
    .onDelete(async (mapSnap, context) => {
        const batch = admin.firestore().batch()
        const buildingsSnap = await mapSnap.ref.collection('buildings').get()
        buildingsSnap.docs.forEach(buildingSnap => {
            batch.delete(buildingSnap.ref)
        })
        const housesSnap = await mapSnap.ref.collection('houses').get()
        housesSnap.docs.forEach(houseSnap => {
            batch.delete(houseSnap.ref)
        })
        await batch.commit()
    })

/* 集合住宅の削除用関数 */
exports.onDeleteBuilding = functions.firestore
    .document('maps/{mapId}/buildings/{buildingId}')
    .onDelete(async (buildingSnap, context) => {
        const batch = admin.firestore().batch()
        const floorsSnap = await buildingSnap.ref.collection('floors').get()
        floorsSnap.docs.forEach(floorSnap => {
            batch.delete(floorSnap.ref)
        })
        await batch.commit()
    })

/* フロアの削除用関数 */
exports.onDeleteFloor = functions.firestore
    .document('maps/{mapId}/buildings/{buildingId}/floors/{floorId}')
    .onDelete(async (floorSnap, context) => {
        const batch = admin.firestore().batch()
        const roomsSnap = await floorSnap.ref.collection('rooms').get()
        roomsSnap.forEach(roomSnap => {
            batch.delete(roomSnap.ref)
        })
        await batch.commit();
    })