import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

// This is not secret :)
const firebaseConfig = {
  apiKey: 'AIzaSyCDqoGEfIRFPrLuYyXfnJb6Agrx2VY3kbY',
  authDomain: 'togowl.firebaseapp.com',
  databaseURL: 'https://togowl.firebaseio.com',
  projectId: 'togowl',
  storageBucket: 'togowl.appspot.com',
  messagingSenderId: '505439731265',
  appId: '1:505439731265:web:e8dfd007733f97471c50c0',
};
firebase.initializeApp(firebaseConfig);

export default firebase;
