import { h } from 'preact'
import { DialogContent, DialogContentText, DialogTitle, Modal } from '@mui/material'
import Dialog from '@mui/material/Dialog'

type MakeCommentProps = {
    postRepliedTo: string,
    isOpen: boolean,

}

function MakeComment({postRepliedTo, isOpen}: MakeCommentProps) {
  return (
  
        <Dialog open={isOpen}>
          <DialogTitle>Comment On Post: {postRepliedTo}</DialogTitle>
          <DialogContent>
            <form>
              
            </form>
          </DialogContent>
        </Dialog>

  )
}

export default MakeComment