import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiRipple, SiBinance, SiDogecoin, SiPolkadot, SiCardano } from 'react-icons/si';
import { IconType } from 'react-icons';

/**
 * Returns the appropriate icon component for a given cryptocurrency symbol
 */
export const getCoinIcon = (symbol: string): IconType | React.FC => {
  switch (symbol.toLowerCase()) {
    case 'btc':
      return FaBitcoin;
    case 'eth':
      return FaEthereum;
    case 'ltc':
      return SiLitecoin;
    case 'xrp':
      return SiRipple;
    case 'bnb':
      return SiBinance;
    case 'doge':
      return SiDogecoin;
    case 'dot':
      return SiPolkadot;
    case 'ada':
      return SiCardano;
    default:
      // Return a component that displays the first letter of the symbol
      const DefaultCoinIcon = () => null;
      DefaultCoinIcon.displayName = `DefaultCoinIcon-${symbol}`;
      return DefaultCoinIcon;
  }
};

/**
 * Returns a background color for a given cryptocurrency symbol
 */
export const getCoinColor = (symbol: string): string => {
  switch (symbol.toLowerCase()) {
    case 'btc':
      return "#f7931a";
    case 'eth':
      return "#627eea";
    case 'ltc':
      return "#bfbbbb";
    case 'xrp':
      return "#0085c0";
    case 'bnb':
      return "#f3ba2f";
    case 'doge':
      return "#c3a634";
    case 'dot':
      return "#e6007a";
    case 'ada':
      return "#0033ad";
    case 'sol':
      return "#14f195";
    case 'usdt':
      return "#26a17b";
    case 'link':
      return "#2a5ada";
    case 'uni':
      return "#ff007a";
    default:
      // Generate a deterministic color based on the symbol string
      let hash = 0;
      for (let i = 0; i < symbol.length; i++) {
        hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      return color;
  }
};

/**
 * Formats a cryptocurrency price with the appropriate number of decimal places
 */
export const formatCryptoPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else if (price >= 1) {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  } else if (price >= 0.01) {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    });
  } else {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 6,
      maximumFractionDigits: 8
    });
  }
}; 