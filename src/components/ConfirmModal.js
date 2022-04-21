import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  boxShadow: 24,
  borderRadius:2
};

export default function ConfirmModal({action,show}) {

  return (
    <div>
      <Modal
        open={show}
        onClose={() =>action()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>

          <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginBottom:'20px',width:'100%',height:'100%',flexDirection:'column',padding:"20px 0px"}}>
            Are you really going to remove this Chain?
            <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',width:'100%',marginTop:'20px'}}>
            
              <Button onClick={() => action(true)}  variant="contained"> Confirm </Button>
              <Button onClick={() => action(false)}  variant="contained"> Cancel </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
