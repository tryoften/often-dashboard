import { firebase as FirebaseConfig } from './config';

const firebase = require('firebase');

var main = firebase.initializeApp(FirebaseConfig.dev);
console.log("Initialized Firebase (main)", FirebaseConfig.dev);

export default main;
export var production = firebase.initializeApp(FirebaseConfig.production, "production");
