import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "loginmishramart.firebaseapp.com",
    projectId: "loginmishramart",
    storageBucket: "loginmishramart.firebasestorage.app",
    messagingSenderId: "97458354606",
    appId: "1:97458354606:web:dfc40296e08120ab40b03f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export { auth, provider }
