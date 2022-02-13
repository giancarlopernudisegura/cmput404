// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
initializeApp(firebaseConfig);
const provider = new GithubAuthProvider();

const auth = getAuth();

// Referenced https://firebase.google.com/docs/auth/web/github-auth
export const signInWithGithub = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        // you can access user's information with result.user
        const token = await result.user.getIdToken();

        console.log("TOKEN", token);

        // send a request to Backend after signed up
        fetch('http://localhost:5000/service/verify_login', {
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(response => response.json());

    } catch (err) {
        // Handle errors
        console.log(err.errorMessage);
        console.log("ERROR", err);
    }
};
