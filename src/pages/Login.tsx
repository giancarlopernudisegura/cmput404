import { h } from 'preact';
import { signInWithGithub, signUpWithGithub } from '../utils/firebase';
import { Alert, Button } from '@mui/material';
import { route } from 'preact-router';
import { useState } from 'preact/hooks';

type Props = {
  path: string
};

const Login = (props: Props) => {
  const [ errMsg, setErrMsg] = useState("");

  const handleGithub = async (method : string): Promise<void> => {
    try {
      if (method == "signup") {
        await signUpWithGithub();
      } else if (method == "signin") {
        await signInWithGithub()
      }
      route('/app')
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
        <Button onClick={() => handleGithub("signup")} variant="contained">Sign up with Github</Button>
        <Button onClick={() => handleGithub("signin")} variant="contained">Log in with Github</Button>
      </div>
    </div>
  );
}

export default Login;