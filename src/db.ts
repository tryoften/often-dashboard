import { firebase as FirebaseConfig } from './config';

const firebase = require('firebase');

try {
    var main = firebase.initializeApp(FirebaseConfig.dev);
    console.log("Initialized Firebase (main)", FirebaseConfig.dev);
} catch (e) {
    console.log("Database already initialized", e);
}

export default main;
export var production = firebase.initializeApp(FirebaseConfig.production, "production");
