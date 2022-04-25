import React, { useState, useEffect, useContext } from 'react'
import Web3 from 'web3'
import styled from 'styled-components'
import { Web3Context } from 'contexts/Web3Context'
import { useSwitchChain } from 'hooks/useSwitchChain'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import ERC20ABI from 'abi/erc20.json'
import LoadingModal from 'components/LoadingModal'
import { Link } from 'react-router-dom'
import FormControl from '@mui/material/FormControl'
import { DappContext } from 'contexts/DappContext'

const Container = styled.div`
  background: #000;
  height: 100vh;
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
  padding-bottom: 20px;
`
const Text = styled.div`
  font-size: 18px;
  color: white;
  @media (max-width: 768px) {
    font-size: 12px;
    color: white;
  }
`

const Row = styled.div`
  display: flex;
  width: 57%;
  justify-content: space-between;
  margin: 10px 0 0 0;
  @media (max-width: 1100px) {
    width: 75%;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`

const UploadButton = styled.div`
  color: white;
  background: #cfa144;
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
  const [tokenAddress, setTokenAddress] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [txFee, setTxfee] = useState(0)
  const [sendAmount, setSendAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [contractAddress, setContractAddress] = useState()
  const [coinSymbol, setCoinSymbol] = useState()
  const { networks, updateNetworks, setOpen, multiSendContract } = useContext(
    DappContext,
  )
  const [chainId, setChainId] = useState(3)
  const [inputData, setInputData] = useState()
  const [symbol, setSymbol] = useState('')
  const { connectWeb3, providerChainId, account } = useContext(Web3Context)
  const switchChain = useSwitchChain()

  useEffect(() => {
    async function getSymbol() {
      setSymbol("");
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
    setTokenAddress("")
    setSymbol("")
  }

  useEffect(() => {
    async function getFee() {
      try {
        setNetwork(providerChainId)
        const _fee = await multiSendContract.methods.fee().call()
        const fee = web3.utils.fromWei(_fee, 'ether')
        const _contractAddress = networks[providerChainId].contractAddress
        setContractAddress(_contractAddress)
        setCoinSymbol(networks[providerChainId].symbol)
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
    let address_list = []
    let value_list = []
    setInputData(e.target.value)
    if (e.target.value === undefined) {
      alert('Please input data.')
    } else {
      e.target.value.split('\n').map((row) => {
        if (row !== undefined) {
          let content = row.split(',')
          if (web3.utils.isAddress(content[0]) && content[1] !== '') {
            address_list.push(content[0])
            value_list.push(parseFloat(content[1]))
          }
        }
      })
    }
    const send_amount = value_list.reduce(
      (total, current) => total + current,
      0,
    )
    if (send_amount > 0) {
      setSendAmount(send_amount)
      setTotalAmount(send_amount+parseFloat(txFee))
    }
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
    setSymbol("")
    setTokenAddress("")
    switchChain(parseInt(e.target.value))
    setChainId(e.target.value)
  }

  return (
    <Container>
      <React.Fragment>
        <Header>
          <div>MultiSendApp</div>
          <div style={{fontSize: '16px', marginTop: '20px'}}>Send to multiple EVM compatible addresses<br/>in a single transaction!</div>
        </Header>
        <div className='content'>
          <AdminButtonContainer>
            <Link to="/admin">... </Link>
          </AdminButtonContainer>
          <Body>
            <Button
              onClick={connectWallet}
              variant="contained"
              style={{ margin: '10px 0px' }}
              className={ isConnected ? 'connected-wallet': 'unconnected-wallet' }
              color={isConnected ? 'error' : 'primary'}
            >
              {isConnected ? 'WALLET CONNECTED' : 'CONNECT WALLET'}
            </Button>
            <Text>
              <div>Your Wallet Address: {address}</div>
            </Text>
            <Text>
              <div> Current Contract Address: {contractAddress}</div>
            </Text>
            <Row>
              <Text>
                <div> Amount to Send : {sendAmount} {symbol != '' ? symbol: coinSymbol}</div>
              </Text>
              <Text>
                <div> Fee to Send : {txFee} {coinSymbol}</div>
              </Text>
            </Row>
            <Row>
              <Text>
                <div className='disclaimer'>Disclaimer: This app and the associated smart contracts have not been independently audited by a 3rd party. 
                  Users of this app and associated contracts do so at their own risk. 
                  Due to gas limitations on EVM networks (e.g. Ethereum), the number of addresses you can send to in any single transaction may be limited. 
                  This tool has been successfully tested sending to 100 addresses in a single transaction. 
                  If you intend to send to more addresses than this, please consider breaking the transactions into small sets or perform a test transaction first.</div>
              </Text>
            </Row>

            {/* <Text>Balance: {balance} Ether</Text> */}
            <Row>
              <Select
                style={{backgroundColor: "#fff"}}
                value={coinType}
                onChange={handleChange}
                defaultValue={coinType}
                autoWidth={true}
              >
                <MenuItem value={'Native Coin'}>Native Coin</MenuItem>
                <MenuItem value={'Custom token'}>Custom token</MenuItem>
              </Select>
              <div style={{display: 'flex', justifyContent:'flex-start', width: '70%'}}>
                <input
                  placeholder={coinType === 'Native Coin' ? "": "enter token contract address"}
                  style={{ width: '150%', backgroundColor: "#fff" }}
                  value={tokenAddress}
                  disabled={coinType === 'Native Coin' ? true : false}
                  onChange={getTokenAddress}
                />
                {coinType !== 'Native Coin' && symbol ? (
                  <Text style={{ margin: '18px 5px', color: '#cfa144', fontWeight: 'bold' }}>
                    <div> {symbol}</div>
                  </Text>
                ) : (
                  ''
                )}
              </div>
            </Row>

            <FormControl style={{marginTop: '10px'}}>
              <Select
                style={{backgroundColor: "#fff"}}
                id="demo-simple-select"
                value={network}
                onChange={handleChangeChain}
                autoWidth={true}
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

            <Text style={{ margin: '15px 0 0 0' }}>
              Format: 0xf2c7bEa00ebB87B5b26140dd4ceB46a5d5D435B4, 0.01
            </Text>

            <Text style={{ margin: '10px 0px' }}>
              Format: 0xf2c7bEa00ebB87B5b26140dd4ceB46a5d5D435B4,0.01
            </Text>

            <textarea
              placeholder="address amount"
              style={{ width: '45%', fontSize: '14px' }}
              rows={8}
              onChange={changeDataList}
              multiline
              value={inputData}
            />

            <div className='button-group'>
              <Button style={{ backgroundColor:'#008000', marginRight: '25px' }} variant="contained" onClick={send}>
                SEND
              </Button>

              <React.Fragment>
                <label htmlFor="fileUpload">
                  <UploadButton>Upload CSV file</UploadButton>
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
            </div>
          </Body>
        </div>
      </React.Fragment>
      <LoadingModal isloading={isModalOpen} content={modalContent} />
    </Container>
  )
}

export default Index
