import React from 'react'
import { h } from 'preact'

function Divider() {
  return (
    <div class=" pt-2 flex flex-row">
        <div class=" pt-8 flex w-1/2 h-1 border-zinc-200 border-l-0 border-r-0 border-t-0 border-b"></div>
        <p class="pt-5 px-2 font-normal text-sm text-zinc-300">Or</p>
        <div class=" pt-8 flex w-1/2 h-1 border-zinc-200 border-l-0 border-r-0 border-t-0 border-b"></div>
    </div>
  )
}

export default Divider