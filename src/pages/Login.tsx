import { h, Component, ComponentChild } from 'preact';
import { signInWithGithub, signUpWithGithub } from '../utils/firebase';
import { Button, Stack } from '@mui/material';

interface Props {

}

interface State {
  message: string
}

export default class Login extends Component<Props, State> {

  readonly state = {
    message: ''
  };

  public componentDidMount = (): void => {
    // this.get();
  }

  public render = (): ComponentChild => {
    const { message } = this.state;

    return (
      <div class="flex flex-row min-h-screen justify-center items-center">
      <div class="px-28 pt-8 absolute max-w-full h-1/2 bg-white border-solid box-border border border-zinc-200 rounded-lg">
      {message}
        <h1 class="text-center font-medium text-2xl leading-9">Welcome To TikTakToe</h1>
        <h2 class="text-center not-italic font-normal text-base text-zinc-400 py-2">Connect with your friends in a private manner.</h2>
        <h2 class="text-center not-italic font-normal text-base text-zinc-900 pb-8">Currently, we only support sign in with Github.</h2>
        <Stack spacing={4}>
        <Button onClick={signUpWithGithub} variant="contained" disableElevation={true}>Sign up with Github</Button>
          <Button onClick={signInWithGithub} variant="outlined" disableElevation={true}>Log in with Github</Button>
        </Stack>
    </div>
    </div>
    );

    // return (
    //   <div class="text-3xl">
    //     {message}
    //     <h1>Welcome to TikTakToe</h1>
    //     <p>Connect with your friends in a private manner.</p>
    //     <p>Currently we only support login with Github</p>
    //     <div>
    //       <h2>Log in to your account</h2>
    //       <Button onClick={signUpWithGithub} variant="contained">Sign up with Github</Button>
    //       <Button onClick={signInWithGithub} variant="contained">Log in with Github</Button>
    //     </div>
    //   </div>
    // );
  }
}
