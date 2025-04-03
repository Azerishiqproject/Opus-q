'use client';

import React from 'react';

interface MiniChartProps {
  data?: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data = [],
  isPositive = true,
  width = 80,
  height = 30,
}) => {
  // Veri yoksa veya tek noktaysa düz çizgi göster
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="w-full h-full">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
        />
      </svg>
    );
  }

  // Min ve max değerleri bul
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // 0'a bölmeyi engellemek için

  // Path için points dizisi oluştur
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    // Y eksenini tersine çevir (SVG'de yukarı 0'dır)
    const normalizedValue = (value - min) / range;
    const y = height - normalizedValue * height * 0.9; // Height'ın %90'ını kullan
    return `${x},${y}`;
  });

  // Path oluştur
  const linePath = `M ${points.join(" L ")}`;

  // Area path oluştur (alanı doldurmak için)
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        {/* Alan doldurma */}
        <path
          d={areaPath}
          fill={isPositive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}
          stroke="none"
        />

        {/* Çizgi */}
        <path
          d={linePath}
          fill="none"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default MiniChart; 