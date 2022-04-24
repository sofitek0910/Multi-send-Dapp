import React, { useState, useEffect, useContext } from 'react'
import Web3 from 'web3'
import styled from 'styled-components'
import { Web3Context } from 'contexts/Web3Context'
import { useSwitchChain } from 'hooks/useSwitchChain'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import LoadingModal from 'components/LoadingModal'
import { Link } from 'react-router-dom'
import AddChainModal from 'components/AddChainModal'
import EditChainModal from 'components/EditChainModal'
import FormControl from '@mui/material/FormControl';
import { DappContext } from 'contexts/DappContext'
import { Delete } from '@mui/icons-material'
import EditIcon from '@mui/icons-material/Edit';
import { remove,ref } from "firebase/database";
import db from 'firebaseConfig/config'
import ConfirmModal from '../components/ConfirmModal'
import SuccessModal from 'components/SuccessModal'
import ChangeSuccessModal from 'components/ChangeSuccessModal'
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background: #000;
  colour: white;
  font-family: sans-serif;
`
const Header = styled.div`
  width: 100%;
  text-align: center;
  background: #212121;
  padding: 20px 0px;
  color: white;
  font-size: 45px;
  font-weight: 600;
`

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
const Text = styled.div`
  font-size: 18px;
  color: #fff;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`
const Row = styled.div`
  display: flex;
  width: 40%;
  justify-content: space-around;
  align-items: center;
  margin: 10px 0px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const web3 = new Web3(window.ethereum)

const Admin = () => {
  const [address, setAddress] = useState('No Connected Wallet yet.')
  const [isConnected, setIsConnected] = useState(false)
  const [network, setNetwork] = useState('')
  const [ownerAddress, setOwnerAddress] = useState();
  const [contractOwner,setContractOwner] = useState();
  const [feeAddress, setFeeAddress] = useState()
  const [fee, setFee] = useState()
  const [isSending, setIsSendding] = useState(false)
  const { connectWeb3, providerChainId, account } = useContext(Web3Context)
  const { networks, setOpen, multiSendContract, added, setAdded, updated, setUpdated, setEditShow, selectedId, setSelectedId, readNetwork } = useContext(DappContext)
  const [show,setShow] =  useState(false);
  const switchChain = useSwitchChain();


  useEffect(() => {
    if (account !== undefined) {
      setIsConnected(true)
      setAddress(account)
    }
  }, [account])

  useEffect(() =>{
    if(networks != null && networks.length != 0) {
      setNetwork(providerChainId);
      if(!networks[providerChainId]) {
        alert("You din't deploy muti-contract yet");
      }
    }
    
  },[providerChainId,networks])

  useEffect(()=> {
    async function getOwner() {
      try {
        const owner = await multiSendContract.methods.owner().call()
        setContractOwner(owner)
      }
      catch (err) {
      }
    }
    getOwner()
    
  }, [multiSendContract])
  const connectWallet = () => {
    connectWeb3()
  }
  const handleChangeChain = async (e) => {
    switchChain(parseInt(e.target.value))

  }

  const getOwnerAddress = (e) => {
    setOwnerAddress(e.target.value)
  }
  const getFeeAddress = (e) => {
    setFeeAddress(e.target.value)
  }
  const getFee = (e) => {
    setFee(e.target.value)
  }

  const changeOwner = async () => {
    if (ownerAddress === undefined) {
      alert('please input Owner Address')
    } else {
      setIsSendding(true)
      try {
        console.log('multiSendContract',multiSendContract)
        await multiSendContract.methods.changeOwner(ownerAddress).send({
          from: address,
        })
        setIsSendding(false)
      } catch (err) {
        setIsSendding(false)
      }
    }
  }

  const changeFeeAddress = async () => {
    if (feeAddress === undefined) {
      alert('please input Fee Address')
    } else {
      setIsSendding(true)
      try {
         await multiSendContract.methods.changeFeeAddress(feeAddress).send({
          from: address,
        })
        setIsSendding(false)
      } catch (err) {
        setIsSendding(false)
      }
    }
  }

  const changeFee = async () => {
    if (fee === undefined) {
      alert('please input fee amount.')
    } else {
      try {
        setIsSendding(true)
        multiSendContract && await multiSendContract.methods.changeFee(web3.utils.toWei(fee)).send({
          from: address,
        })
        setIsSendding(false)
      } catch (err) {
        setIsSendding(false)
      }
    }
  }

  const handleNetAdd = () => {
    setOpen(true)
  }
  const removeChain = (e,chainId) => {
    e.stopPropagation();
    setShow(true);
    setSelectedId(chainId)
  
    //remove(ref(db,'/networks/' + chainId )).then(()=> console.log('deleted'));
  }
  const editChain = (e,chainId) => {
    console.log("chain->", chainId)
    e.stopPropagation();
    setEditShow(true);
    readNetwork(chainId)
  
    //remove(ref(db,'/networks/' + chainId )).then(()=> console.log('deleted'));
  }
  const handleConfirm = (state) =>{
      if (state) {
          remove(ref(db,'/networks/' + selectedId )).then(()=> console.log('deleted'));
          setShow(false)
      }
      else {
        setShow(false)
      }
  }
  const handleSuccess = () =>{
    setAdded(false)
  }
  const handleUpdate = () =>{
    setUpdated(false)
  }
  
  return (
    <Container>
      <Header>
        <div>MultiSendApp</div>
        <div style={{fontSize: '16px', marginTop: '20px'}}>Admin Panel</div>
      </Header>
      <Link style={{color: '#fff'}} to="/">Go to Sending Page</Link>
      <Body>
        <Button
          onClick={connectWallet}
          variant="contained"
          style={{ margin: '10px 0px' }}
          color={isConnected ? 'error' : 'primary'}
        >
          {isConnected ? 'WALLET CONNECTED' : 'CONNECT WALLET'}
        </Button>
        <Text>
          <div>Address: {address}</div>
        </Text>
        <Row>
        <FormControl>
            {networks != null?
              <Select
                style={{backgroundColor: "#fff"}}
                id="net"
                value={network}
                onChange={handleChangeChain}
                autoWidth={true}
              >
                {Object.values(networks).map((net, index) => {
                  return (
                    <MenuItem value={net.chainId} key={index}>
                      {net.name} 
                      <Button onClick = {(e) => removeChain(e,net.chainId)}><Delete /></Button>
                      <Button onClick = {(e) => editChain(e,net.chainId)}><EditIcon /></Button>
                    </MenuItem>
                  )
                })}
              </Select>:
              <Select>
                <MenuItem value="No chain">No Chain</MenuItem>
              </Select>
            }
          </FormControl>
          <Button style={{backgroundColor: 'orange'}} variant="contained" onClick={handleNetAdd}>
            Add NetWork
          </Button>
        </Row>
        <div style={{color:'red'}}>You have to be owner of the contract</div>
        <Row>
          <div style={{color: '#fff'}}> Owner Address: {contractOwner}</div>
        </Row>
        <Row>
          <div style={{color: '#fff'}}> Owner Address:</div>
          <input
            label="Owner Address"
            variant="outlined"
            style={{ width: '50%' }}
            onChange={getOwnerAddress}
          />
        </Row>
        <Row>
          <div style={{color: '#fff'}}> Fee Address:</div>
          <input
            label="Fee Address"
            variant="outlined"
            style={{ width: '50%' }}
            onChange={getFeeAddress}
          />
        </Row>
        <Row>
          <div style={{color: '#fff'}}> Fee amount:</div>
          <input
            label="Fee amount"
            variant="outlined"
            style={{ width: '50%' }}
            onChange={getFee}
          />
        </Row>

        <Row>
          <Button style={{backgroundColor: '#cfa144'}} variant="contained" onClick={changeOwner}>
            Change Owner
          </Button>
          <Button style={{backgroundColor: '#cfa144'}} variant="contained" onClick={changeFeeAddress}>
            Change Free Address
          </Button>
          <Button style={{backgroundColor: '#cfa144'}}  variant="contained" onClick={changeFee}>
            Change Fee
          </Button>
        </Row>
      </Body>
      <LoadingModal isloading={isSending} content="Setting" />
      <AddChainModal/>
      <EditChainModal/>
      <SuccessModal action ={handleSuccess} show={added}/>
      <ChangeSuccessModal action ={handleUpdate} show={updated}/>
      <ConfirmModal action = {handleConfirm} show={show}/>
    </Container>
  )
}

export default Admin
