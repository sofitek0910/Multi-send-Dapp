import { SafeAppWeb3Modal as Web3Modal } from '@gnosis.pm/safe-apps-web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { ethers } from 'ethers';
import {
  getNetworkName,
  getRPCUrl,
  getWalletProviderName,
  logError,
} from 'lib/helpers';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { WalletLink } from 'walletlink';

export const Web3Context = React.createContext({});
export const useWeb3Context = () => useContext(Web3Context);

const updateTitle = chainId => {
  const networkName = getNetworkName(chainId);
  const defaultTitle = 'Muti Sender';
  if (!process.env.REACT_APP_TITLE) {
    document.title = defaultTitle;
  } else {
    const titleReplaceString = '%c';
    const appTitle = process.env.REACT_APP_TITLE || defaultTitle;

    if (appTitle.indexOf(titleReplaceString) !== -1) {
      document.title = appTitle.replace(titleReplaceString, networkName);
    } else {
      document.title = appTitle;
    }
  }
};

const rpc = {
  97 : getRPCUrl(97)
};

const connector = async (ProviderPackage, options) => {
  const provider = new ProviderPackage(options);
  await provider.enable();
  return provider;
};

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { rpc },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

export const Web3Provider = ({ children }) => {
  const [{ providerChainId, ethersProvider, account }, setWeb3State] = useState(
    {},
  );
  const [isGnosisSafe, setGnosisSafe] = useState(false);
  const [loading, setLoading] = useState(true);

  const setWeb3Provider = useCallback(async (prov, initialCall = false) => {
    try {
      if (prov) {
        const provider = new ethers.providers.Web3Provider(prov);
        const chainId = Number(prov.chainId);
        if (initialCall) {
          const signer = provider.getSigner();
          const gotAccount = await signer.getAddress();
          setWeb3State({
            account: gotAccount,
            ethersProvider: provider,
            providerChainId: chainId,
          });
        } else {
          setWeb3State(_provider => ({
            ..._provider,
            ethersProvider: provider,
            providerChainId: chainId,
          }));
        }
      }
    } catch (error) {
      logError({ web3ModalError: error });
    }
  }, []);

  useEffect(() => {
    if (providerChainId) {
      updateTitle(providerChainId);
    }
  }, [providerChainId]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setGnosisSafe(false);
    setWeb3State({});
  }, []);

  const connectWeb3 = useCallback(async () => {
    
    try {
      setLoading(true);

      const modalProvider = await web3Modal.requestProvider();

      await setWeb3Provider(modalProvider, true);

      const gnosisSafe = await web3Modal.isSafeApp();
      setGnosisSafe(gnosisSafe);

      if (!gnosisSafe) {
        modalProvider.on('accountsChanged', accounts => {
          setWeb3State(_provider => ({
            ..._provider,
            account: accounts[0],
          }));
        });
        modalProvider.on('chainChanged', () => {
          setWeb3Provider(modalProvider);
        });
      }
    } catch (error) {
      logError({ web3ModalError: error });
      disconnect();
    }
    setLoading(false);
  }, [setWeb3Provider, disconnect]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
    (async function load() {
      if ((await web3Modal.isSafeApp()) || web3Modal.cachedProvider) {
        connectWeb3();
      } else {
        setLoading(false);
      }
    })();
  }, [connectWeb3]);

  const isMetamask = useMemo(
    () =>
      getWalletProviderName(ethersProvider) === 'metamask' &&
      window.ethereum?.isMetaMask === true,
    [ethersProvider],
  );

  return (
    <Web3Context.Provider
      value={{
        isGnosisSafe,
        ethersProvider,
        connectWeb3,
        loading,
        disconnect,
        providerChainId,
        account,
        isMetamask,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
