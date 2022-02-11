import { h, Component, ComponentChild, useState } from 'preact';
import { signInWithGithub } from '../utils/firebase';

interface Props {

}

interface State {
  isLoading: boolean
}

export default class Homepage extends Component<Props, State> {

  readonly = {
    isLoading: false
  };

  public componentDidMount = (): void => {
    this.get()
  }

  private get = async (): Promise<void> => {
    // const response = await fetch('/service/hello_world');
    // if (!response.ok) {
    //   this.setState({ message: 'Flask server is not running.' });
    // }
    // else {
    //   const data = await response.json();
    //   this.setState({ message: data.message });
    // }
  }

  public render = (): ComponentChild => {
    const { message } = this.state;
    return (
      <div class="text-3xl font-bold underline">
        {message}
        <p>Hello</p>
        <button onClick={signInWithGithub }>Click me!</button>
      </div>
    );
  }
}
