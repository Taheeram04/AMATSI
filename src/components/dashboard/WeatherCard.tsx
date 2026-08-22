import React from 'react';
import { WeatherReading } from '../../types';
import { CloudRain, Sun, Wind, Thermometer, Droplets } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherReading;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const { rainProbabilityPercent, temperatureC, humidityPercent, windSpeedKmh, evaporationRateMmDay, condition } = weather;
  const isRainLikely = rainProbabilityPercent >= 60;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col justify-between font-futura">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F1EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F7] border border-[#E5E2DE] flex items-center justify-center text-[#1A1817]">
              <CloudRain className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest">
                Kijani Micro-Climate
              </p>
              <h3 className="font-bold text-[#1A1817] text-sm">
                Basin Weather & Rain
              </h3>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isRainLikely
                ? 'bg-sky-50 text-sky-800 border-sky-200'
                : 'bg-[#FAF9F7] text-[#615B57] border-[#E5E2DE]'
            }`}
          >
            {isRainLikely ? 'Rain Expected' : 'Dry & Clear'}
          </span>
        </div>

        {/* Rain Probability Metric */}
        <div className="py-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black text-[#1A1817] tracking-tight">
                {rainProbabilityPercent}%
              </span>
              <span className="text-xs text-[#615B57] font-semibold">Rain Probability</span>
            </div>
            <span className="text-xs font-semibold text-[#1A1817]">
              {condition}
            </span>
          </div>

          {/* Bar indicator */}
          <div className="relative w-full h-3 bg-[#F3F1EE] rounded-full overflow-hidden border border-[#E5E2DE]">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isRainLikely ? 'bg-sky-500' : 'bg-slate-400'
              }`}
              style={{ width: `${rainProbabilityPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#A8A29D] font-mono mt-2">
            <span>0% Sunny</span>
            <span className="text-sky-700 font-bold">Rain Threshold (60%)</span>
            <span>100% Heavy Storm</span>
          </div>
        </div>

        {/* Dynamic Context */}
        <div className="bg-[#FAF9F7] border border-[#E5E2DE] rounded-2xl p-3.5 text-xs text-[#615B57] leading-relaxed mb-2">
          {isRainLikely ? (
            <span className="text-sky-900 font-medium">
              <strong className="text-sky-950">Rainfall Rule Active: </strong>
              Automatic irrigation hold applied. Letting rain irrigate saves 100% of pump petrol and tank volume.
            </span>
          ) : (
            <span>
              <strong className="text-[#1A1817]">Evaporation Rate: </strong>
              {evaporationRateMmDay} mm/day. Low rain probability; soil moisture probe governs drip timing.
            </span>
          )}
        </div>
      </div>

      {/* Grid metrics footer */}
      <div className="pt-3 border-t border-[#F3F1EE] grid grid-cols-3 gap-2 text-[11px] text-[#615B57]">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3.5 h-3.5 text-amber-600" />
          <span>{temperatureC}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5 text-sky-600" />
          <span>{humidityPercent}% RH</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3.5 h-3.5 text-slate-500" />
          <span>{windSpeedKmh} km/h</span>
        </div>
      </div>

    </div>
  );
};
