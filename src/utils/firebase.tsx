// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';
import { FAILED_GITHUB_AUTH } from '../utils/errorMsg';

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
        throw Error(FAILED_GITHUB_AUTH);
    }

    let json = null;
    let res = null;
    try {
        // send a request to Backend after signed up
        res = await fetch(`${BACKEND_HOST}/${signup ? 'signup' : 'login'}`, {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `SameSite=None; Secure;Domain=${BACKEND_HOST}`
            },
            mode: 'cors',
            credentials: 'include',
            method: 'POST',
            body: JSON.stringify({
                'token': `${token}`
            })
        });

        json = await res.json();
    } catch (err) {
        throw Error(FAILED_GITHUB_AUTH);
    }

    if (res.status !== 200) {
        throw Error(`${FAILED_GITHUB_AUTH} ` + json.message)
    }
    return { status: res.status, ...json};
};

export const signInWithGithub = async () => {
    try {
        const test = await authenticateWithGithub(false);
        return test;
    } catch (err) {
        throw Error((err as Error).message);
    }
};

export const signUpWithGithub = async () => {
    try {
        const test =  await authenticateWithGithub(true);
        return test;
    } catch (err) {
        throw Error((err as Error).message);
    }
};
