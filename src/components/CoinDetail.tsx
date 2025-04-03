'use client';

import { useGetCoinByIdQuery } from '@/redux/services/coinApi';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Image from 'next/image';

interface CoinDetailProps {
  coinId: string;
}

export default function CoinDetail({ coinId }: CoinDetailProps) {
  const { data: coin, error, isLoading } = useGetCoinByIdQuery(coinId);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Koin detayları yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg">
        <p>Koin detayları alınırken bir hata oluştu.</p>
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'}
        </p>
      </div>
    );
  }

  if (!coin) {
    return <div className="text-gray-400">Koin bulunamadı.</div>;
  }

  const priceChange24h = coin.price_change_percentage_24h;
  const is24hPositive = priceChange24h >= 0;

  return (
    <div className="bg-[#121319] rounded-lg p-5">
      <div className="flex items-center mb-6">
        {coin.image && (
          <div className="w-12 h-12 mr-4 flex-shrink-0">
            <Image 
              src={coin.image} 
              alt={coin.name} 
              width={48} 
              height={48} 
              className="rounded-full" 
            />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{coin.name}</h2>
          <div className="text-gray-400">{coin.symbol.toUpperCase()}</div>
        </div>
        <div className="ml-auto">
          <div className="text-2xl font-bold">
            ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center justify-end ${is24hPositive ? 'text-green-500' : 'text-red-500'}`}>
            {is24hPositive ? <FaArrowUp className="mr-1" size={12} /> : <FaArrowDown className="mr-1" size={12} />}
            {Math.abs(priceChange24h).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#21232d] p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Market Değeri</div>
          <div className="text-lg font-semibold">${coin.market_cap.toLocaleString()}</div>
        </div>
        <div className="bg-[#21232d] p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">İşlem Hacmi (24s)</div>
          <div className="text-lg font-semibold">${coin.total_volume.toLocaleString()}</div>
        </div>
        <div className="bg-[#21232d] p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">24s En Yüksek</div>
          <div className="text-lg font-semibold">${coin.high_24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-[#21232d] p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">24s En Düşük</div>
          <div className="text-lg font-semibold">${coin.low_24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-gray-400 text-sm mb-1">Dolaşımdaki Arz</div>
          <div className="flex items-center justify-between">
            <div className="font-medium">{coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}</div>
            {coin.max_supply && (
              <div className="text-gray-400 text-sm">
                Maksimum: {coin.max_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </div>
            )}
          </div>
          {coin.max_supply && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(coin.circulating_supply / coin.max_supply * 100).toFixed(2)}%` }}
              ></div>
            </div>
          )}
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">Tüm Zamanların En Yüksek Değeri</div>
          <div className="flex items-center justify-between">
            <div className="font-medium">${coin.ath.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`text-sm ${coin.ath_change_percentage < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {coin.ath_change_percentage.toFixed(2)}%
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(coin.ath_date).toLocaleDateString()} tarihinde
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">Tüm Zamanların En Düşük Değeri</div>
          <div className="flex items-center justify-between">
            <div className="font-medium">${coin.atl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`text-sm ${coin.atl_change_percentage < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {coin.atl_change_percentage.toFixed(2)}%
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(coin.atl_date).toLocaleDateString()} tarihinde
          </div>
        </div>
      </div>
    </div>
  );
} 