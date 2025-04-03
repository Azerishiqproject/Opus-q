'use client';

import { useGetCoinsQuery } from '@/redux/services/coinApi';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiLitecoin, SiDogecoin, SiCardano } from 'react-icons/si';
import Image from 'next/image';

// Coin ikonlarını seçmek için yardımcı fonksiyon
const getCoinIcon = (symbol: string) => {
  const iconSize = 24;
  switch (symbol.toLowerCase()) {
    case 'btc':
      return <FaBitcoin size={iconSize} className="text-amber-500" />;
    case 'eth':
      return <FaEthereum size={iconSize} className="text-purple-400" />;
    case 'ltc':
      return <SiLitecoin size={iconSize} className="text-gray-400" />;
    case 'doge':
      return <SiDogecoin size={iconSize} className="text-yellow-400" />;
    case 'ada':
      return <SiCardano size={iconSize} className="text-blue-400" />;
    default:
      return null;
  }
};

export default function CoinList() {
  const { data: coins, error, isLoading } = useGetCoinsQuery();

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Koin verileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg text-center">
        <p>Koin verileri alınırken bir hata oluştu.</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-gray-400 text-xs border-b border-gray-700">
            <th className="py-2 pl-4 text-left">Sıra</th>
            <th className="py-2 text-left">Koin</th>
            <th className="py-2 text-right">Fiyat</th>
            <th className="py-2 text-right">24s %</th>
            <th className="py-2 text-right">7g %</th>
            <th className="py-2 text-right">Market Değeri</th>
            <th className="py-2 pr-4 text-right">Hacim (24s)</th>
          </tr>
        </thead>
        <tbody>
          {coins?.map((coin) => {
            const priceChange24h = coin.price_change_percentage_24h_in_currency || coin.price_change_percentage_24h;
            const priceChange7d = coin.price_change_percentage_7d_in_currency;
            const is24hPositive = priceChange24h >= 0;
            const is7dPositive = priceChange7d ? priceChange7d >= 0 : true;

            return (
              <tr key={coin.id} className="border-b border-gray-700 hover:bg-[#272b3b] transition-colors">
                <td className="py-4 pl-4 text-left">
                  <span className="text-gray-400">{coin.market_cap_rank}</span>
                </td>
                <td className="py-4 text-left">
                  <div className="flex items-center">
                    {coin.image ? (
                      <div className="w-8 h-8 mr-3 flex-shrink-0">
                        <Image 
                          src={coin.image} 
                          alt={coin.name} 
                          width={32} 
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 mr-3 rounded-full bg-gray-700 flex items-center justify-center">
                        {getCoinIcon(coin.symbol) || coin.symbol.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-gray-400 text-xs">{coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`py-4 text-right ${is24hPositive ? 'text-green-500' : 'text-red-500'}`}>
                  <div className="flex items-center justify-end">
                    {is24hPositive ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
                    {Math.abs(priceChange24h).toFixed(2)}%
                  </div>
                </td>
                <td className={`py-4 text-right ${priceChange7d ? (is7dPositive ? 'text-green-500' : 'text-red-500') : 'text-gray-400'}`}>
                  {priceChange7d ? (
                    <div className="flex items-center justify-end">
                      {is7dPositive ? <FaArrowUp className="mr-1" size={10} /> : <FaArrowDown className="mr-1" size={10} />}
                      {Math.abs(priceChange7d).toFixed(2)}%
                    </div>
                  ) : '-'}
                </td>
                <td className="py-4 text-right">
                  ${coin.market_cap.toLocaleString()}
                </td>
                <td className="py-4 pr-4 text-right">
                  ${coin.total_volume.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 