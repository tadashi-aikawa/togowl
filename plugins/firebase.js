import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// This is not secret :)
const firebaseConfig = require('../.firebase.config.json');
firebase.initializeApp(firebaseConfig);

export default firebase;
