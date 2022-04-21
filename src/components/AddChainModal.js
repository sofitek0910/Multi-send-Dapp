import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Modal from '@mui/material/Modal'
import { DappContext } from 'contexts/DappContext'
import db from 'firebaseConfig/config'
import { getDatabase, ref, set, onValue, update } from "firebase/database";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  boxShadow: 24,
  borderRadius: 2,
}

export default function AddChainModal() {
  const [netInfo, setNetInfo] = React.useState({})
  const [netName,setNetName] = React.useState('');
  const { open, setOpen } = React.useContext(DappContext)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const {updateNetworks, setAdded} = React.useContext(DappContext)

  const AddChain = () => {
    set(ref(db,'/networks/' + netInfo.chainId), {
        name : netName, 
        chainId : netInfo.chainId, 
        rpc : netInfo.rpc, 
        contractAddress : netInfo.address,
        symbol: netInfo.symbol
    }).then(
        ()=> {
          updateNetworks();
          setAdded(true);
        }
    )
    setOpen(false)
  }

  const handleSetName = (e) =>{
    setNetName(e.target.value);
  }

  const handleChange = (e,key) =>{
    setNetInfo(Object.assign(netInfo,{[key]:e.target.value}))
  }

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              flexDirection: 'column',
              padding: '10px 0',
            }}
          >
            <TextField
              id="standard-basic"
              label="Chain Name"
              variant="standard"
              style={{ width: '80%' }}
              onChange = {(e) =>handleSetName(e)}
            />
            <TextField
              id="standard-basic"
              label="Chain id"
              variant="standard"
              style={{ width: '80%' }}
              onChange = {(e) => handleChange(e,'chainId')}
            />
            <TextField
              id="standard-basic"
              label="Contract Address"
              variant="standard"
              style={{ width: '80%' }}
              onChange = {(e) =>handleChange(e,'address')}
            />

            <TextField
              id="standard-basic"
              label="Symbol"
              variant="standard"
              style={{ width: '80%' }}
              onChange = {(e) =>handleChange(e,'symbol')}
            />

            <TextField
              id="standard-basic"
              label="RPC Endpoint"
              variant="standard"
              style={{ width: '80%' }}
              onChange = {(e) =>handleChange(e,'rpc')}
            />

            <div
              style={{
                display: 'flex',
                flexDirction: 'row',
                alignitems: 'center',
                width: '100%',
                justifyContent: 'space-around',
              }}
            >
              <Button onClick={AddChain}>Add</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}
