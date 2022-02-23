import { h, Component, ComponentChild } from 'preact';
import { signInWithGithub } from '../utils/firebase';
import { Alert, Button } from '@mui/material';
import { useEffect, useState } from 'preact/hooks';
import { Router, route } from 'preact-router';


type Props = {
	path: string,
	author: object | null,
  setAuthor: Function
}

const Login = (props : Props) => {
  const [ errMsg, setErrMsg] = useState("");

  useEffect(() : void => {
    if (props.author && props.path === "/login") {
			route('/', true)
		}
  });

  const handleLogIn = async () => {
    try {
      let res = await signInWithGithub();
      props.setAuthor(res.data)
      route('/');
    } catch (err) {
      if (err instanceof Error) {
        setErrMsg(err.message);
      }
    }
  }

  return (
    <div class="text-3xl">
      {errMsg && (
        <Alert severity="error">{errMsg}</Alert>
      )}
      <h1>Welcome to TikTakToe</h1>
      <p>Connect with your friends in a private manner.</p>
      <p>Currently we only support login with Github</p>
      <div>
        <h2>Log in to your account</h2>
        <Button onClick={handleLogIn} variant="contained">Sign in with Github!</Button>
      </div>
    </div>
  );
}

export default Login;
