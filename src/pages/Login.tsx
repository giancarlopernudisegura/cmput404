import { h, Component, ComponentChild } from 'preact';
import { signInWithGithub, signUpWithGithub } from '../utils/firebase';
import { Button } from '@mui/material';

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
      <div class="text-3xl">
        {message}
        <h1>Welcome to TikTakToe</h1>
        <p>Connect with your friends in a private manner.</p>
        <p>Currently we only support login with Github</p>
        <div>
          <h2>Log in to your account</h2>
          <Button onClick={signUpWithGithub} variant="contained">Sign up with Github</Button>
          <Button onClick={signInWithGithub} variant="contained">Log in with Github</Button>
        </div>
      </div>
    );
  }
}
