import { createContext, useState, useEffect,useContext } from 'react'
import MultisenderABI from 'abi/muti.json'
import db from 'firebaseConfig/config'
import { ref, onValue } from 'firebase/database'
import { Web3Context } from 'contexts/Web3Context'
import Web3 from 'web3'
import { networkCurrencies, networkNames, chainUrls } from 'lib/constants'

const DataBase = ref(db)
export const DappContext = createContext({})

export const DappContextProvider = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [editShow, setEditShow] = useState(false)
  const [selectedChainId, setSelectedChainId] = useState(3)
  const [networks, setNetworks] = useState([])
  const { connectWeb3, providerChainId, account } = useContext(Web3Context)
  const [multiSendContract, setMultiSendContract] = useState()
  const [added,setAdded] = useState(false)
  const [updated,setUpdated] = useState(false)
  const [selectedId, setSelectedId] = useState()
  const [selectedNetwork, setSelectedNetwork] = useState({})
  useEffect(() => {
    updateNetworks()
  }, [])

  useEffect(() => {

    if (networks && networks[providerChainId])
    {
      const web3 = new Web3(window.ethereum)
      let contractAddress = networks[providerChainId].contractAddress;
      console.log('contract address', contractAddress);
      let newContract = new web3.eth.Contract(MultisenderABI.abi, contractAddress);
      setMultiSendContract(newContract);
    }
    
  }, [providerChainId, networks])

  useEffect(()=> {
      
    for (let item in networks)
    {
      if (item) {
        const itemContent = networks[item];
        Object.assign(networkCurrencies, {[itemContent.chainId] : {name :  itemContent.name, symbol : itemContent.symbol}})
        Object.assign(networkNames, {[itemContent.chainId] : itemContent.name});
        const rpcEndpoint = {
          rpc : [itemContent.rpc], 
          explorer: 'https://bscscan.com',
          chainId: itemContent.chainId,
          name: itemContent.name,
        }
        Object.assign(chainUrls, {[itemContent.chainId] : rpcEndpoint});
      }
    }
  }, [networks])

  const readNetwork = (chainId) => {
    setSelectedNetwork(networks[chainId])
    console.log("readnetwork===>", networks[chainId])
  }

  const updateNetworks = () => {
    const networkRef = ref(db, '/networks')
    onValue(networkRef, (result) => {
      setNetworks(result.val())
    })
  }

  return (
    <DappContext.Provider
      value={{
        updateNetworks,
        readNetwork,
        networks,
        open,
        setOpen,
        editShow,
        setEditShow,
        selectedChainId,
        setSelectedChainId,
        selectedId,
        selectedNetwork,
        setSelectedNetwork,
        setSelectedId,
        selectedChainId,
        multiSendContract,
        added,setAdded,
        updated,setUpdated
      }}
    >
      {children}
    </DappContext.Provider>
  )
}
