const functions = require('firebase-functions')

module.exports = {
    distDir: '../.next',
    env: {
        debug: functions.config().debug.debug,
        apiKey: functions.config().project_config.api_key,
        authDomain: functions.config().project_config.auth_domain,
        projectId: functions.config().project_config.project_id,
        storageBucket: functions.config().project_config.storage_bucket,
        messagingSenderId: functions.config().project_config.messaging_sender_id,
        appId: functions.config().project_config.app_id,
        googleMapsApiKey: functions.config().google_maps.api_key,
        googleMapsCenterLat: functions.config().google_maps.center.lat,
        googleMapsCenterLng: functions.config().google_maps.center.lng,
        googleMapsZoom: functions.config().google_maps.zoom,
    }
}
