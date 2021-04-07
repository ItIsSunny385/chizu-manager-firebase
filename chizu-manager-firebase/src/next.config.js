const functions = require('firebase-functions')

module.exports = {
    distDir: '../.next',
    env: {
        debug: functions.config().debug,
        apiKey: functions.config().firebase_config.api_key,
        authDomain: functions.config().firebase_config.auth_domain,
        projectId: functions.config().firebase_config.project_id,
        storageBucket: functions.config().firebase_config.storage_bucket,
        messagingSenderId: functions.config().firebase_config.messaging_sender_id,
        appId: functions.config().firebase_config.app_id,
    }
}
