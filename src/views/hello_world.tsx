import { h, Component, ComponentChild } from 'preact';
import { signInWithGithub } from '../utils/firebase';
import { Button } from '@mui/material';

interface Props {

}

interface State {
  message: string
}

export default class HelloWorld extends Component<Props, State> {

  readonly state = {
    message: ''
  };

  public componentDidMount = (): void => {
    this.get()
  }

  private get = async (): Promise<void> => {
    const response = await fetch('/service/hello_world');
    if (!response.ok) {
      this.setState({ message: 'Flask server is not running.' });
    }
    else {
      const data = await response.json();
      this.setState({ message: data.message });
    }
  }

  public render = (): ComponentChild => {
    const { message } = this.state;
    return (
      <div class="text-3xl font-bold underline">
        {message}
        <p>Hello</p>
        <Button>jd</Button>
        {/* <button onClick={signInWithGithub }>Click me!</button> */}
      </div>
    );
  }
}
