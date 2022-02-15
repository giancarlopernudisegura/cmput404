import React from 'react'
import { h, Component, ComponentChild } from 'preact'
import Divider from '../../components/or-divider'
import Footer from '../../components/Footer'

type AuthProps = {
  path: string
}

function Authentication({path}: AuthProps) {
  return (
    <div class="flex flex-row min-h-screen justify-center items-center">
      <h1>TikTakToe</h1>
      <div class="px-28 pt-8 absolute max-w-full h-3/5 bg-white border-solid box-border border border-zinc-200 rounded-lg">
        <h1 class="text-center font-medium text-2xl leading-9">Welcome To TikTakToe</h1>
        <h2 class="text-center not-italic font-normal text-base text-zinc-400 py-2">Enter your email and password to get started.</h2>
      <form>
        <div class="mb">
        <label for="email" class="pt-6 block mb-2 text-sm font-small text-gray-9\800">
          Email Address
        </label>
        <input type="text" name="email" class="
        bg-gray-50 border 
        border-gray-300 
        text-gray-900 
        text-sm rounded-lg 
        focus:ring-blue-500 
        focus:border-blue-500 
        block w-full p-2.5"
        placeholder="yourname@example.com" required />
        </div>

        <div class="mb-2">
        <label for="password" class="pt-6 block mb-2 text-sm font-small text-gray-9\800">
          Password
        </label>
        <input type="password" name="password" class="
        bg-gray-50 border 
        border-gray-300 
        text-gray-900 
        text-sm rounded-lg 
        focus:ring-blue-500 
        focus:border-blue-500 
        block w-full p-2.5"
        placeholder="Password" required />
        </div>
        <div class="pt-8 items-center justify-center">
        <button type="submit" class="text-white 
        bg-blue-500 
        font-medium 
        rounded-lg 
        text-sm 
        w-full 
        px-5 
        py-2.5 
        hover:bg-blue-600">
        Sign In
        </button>
        </div>
        <div class="pt-8 items-center justify-center">
        <div class="text-sm font-medium text-gray-900 text-center"> 
          Don't have an account? <a href="/signup" class="text-blue-500 hover:text-blue-700 font-bold">Sign Up</a>
        </div>
        </div>
      </form>
    </div>
    </div>
  )
}

export default Authentication