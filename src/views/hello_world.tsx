import { h, Component, ComponentChild } from 'preact'
import Post from '../components/Post'
import { Button } from '@mui/material';

type HelloWorldProps = {
  path: string;
}

function HelloWorld({ path }: HelloWorldProps ) {

  return (
    <div>
      <h1>TikTakToe</h1>
      <h2>Current path: {path}</h2>
      
      <Post title="Hello World" body="This is a body" author="John Doe"/>
    </div>
  )
}

export default HelloWorld;

