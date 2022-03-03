import { h, Component, ComponentChild } from 'preact'
import Input from '../../components/Auth-Components/input'
import Link from 'preact-router'

type AuthProps = {
    path: string
  }

function SignUp({path}: AuthProps) {
  return (
    <div class="flex flex-row min-h-screen justify-center items-center">
        <div class="px-28 pt-8 absolute max-w-full h-4/5 bg-white border-solid box-border border border-zinc-200 rounded-lg">
        <h1 class="text-center font-medium text-2xl leading-9">Join TikTakToe</h1>
        <h2 class="text-center not-italic font-normal text-base text-zinc-400 py-2">Enter your first name, last name, email, and password to join TikTakToe.</h2>
        <form>
            <Input
            labelText='First Name'
            labelType='text'
            inputType='text'
            name='name'
            placeholder='Enter your first name'
            >
            </Input>
            <Input
            labelText='Last Name'
            labelType='text'
            inputType='text'
            name='last-name'
            placeholder='Enter your last name'
            >
            </Input>
            <Input
            labelText='Email Address'
            labelType='email'
            inputType='email'
            name='email-address'
            placeholder='yourname@example.com'
            >
            </Input>
            <Input
            labelText='Password'
            labelType='password'
            inputType='password'
            name='password'
            placeholder='Password'
            >
            </Input>
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
                Sign Up
            </button>
            </div>
            <div class="pt-8 items-center justify-center">
            <div class="text-sm font-medium text-gray-900 text-center"> 
            Already have an account? <a href="/" class="text-blue-500 hover:text-blue-700 font-bold">Sign In</a>
            </div>
            </div>
        </form>
        </div>
    </div>
  )
}

export default SignUp