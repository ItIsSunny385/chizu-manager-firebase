module.exports = {
    distDir: '../.next',
    env: {
        debug: process.env.FIREBASE_DEBUG,
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        googleMapsApiKey: process.env.GOOGLEMAPS_API_KEY,
        googleMapsCenterLat: process.env.GOOGLE_MAPS_CENTER_LAT,
        googleMapsCenterLng: process.env.GOOGLE_MAPS_CENTER_LNG,
        googleMapsZoom: process.env.GOOGLE_MAPS_ZOOM,
    }
}
