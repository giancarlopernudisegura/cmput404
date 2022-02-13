import { h, Component, ComponentChild } from 'preact';
import { signInWithGithub } from '../utils/firebase';


interface Props {

}

interface State {
  message: string
}

export default class Homepage extends Component<Props, State> {

  readonly state = {
    message: ''
  };

  public componentDidMount = (): void => {
    // this.get();
  }

  public render = (): ComponentChild => {
    const { message } = this.state;

    return (
      <div class="text-3xl font-bold underline">
        {message}
        <h1>Welcome to TikTakToe</h1>
        <p>Connect with your friends in a private manner.</p>
        <p>Currently we only support login with Github</p>
        <div>
          <h2>Log in to your account</h2>
          <button onClick={signInWithGithub}>Sign in with Github!</button>
        </div>
      </div>
    );
  }
}
