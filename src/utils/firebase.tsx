// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
// Create a storage reference from our storage service

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
        return { isSuccess: false };
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
        return { ...json, isSucess: true }
    } catch (err) {
        return { isSuccess: false };
    }
};

export const uploadPhotosToFbs = async (files: Array<File>) => {
    let imagesUrls : Array<String> = [];
    let imageRef;
    for (let file of files) {
        imageRef = ref(storage, file.name);
        const snapshot = await uploadBytes(imageRef, file).catch(error => console.log("ERROR", error));
        if (snapshot !== undefined) {
            let downloadURL = await getDownloadURL(snapshot.ref).catch(err => console.log(err));
            if (downloadURL !== undefined) {
                imagesUrls.push(downloadURL);
            }
        } 
    }

    return imagesUrls;
}
export const signInWithGithub = async () => {
    return await authenticateWithGithub(false);
};

export const signUpWithGithub = async () => {
    return await authenticateWithGithub(true);
};
