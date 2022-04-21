import { handleWalletError, logError } from 'lib/helpers';
import { addChainToMetaMask } from 'lib/metamask';
import { useCallback } from 'react';

export const useSwitchChain = () => {
  return useCallback(
    async chainId => {
      const result = await addChainToMetaMask(chainId).catch(metamaskError => {
        logError({ metamaskError });
      });
      return result || false;
    },
    [],
  );
};
