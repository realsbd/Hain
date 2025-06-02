import { Address, formatUnits } from 'viem';
import contractABI from './abi.json';

// Contract configuration
export const CONTRACT_ADDRESS: Address = '0x01087b03507d94153CfAb032737ed6a6Be990f0B';
export const CONTRACT_ABI = contractABI;

// Contract function signatures based on your smart contract
export const CONTRACT_FUNCTIONS = {
  // Read functions
  getCurrentPrice: 'getCurrentPrice',
  normalPrice: 'normalPrice', 
  presalePrice: 'presalePrice',
  presaleActive: 'presaleActive',
  totalSupply: 'totalSupply',
  name: 'name',
  symbol: 'symbol',
  
  // Write functions
  buyTokens: 'buyTokens',
  approve: 'approve',
  transfer: 'transfer',
  setNormalPrice: 'setNormalPrice',
  setPresalePrice: 'setPresalePrice',
  togglePresale: 'togglePresale'
} as const;

// Token decimals (standard ERC-20 is 18)
export const TOKEN_DECIMALS = 18;

// Helper function to convert wei to readable format
export const formatTokenAmount = (amount: bigint, decimals: number = TOKEN_DECIMALS): string => {
  if (!amount) return '0';
  
  // Use viem's formatUnits which handles decimals correctly
  return formatUnits(amount, decimals);
};

// Helper function to convert readable format to wei
export const parseTokenAmount = (amount: string, decimals: number = TOKEN_DECIMALS): bigint => {
  const [whole, decimal] = amount.split('.');
  const wholeWei = BigInt(whole || '0') * BigInt(10 ** decimals);
  
  if (!decimal) return wholeWei;
  
  const decimalPadded = decimal.padEnd(decimals, '0').slice(0, decimals);
  const decimalWei = BigInt(decimalPadded);
  
  return wholeWei + decimalWei;
};


// Price conversion helper (assuming prices are in wei)
export const formatPrice = (priceWei: bigint): string => {
  if (!priceWei) return '0.000000';
  
  // Convert from wei to ETH and format appropriately
  const priceInEth = formatUnits(priceWei, 18);
  const price = parseFloat(priceInEth);
  
  if (price === 0) return '0.000000';
  if (price < 0.000001) return price.toExponential(6); // Use scientific notation for very small numbers
  return price.toFixed(9); // Show up to 9 decimal places
};
