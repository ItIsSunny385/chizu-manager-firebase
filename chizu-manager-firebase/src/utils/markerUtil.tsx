import firebase from 'firebase';

export const getMarkerUrl = (color: string) => {
    return 'https://maps.google.com/mapfiles/ms/icons/' + color + '.png';
};

export const getGoogleMapRouteUrl = (dest: firebase.firestore.GeoPoint) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`;
};