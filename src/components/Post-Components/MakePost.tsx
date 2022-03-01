import React from 'react'
import { h } from 'preact'
import { Box, FormControl } from '@mui/material';
import { Avatar } from '@mui/material';
import { blue } from '@mui/material/colors';
import image from '../../assets/images/sample-image.jpg'
import { useFormControl } from '@mui/material';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Camera, Send } from '@mui/icons-material';
import { Fab } from '@mui/material';

const Input = styled('input')({
    display: 'none',
  });

function MakePost() {
  return (
    <div class="max-w-md md:h-48 bg-gray-100 rounded-xl overflow-hidden md:max-w-2xl border border-slate-300">
        <div class='md:flex p-4'>
            <div class='pt-5'>
            <Avatar alt='user-image' src={image}></Avatar>
            </div>
        <div class='pl-4 pt-2 md:w-full mx-4'>
        <input type='text'id='make-post'class='w-full md:h-16 rounded-lg pl-8 border border-slate-300' contentEditable={true} placeholder="What's on your mind?" ></input>
        </div>
        </div>
        <div class='p-4 flex justify-between'>
        <label htmlFor="contained-button-file">
            <Input accept="image/*" id="contained-button-file" multiple type="file" />
            <Button variant="contained" component="span" startIcon={<Camera />} disableElevation={true}>Upload</Button>
        </label>
        <Fab
        color='primary'
        aria-label='send'>
        <Send />
        </Fab>
        </div>
    </div>
  )
}

export default MakePost;