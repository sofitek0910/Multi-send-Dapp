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

export default function EdithainModal() {
  const {selectedNetwork, setUpdated,} = React.useContext(DappContext)
  const [netInfo, setNetInfo] = React.useState({})
  const [netName,setNetName] = React.useState('');
  const { editShow, setEditShow } = React.useContext(DappContext)
  const handleClose = () => setEditShow(false)
  const {updateNetworks, setAdded} = React.useContext(DappContext)

  React.useEffect(() => {
    let network = selectedNetwork;
    setNetInfo(network)
  }, [selectedNetwork])

  const EditChain = () => {
    set(ref(db,'/networks/' + netInfo.chainId), {
        name : netInfo.name, 
        chainId : netInfo.chainId, 
        rpc : netInfo.rpc, 
        contractAddress : netInfo.contractAddress,
        symbol: netInfo.symbol
    }).then(
        ()=> {
          updateNetworks();
          setUpdated(true);
        }
    )
    setEditShow(false)
  }

  const handleChange = (e,key) =>{
    setNetInfo(prevState => ({
        ...prevState,
        [key]: e.target.value
    }))
  }

  return (
    <div>
      <Modal
        open={editShow}
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
              value={netInfo.name}
              style={{ width: '80%' }}
              name="name"
              onChange = {(e) =>handleChange(e, 'name')}
            />
            <TextField
              id="standard-basic"
              label="Chain id"
              variant="standard"
              value={netInfo.chainId}
              style={{ width: '80%' }}
              name="chainId"
              onChange = {(e) => handleChange(e,'chainId')}
            />
            <TextField
              id="standard-basic"
              label="Contract Address"
              variant="standard"
              value={netInfo.contractAddress}
              style={{ width: '80%' }}
              name="contractAddress"
              onChange = {(e) =>handleChange(e,'address')}
            />

            <TextField
              id="standard-basic"
              label="Symbol"
              variant="standard"
              value={netInfo.symbol}
              style={{ width: '80%' }}
              name="symbol"
              onChange = {(e) =>handleChange(e,'symbol')}
            />

            <TextField
              id="standard-basic"
              label="RPC Endpoint"
              variant="standard"
              value={netInfo.rpc}
              style={{ width: '80%' }}
              name="rpc"
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
              <Button onClick={EditChain}>Update</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}
