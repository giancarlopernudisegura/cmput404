import { h, Component, ComponentChild } from 'preact'

type Props = {
  path: string;
}

function HelloWorld({ path }: Props ) {
  return (
    <div>Hello World!
      This is a path: {path}
    </div>
  )
}

export default HelloWorld;

