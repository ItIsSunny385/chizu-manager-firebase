import firebase from 'firebase';

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
};
// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);

    if (process.env.debug === 'true') {
        firebase.auth().useEmulator("http://localhost:9099");
        firebase.functions().useEmulator("localhost", 5001);
        firebase.firestore().useEmulator("localhost", 8080);
    }
}