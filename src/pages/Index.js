import React, { useState, useEffect, useContext } from 'react'
import Web3 from 'web3'
import styled from 'styled-components'
import { Web3Context } from 'contexts/Web3Context'
import { useSwitchChain } from 'hooks/useSwitchChain'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MultisenderABI from 'abi/muti.json'
import { SettingsOutlined, Tune, Web } from '@mui/icons-material'
import { data } from 'autoprefixer'
import ERC20ABI from 'abi/erc20.json'
import LoadingModal from 'components/LoadingModal'
import { Link } from 'react-router-dom'
import { async } from '@firebase/util'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import { DappContext } from 'contexts/DappContext'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  font-family: sans-serif;
`
const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background: blue;
  padding: 10px 0px;
  color: white;
  font-size: 28px;
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
  @media (max-width: 768px) {
    font-size: 12px;
  }
`

const Row = styled.div`
  display: flex;
  width: 40%;
  justify-content: space-around;
  margin: 10px 0px;
  @media (max-width: 768px) {
    width: 100%;
  }
`

const UploadButton = styled.div`
  color: white;
  background: #1976d2;
  padding: 10px;
  border-radius: 4px;
  width: fit-content;
  font-size: 18px;
  cursor: pointer;
`
const AdminButtonContainer = styled.div`
  position: flex;
  top: 20px;
  right: 20px;
`
const web3 = new Web3(window.ethereum)

const Index = () => {
  const [address, setAddress] = useState('No Connected Wallet yet.')
  const [network, setNetwork] = useState('Ropsten')
  const [isConnected, setIsConnected] = useState(false)
  const [coinType, setCoinType] = React.useState('Native Coin')
  const [list, setList] = useState()
  const [tokenAddress, setTokenAddress] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [txFee, setTxfee] = useState()
  const [contractAddress, setContractAddress] = useState()
  const { networks, updateNetworks, setOpen, multiSendContract } = useContext(
    DappContext,
  )
  const [chainId, setChainId] = useState(3)
  const [inputData, setInputData] = useState()
  const [symbol, setSymbol] = useState()
  const { connectWeb3, providerChainId, account } = useContext(Web3Context)
  const switchChain = useSwitchChain()

  useEffect(() => {
    async function getSymbol() {
      try {
        const ERC20Contract = new web3.eth.Contract(ERC20ABI.abi, tokenAddress)
        const symbol = await ERC20Contract.methods.symbol().call()
        console.log(symbol)
        setSymbol(symbol)
      } catch (err) {
        console.log(err)
      }
    }

    if (tokenAddress) {
      getSymbol()
    }
  }, [tokenAddress])

  const handleChange = (e) => {
    setCoinType(e.target.value)
  }

  useEffect(() => {
    async function getFee() {
      try {
        setNetwork(providerChainId)
        const _fee = await multiSendContract.methods.fee().call()
        const fee = web3.utils.fromWei(_fee, 'ether')
        const _contractAddress = networks[providerChainId].contractAddress
        setContractAddress(_contractAddress)
        setTxfee(fee)
      } catch (err) {}
    }

    if ((networks && networks[providerChainId]) || multiSendContract) {
      getFee()
    }
  }, [providerChainId, networks, multiSendContract])

  useEffect(() => {
    if (account !== undefined) {
      setIsConnected(true)
      setAddress(account)
    }
  }, [account])

  const getFile = (e) => {
    console.log(e)
    const file = e.target.files[0]
    const fr = new FileReader()
    let totalAmount = 0
    let data = []
    let str = ''
    fr.onload = function (result) {
      result.currentTarget.result.split('\n').map((row, index) => {
        let temp = {}

        const txData = row.split(',')
        temp.from = txData[0]
        temp.value = txData[1]

        if (temp.from && temp.value) {
          data.push(temp)
          str += txData[0] + ',' + txData[1] + '\n'
          totalAmount = totalAmount + parseFloat(txData[1])
        }

        return true
      })
      setList(data)
      setInputData(str)
    }
    fr.readAsText(file)
  }

  const connectWallet = () => {
    connectWeb3()
  }

  const changeDataList = (e) => {
    setInputData(e.target.value)
  }
  const setRest = () => {
    setInputData('')
  }

  const send = async () => {
    let address_list = []
    let value_list = []

    if (inputData === undefined && list === undefined) {
      alert('please input data.')
    } else {
      const ERC20Contract = new web3.eth.Contract(ERC20ABI.abi, tokenAddress)
      const _fee = await multiSendContract.methods.fee().call()
      console.log('fee', _fee)
      const fee = web3.utils.fromWei(_fee, 'ether')

      if (inputData === undefined) {
        alert('Please input data.')
      } else {
        inputData.split('\n').map((row) => {
          if (row !== undefined) {
            let content = row.split(',')
            if (web3.utils.isAddress(content[0]) && content[1] !== '') {
              address_list.push(content[0])
              value_list.push(parseFloat(content[1]))
            }
          }
        })
      }
      const send_ether = value_list.reduce(
        (total, current) => total + current,
        parseFloat(fee),
      )

      const send_token = value_list.reduce(
        (total, current) => total + current,
        0,
      )

      value_list = value_list.map((data) => Web3.utils.toWei(data.toString()))
      console.log(address_list, value_list, send_ether, send_token)

      if (coinType === 'Native Coin') {
        try {
          setIsModalOpen(true)
          setModalContent('Sending native coin')

          await multiSendContract.methods
            .MultisendEther(address_list, value_list, true)
            .send({
              from: address,
              value: Web3.utils.toWei(send_ether.toString(), 'ether'),
            })
          setIsModalOpen(false)
        } catch (err) {
          setIsModalOpen(false)
        }
      } else {
        try {
          setIsModalOpen(true)
          setModalContent('Approving')
          await ERC20Contract.methods
            .approve(
              networks[providerChainId].contractAddress,
              Web3.utils.toWei(send_token.toString()),
            )
            .send({
              from: address,
            })
          setIsModalOpen(false)
        } catch (err) {
          setIsModalOpen(false)
        }
        try {
          setIsModalOpen(true)
          setModalContent('Sending Custom token')
          await multiSendContract.methods
            .MultisendTokenSimple(tokenAddress, address_list, value_list, true)
            .send({
              from: address,
              value: _fee,
            })
          setIsModalOpen(false)
        } catch (err) {
          setIsModalOpen(false)
        }
      }
    }
  }

  const getTokenAddress = (e) => {
    setTokenAddress(e.target.value)
  }

  const handleChangeChain = async (e) => {
    switchChain(parseInt(e.target.value))
    setChainId(e.target.value)
  }

  return (
    <Container>
      <React.Fragment>
        <Header>
          <div>Muti Sender</div>
        </Header>
        <AdminButtonContainer>
          <Link to="/admin">Go to Admin page </Link>
        </AdminButtonContainer>
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
            <div>You wallet Address: {address}</div>
          </Text>
          <Text>
            <div> Contract Address: {contractAddress}</div>
          </Text>
          <Text>
            <div> Fee Amount : {txFee}</div>
          </Text>

          {/* <Text>Balance: {balance} Ether</Text> */}
          <Row>
            <Select
              value={coinType}
              onChange={handleChange}
              defaultValue={coinType}
              autoWidth={true}
            >
              <MenuItem value={'Native Coin'}>Native Coin</MenuItem>
              <MenuItem value={'Custom token'}>Costom token</MenuItem>
            </Select>
            <TextField
              label="Token Address"
              variant="outlined"
              style={{ width: '50%' }}
              disabled={coinType === 'Native Coin' ? true : false}
              onChange={getTokenAddress}
            />
          </Row>

          <FormControl>
            <InputLabel id="demo-simple-select-label">Select Chain</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={network}
              onChange={handleChangeChain}
              autoWidth={true}
              label="Select Chain"
            >
              {Object.values(networks).map((net, index) => {
                return (
                  <MenuItem value={net.chainId} key={index}>
                    {net.name}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
          {coinType !== 'Native Coin' && symbol ? (
            <Text>
              <div> Token Name : {symbol}</div>
            </Text>
          ) : (
            ''
          )}

          <Text style={{ margin: '10px 0px' }}>
            Format: 0xf2c7bEa00ebB87B5b26140dd4ceB46a5d5D435B4, 0.01
          </Text>

          <textarea
            placeholder="address amount"
            style={{ width: '80%', fontSize: '12px' }}
            rows={10}
            onChange={changeDataList}
            multiline
            value={inputData}
          />

          <Row>
            <Button variant="contained" onClick={send}>
              SEND
            </Button>

            <React.Fragment>
              <label htmlFor="fileUpload">
                <UploadButton>Click to Upload</UploadButton>
              </label>
              <input
                id="fileUpload"
                type="file"
                multiple="multiple"
                accept=".txt, .csv, .xls, .xlsx"
                style={{ display: 'none' }}
                onChange={(e) => getFile(e)}
              />
            </React.Fragment>
          </Row>
        </Body>
      </React.Fragment>
      <LoadingModal isloading={isModalOpen} content={modalContent} />
    </Container>
  )
}

export default Index
