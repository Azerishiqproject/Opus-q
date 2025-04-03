'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle, Time, AreaSeries } from 'lightweight-charts';

interface SmallChartCardProps {
  data?: number[];
  isPositive: boolean;
}

const SmallChartCard = ({ data = [], isPositive = true }: SmallChartCardProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length < 2) return;
    
    // Div'i temizle
    chartContainerRef.current.innerHTML = '';

    // Zaman aralığı oluştur (son 24 saat)
    const timeData = data.map((_, index) => {
      const date = new Date();
      date.setHours(date.getHours() - (data.length - index - 1));
      return date.getTime() / 1000;
    });

    // Grafiği oluştur
    const chart = createChart(chartContainerRef.current, {
      width: 80,
      height: 30,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    // Veri serisi oluştur
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: isPositive ? '#22c55e' : '#ef4444',
      topColor: isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      bottomColor: isPositive ? 'rgba(34, 197, 94, 0.0)' : 'rgba(239, 68, 68, 0.0)',
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Veri serisine veri ekle
    const seriesData = data.map((price, index) => ({
      time: timeData[index] as Time,
      value: price,
    }));

    areaSeries.setData(seriesData);

    // İçeriğe sığdır
    chart.timeScale().fitContent();

    // Temizlik
    return () => {
      chart.remove();
    };
  }, [data, isPositive]);

  return <div ref={chartContainerRef} className="w-20 h-8" />;
};

export default SmallChartCard; 