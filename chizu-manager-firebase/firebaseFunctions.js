const { join } = require('path')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { default: next } = require('next')
const express = require('express')
const routes = require('next-routes')
const basicAuth = require('basic-auth-connect')

admin.initializeApp()
const db = admin.firestore();

/* next.js 用の関数 */
const USERNAME = functions.config().basic_auth.username
const PASSWORD = functions.config().basic_auth.password
const server = express()
const nextjsDistDir = join('src', require('./src/next.config.js').distDir)
const app = next({
    dev: false,
    conf: {
        distDir: nextjsDistDir,
    },
})
const handler = routes().getRequestHandler(app)
server.use(basicAuth(USERNAME, PASSWORD))
server.get('*', (req, res) => handler(req, res))
exports.nextjsFunc = functions.https.onRequest(server)

/* Authenticationからユーザの削除用関数 */
exports.onCreateDeleteAuthUser = functions.firestore
    .document('delete_auth_users/{docId}')
    .onCreate(async (snapshot, { params }) => {
        admin.auth().deleteUser(snapshot.get('uid'))
    })

/* 地図の削除用関数 */
exports.onDeleteMap = functions.firestore
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

/* ビルステータスの削除用関数 */
exports.onDeleteStatus = functions.firestore
    .document('building_statuses/{statusId}')
    .onDelete(async (statusSnap, context) => {
        const statusData = statusSnap.data()
        if (!statusData) {
            return;
        }
        const statusAfterResetingRef = statusData.statusAfterResetingRef
        if (!statusAfterResetingRef) {
            return;
        }
        const batch = admin.firestore().batch()
        const buildingsSnap = await db.collectionGroup('buildings').where('statusRef', '==', statusSnap.ref).get()
        buildingsSnap.forEach(buildingSnap => {
            batch.update(buildingSnap.ref, { statusRef: statusAfterResetingRef })
        })
        await batch.commit()
    })

/* ビルステータスの削除用関数 */
exports.onDeleteStatus = functions.firestore
    .document('statuses/{statusId}')
    .onDelete(async (statusSnap, context) => {
        const statusData = statusSnap.data()
        if (!statusData) {
            return;
        }
        const statusAfterResetingRef = statusData.statusAfterResetingRef
        if (!statusAfterResetingRef) {
            return;
        }
        const batch = admin.firestore().batch()
        const housesSnap = await db.collectionGroup('houses').where('statusRef', '==', statusSnap.ref).get()
        housesSnap.forEach(houseSnap => {
            batch.update(houseSnap.ref, { statusRef: statusAfterResetingRef })
        })
        const roomsSnap = await db.collectionGroup('rooms').where('statusRef', '==', statusSnap.ref).get()
        roomsSnap.forEach(roomSnap => {
            batch.update(roomSnap.ref, { statusRef: statusAfterResetingRef })
        })
        await batch.commit()
    })