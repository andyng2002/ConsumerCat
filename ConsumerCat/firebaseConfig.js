import * as firebase from "firebase/compat";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVxyFYFCvn_sJujmcUu8Q45oC-C2s3h2s",
  authDomain: "consumercat-88562.firebaseapp.com",
  projectId: "consumercat-88562",
  storageBucket: "consumercat-88562.appspot.com",
  messagingSenderId: "528069045166",
  appId: "1:528069045166:web:a82c16f54782a09a98763f",
  measurementId: "G-6FQ8VPMT4G"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = firebase.auth();
export const db = firebase.firestore();

