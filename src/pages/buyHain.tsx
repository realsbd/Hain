'use client';
import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './buyHain.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { 
  useCurrentPrice, 
  usePresalePrice, 
  useNormalPrice, 
  usePresaleActive, 
  useBuyTokens, 
  useCalculateTokenAmount 
} from '../hooks/useContract';

// Type definitions
type TokenType = 'USDT' | 'USDC' | 'ETH' | 'CARD' | 'BNB' | 'MATIC' | 'LHUNT';

interface CryptoIconProps {
  type: TokenType;
  size?: 'default' | 'small';
}

interface PriceInfo {
  current: number;
  listing: number;
}

interface ProgressData {
  raised: number;
  target: number;
}

// Crypto Icon Component
const CryptoIcon: React.FC<CryptoIconProps> = ({ type, size = 'default' }) => {
  const getIconClass = (tokenType: TokenType): string => {
    const sizeClass = size === 'default' ? styles.sizeDefault : styles.sizeSmall;
    let typeClass = styles.default;
    
    switch (tokenType) {
      case 'USDT':
        typeClass = styles.usdt;
        break;
      case 'USDC':
        typeClass = styles.usdc;
        break;
      case 'ETH':
        typeClass = styles.eth;
        break;
      case 'CARD':
        typeClass = styles.card;
        break;
      case 'BNB':
        typeClass = styles.bnb;
        break;
      case 'MATIC':
        typeClass = styles.matic;
        break;
      case 'LHUNT':
        typeClass = styles.lhunt;
        break;
    }
    
    return `${styles.cryptoIcon} ${sizeClass} ${typeClass}`;
  };

  const getIconText = (tokenType: TokenType): string => {
    switch (tokenType) {
      case 'USDT':
        return 'T';
      case 'USDC':
        return '$';
      case 'ETH':
        return 'Ξ';
      case 'CARD':
        return 'C';
      case 'BNB':
        return 'B';
      case 'MATIC':
        return 'M';
      case 'LHUNT':
        return 'L';
      default:
        return '';
    }
  };
  
  return (
    <div className={getIconClass(type)}>
      {getIconText(type)}
    </div>
  );
};

const BuyHainInterface: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<TokenType>('ETH');
  const [sendAmount, setSendAmount] = useState<string>('0.001');
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  
  // Contract hooks
  const { price: currentPrice, isLoading: priceLoading, refetch: refetchPrice } = useCurrentPrice();
  const { price: presalePrice } = usePresalePrice();
  const { price: normalPrice } = useNormalPrice();
  const { isActive: presaleActive } = usePresaleActive();
  const { tokenAmount } = useCalculateTokenAmount(sendAmount);
  const { buyTokens, isPending, isConfirming, isConfirmed, isError, error } = useBuyTokens();

  const tokens: TokenType[] = ['ETH']; // For now, only ETH is supported for buying
  
  // Use contract prices or fallback to default
  const priceInfo: PriceInfo = {
    current: currentPrice || 0.0002,
    listing: normalPrice || 0.001
  };

  const progressData: ProgressData = {
    raised: 1654000,
    target: 48000000
  };

  const progressPercentage: number = (progressData.raised / progressData.target) * 100;

  // Handle transaction state changes
  useEffect(() => {
    if (isConfirmed) {
      setIsTransactionPending(false);
      // Refresh price data after successful transaction
      refetchPrice();
      alert('Transaction successful! Tokens have been purchased.');
    }
    if (isError) {
      setIsTransactionPending(false);
      console.error('Transaction error:', error);
    }
  }, [isConfirmed, isError, error, refetchPrice]);

  const handleSendAmountChange = (value: string): void => {
    setSendAmount(value);
  };

  const handleTokenSelect = (token: TokenType): void => {
    setSelectedToken(token);
  };

  const handleBuyTokens = async (): Promise<void> => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (selectedToken !== 'ETH') {
      alert('Currently only ETH purchases are supported');
      return;
    }

    try {
      setIsTransactionPending(true);
      await buyTokens(sendAmount);
    } catch (error) {
      setIsTransactionPending(false);
      console.error('Error in handleBuyTokens:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const getButtonText = (): string => {
    if (!isConnected) return 'Connect Wallet to Buy';
    if (isPending || isTransactionPending) return 'Confirming Transaction...';
    if (isConfirming) return 'Waiting for Confirmation...';
    return 'Buy Hain';
  };

  const isButtonDisabled = (): boolean => {
    return !isConnected || isPending || isConfirming || isTransactionPending || parseFloat(sendAmount) <= 0;
  };

  return (
    <div className={styles.buyHainWrapper}>
      <div className={styles.buyHainContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <span>$</span>
            </div>
            <h1 className={styles.headerTitle}>BUYHAIN</h1>
          </div>
        </div>

        {/* Price Info */}
        <div className={styles.priceGrid}>
          <div className={styles.priceCard}>
            <div className={styles.priceLabel}>
              Current price {priceLoading && '(Loading...)'}
            </div>
            <div className={styles.priceValue}>
              {presaleActive ? 
                `$${presalePrice.toFixed(6)} (Presale)` : 
                `$${priceInfo.current.toFixed(6)}`
              }
            </div>
          </div>
          <div className={styles.priceCard}>
            <div className={styles.priceLabel}>Listing Price</div>
            <div className={styles.priceValue}>${priceInfo.listing.toFixed(6)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressLabels}>
            <span>${formatCurrency(progressData.raised)}</span>
            <span>${formatCurrency(progressData.target)}</span>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className={styles.progressIndicator}></div>
          </div>
        </div>

        {/* Next Price Increase */}
        <div className={styles.nextPriceSection}>
          <div className={styles.nextPriceCard}>
            <span className={styles.nextPriceLabel}>
              {presaleActive ? 'Presale Active' : 'Next price increase by'}
            </span>
            <div className={styles.nextPriceContent}>
              <ChevronDown className={styles.nextPriceIcon} />
              <span className={styles.nextPriceValue}>
                {presaleActive ? 'Limited Time' : '0.0006'}
              </span>
            </div>
          </div>
        </div>

        {/* Token Selection */}
        <div className={styles.tokenSelection}>
          <div className={styles.tokenGrid}>
            {tokens.map((token) => (
              <button
                key={token}
                onClick={() => handleTokenSelect(token)}
                className={`${styles.tokenButton} ${selectedToken === token ? styles.selected : ''}`}
                type="button"
              >
                <CryptoIcon type={token} size="small" />
                <span>{token}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            * Currently only ETH purchases are supported
          </div>
        </div>

        {/* Transaction Inputs */}
        <div className={styles.transactionInputs}>
          {/* You Send */}
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>
              <span className={styles.inputLabelText}>You send</span>
              <span className={styles.inputAmount}>{sendAmount} ETH</span>
            </div>
            <div className={styles.inputContainer}>
              <div className={styles.inputLeft}>
                <span className={styles.inputPrefix}>at least</span>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSendAmountChange(e.target.value)}
                  className={styles.amountInput}
                  step="0.001"
                  min="0.001"
                  placeholder="0.001"
                />
              </div>
              <div className={styles.inputRight}>
                <CryptoIcon type={selectedToken} />
                <span className={styles.tokenName}>{selectedToken}</span>
              </div>
            </div>
          </div>

          {/* You'll Receive */}
          <div className={styles.inputGroup}>
            <div className={styles.inputLabel}>
              <span className={styles.inputLabelText}>You'll receive</span>
            </div>
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={tokenAmount}
                readOnly
                className={styles.receiveInput}
                placeholder="0"
              />
              <div className={styles.inputRight}>
                <CryptoIcon type="LHUNT" />
                <span className={styles.tokenName}>HAIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buy Button */}
        <button 
          onClick={handleBuyTokens}
          className={styles.connectWalletButton}
          type="button"
          disabled={isButtonDisabled()}
          style={{ 
            opacity: isButtonDisabled() ? 0.6 : 1,
            cursor: isButtonDisabled() ? 'not-allowed' : 'pointer'
          }}
        >
          {getButtonText()}
        </button>

        {/* Connect Button */}
        <div style={{ marginTop: '20px' }}>
          <ConnectButton/>
        </div>

        {/* Transaction Status */}
        {(isPending || isConfirming || isError) && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
            {isPending && <div style={{ color: '#f59e0b' }}>Transaction pending...</div>}
            {isConfirming && <div style={{ color: '#3b82f6' }}>Waiting for confirmation...</div>}
            {isError && (
              <div style={{ color: '#ef4444' }}>
                Transaction failed: {error?.message || 'Unknown error'}
              </div>
            )}
          </div>
        )}

        {/* Contract Info */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          fontSize: '12px', 
          color: '#666',
          textAlign: 'center'
        }}>
          Contract: 0x01087b03507d94153CfAb032737ed6a6Be990f0B
        </div>
      </div>
    </div>
  );
};

export default BuyHainInterface;