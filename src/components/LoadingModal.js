import * as React from 'react';
import Box from '@mui/material/Box';
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

export default function LoadingModal({isloading,content}) {
 
  const handleOpen = () => React.setOpen(true);
  const handleClose = () => React.setOpen(false);

  return (
    <div>
      <Modal
        open={isloading}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'100%',height:'100%',flexDirection:'column'}}>
            <img src="assets/images/loading.gif" width={'120px'}/>
            <div>{content}...</div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
