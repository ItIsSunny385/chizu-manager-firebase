const { join } = require('path')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { default: next } = require('next')
const express = require('express')
const routes = require('next-routes')
const basicAuth = require('basic-auth-connect')

admin.initializeApp();

/* next.js 用の関数 */
const USERNAME = functions.config().basic_auth.username
const PASSWORD = functions.config().basic_auth.password
const server = express();
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

/* 集合住宅の削除用関数 */
exports.onDeleteBuilding = functions.firestore
    .document('maps/{mapId}/buildings/{buildingId}')
    .onDelete(async (buildingSnap, context) => {
        const batch = admin.firestore().batch()
        const floorsSnap = await buildingSnap.ref.collection('floors').get()
        await Promise.all(floorsSnap.docs.map(async floorSnap => {
            const roomsSnap = await floorSnap.ref.collection('rooms').get()
            roomsSnap.docs.map(roomSnap => {
                batch.delete(roomSnap.ref)
            })
            batch.delete(floorSnap.ref)
        }))
        await batch.commit();
    })