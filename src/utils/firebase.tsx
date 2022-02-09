// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const provider = new GithubAuthProvider();
// provider.setCustomParameters({
//     // TODO: define a redirect URI
//     'redirect_uri': 'https://google.com/',
//     'client_id': ''
// });

const auth = getAuth();

export const signInWithGithub = async () => {
    try {
        const res = await signInWithPopup(auth, provider);
        const user = res.user;
        console.log("USER", await user.getIdToken());
        const credential = GithubAuthProvider.credentialFromResult(res);
        const token = credential?.accessToken;

        console.log("TOKEN", token);
        // send a request to Backend
        fetch('http://localhost:5000/service/test', {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }).then(response => response.json());

    } catch (err) {
        console.log("ERROR", err);
        // Handle Errors here.
        // const errorCode = err.code;
        // const errorMessage = err.message;
        // // The email of the user's account used.
        // const email = err.email;
        // // The AuthCredential type that was used.
        // const credential = GithubAuthProvider.credentialFromError(err);
    }
};
