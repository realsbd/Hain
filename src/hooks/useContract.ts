import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI, formatTokenAmount, parseTokenAmount, formatPrice } from '../util/contract';

// Hook to read current token price
export const useCurrentPrice = () => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI.abi,
    functionName: 'getCurrentPrice',
  });

  return {
    price: data ? formatPrice(data as bigint) : '0.000000', // Use formatPrice instead of formatTokenAmount
    priceWei: data as bigint,
    isError,
    isLoading,
    refetch
  };
};

// Hook to read normal price
export const useNormalPrice = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI.abi,
    functionName: 'normalPrice',
  });

  return {
    price: data ? formatTokenAmount(data as bigint) : '0',
    priceWei: data as bigint,
    isError,
    isLoading
  };
};

// Hook to read presale price
export const usePresalePrice = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI.abi,
    functionName: 'presalePrice',
  });

  return {
    price: data ? formatTokenAmount(data as bigint) : '0',
    priceWei: data as bigint,
    isError,
    isLoading
  };
};

// Hook to check if presale is active
export const usePresaleActive = () => {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI.abi,
    functionName: 'presaleActive',
  });

  return {
    isActive: data as boolean,
    isError,
    isLoading,
    refetch
  };
};

// Hook to read total supply
export const useTotalSupply = () => {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI.abi,
    functionName: 'totalSupply',
  });

  return {
    totalSupply: data ? formatTokenAmount(data as bigint) : '0',
    totalSupplyWei: data as bigint,
    isError,
    isLoading
  };
};

// Hook to buy tokens
export const useBuyTokens = () => {
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError: writeError, 
    error: writeErrorDetails 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash,
  });

  const buyTokens = async (ethAmount: string) => {
    try {
      const valueInWei = parseEther(ethAmount);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI.abi,
        functionName: 'buyTokens',
        value: valueInWei,
      });
    } catch (error) {
      // Check if the error is due to user rejection
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        ((error as any).message.includes('User rejected') ||
          (error as any).message.includes('User denied'))
      ) {
        console.log('Transaction was cancelled by user');
        return; // Don't throw error for user cancellation
      }
      console.error('Error buying tokens:', error);
      throw error;
    }
  };

  return {
    buyTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isError: writeError,
    error: writeErrorDetails || confirmError,
  };
};

// Hook to calculate token amount for given ETH
export const useCalculateTokenAmount = (ethAmount: string) => {
  const { priceWei, price: currentPrice } = useCurrentPrice();
  
  const calculateTokens = () => {
    if (!ethAmount || !priceWei || priceWei === BigInt(0)) return '0';
    
    try {
      const ethValueWei = parseEther(ethAmount);
      // Calculate tokens: (ETH amount in wei * 1e18) / price in wei
      const tokenAmount = (ethValueWei * BigInt(1e18)) / priceWei;
      return formatTokenAmount(tokenAmount);
    } catch (error) {
      console.error('Error calculating tokens:', error);
      return '0';
    }
  };

  return {
    tokenAmount: calculateTokens(),
    currentPrice
  };
};

// Hook for token approval (if needed for other operations)
export const useApproveToken = () => {
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError, 
    error
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (spender: string, amount: string) => {
    const amountWei = parseTokenAmount(amount);
    
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI.abi,
      functionName: 'approve',
      args: [spender, amountWei],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
  };
};
