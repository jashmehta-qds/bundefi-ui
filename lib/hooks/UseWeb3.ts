import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

export function useWeb3() {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          
          setSigner(signer);
          setAddress(address);
        } catch (error) {
          console.error('Error initializing web3:', error);
        }
      }
    };

    initWeb3();
  }, []);

  return {
    signer,
    address,
  };
} 