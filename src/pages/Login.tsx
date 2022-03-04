import { h } from 'preact';
import { signInWithGithub, signUpWithGithub } from '../utils/firebase';
import { Alert, Button, Stack } from '@mui/material';
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
    <div class="flex flex-row min-h-screen justify-center items-center">
      {errMsg && (
        <Alert severity="error">{errMsg}</Alert>
      )}
      <div class="px-28 pt-8 absolute max-w-full h-1/2 bg-white border-solid box-border border border-zinc-200 rounded-lg">
        <h1 class="text-center font-medium text-2xl leading-9">Welcome To TikTakToe</h1>
        <h2 class="text-center not-italic font-normal text-base text-zinc-400 py-2">Connect with your friends in a private manner.</h2>
        <h2 class="text-center not-italic font-normal text-base text-zinc-900 pb-8">Currently, we only support sign in with Github.</h2>
        <Stack spacing={4}>
        <Button onClick={() => handleGithub("signup")} variant="contained" disableElevation={true}>Sign up with Github</Button>
          <Button onClick={() => handleGithub("signin")} variant="outlined" disableElevation={true}>Log in with Github</Button>
        </Stack>
      </div>
    </div>
  );
}

export default Login;