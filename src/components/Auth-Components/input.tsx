import React from 'react'
import { h, FunctionComponent } from 'preact'

interface InputProps {

    labelText: string
    labelType: string;
    inputType: string;
    name: string;
    placeholder: string;
    children: any;
}

function Input({labelText, labelType, inputType, name, placeholder, children}: InputProps) {
  return (
    <div class="mb">
        <label for={labelType} class="pt-6 block mb-2 text-sm font-small text-gray-9\800">
          {labelText}
        </label>
        <input type={inputType} name={name} class="
        bg-gray-50 border 
        border-gray-300 
        text-gray-900 
        text-sm rounded-lg 
        focus:ring-blue-500 
        focus:border-blue-500 
        block w-full p-2.5"
        placeholder={placeholder} required />
    </div>
  )
}

export default Input