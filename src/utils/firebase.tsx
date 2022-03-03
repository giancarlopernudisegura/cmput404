// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
initializeApp(firebaseConfig);
const provider = new GithubAuthProvider();

const BACKEND_HOST = process.env.FLASK_HOST;

// Referenced https://firebase.google.com/docs/auth/web/github-auth
const authenticateWithGithub = async (signup: Boolean) => {

    const auth = getAuth();
    let token = null;
    try {
        const result = await signInWithPopup(auth, provider);
        // you can access user's information with result.user

        token = await result.user.getIdToken();
    } catch (err) {
        // Handle errors
        console.log(err);
        console.log("ERROR", err);
        throw err;
    }

    try {
        // send a request to Backend after signed up
        let res = await fetch(`${BACKEND_HOST}/${signup ? 'signup' : 'login'}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Set-Cookie': `SameSite=None; Secure;Domain=${BACKEND_HOST}`
            },
            mode: 'cors',
            credentials: 'include',
            method: 'POST',
            body: new URLSearchParams({
                'token': `${token}`
            })
        });

        let json = res.json();
        return json
    } catch (err) {
        throw err;
    }
};

export const signInWithGithub = async () => {
    return await authenticateWithGithub(false);
};

export const signUpWithGithub = async () => {
    return await authenticateWithGithub(true);
};
