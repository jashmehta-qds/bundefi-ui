// Chain logo mapping based on chainId
export const getChainLogo = (chainId?: number): string | null => {
  if (!chainId) return null;
  
  const chainLogos: Record<number, string> = {
    1: '/networks/ethereum.png', // Ethereum
    8453: '/networks/base.svg', // Base
    42161: '/networks/arbitrum.png', // Arbitrum
    10: '/networks/optimism.png', // Optimism
    137: '/networks/polygon.png', // Polygon
    56: '/networks/bnb.png', // BSC
    43114: '/networks/avalanche.png', // Avalanche
    100: '/networks/gnosis.png', // Gnosis
    324: '/networks/zksync.png', // zkSync
    59144: '/networks/linea.png', // Linea
  };
  
  return chainLogos[chainId] || null;
};

export const getChainName = (chainId?: number): string | null => {
  if (!chainId) return null;
  
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
    56: 'BSC',
    43114: 'Avalanche',
    100: 'Gnosis',
    324: 'zkSync',
    59144: 'Linea',
  };
  
  return chainNames[chainId] || null;
}; 