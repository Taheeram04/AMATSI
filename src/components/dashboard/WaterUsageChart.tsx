import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Droplet, Sparkles, TrendingDown, Info } from 'lucide-react';

export const WaterUsageChart: React.FC = () => {
  const data = [
    { day: 'Mon', traditionalFurrow: 2400, amatsiSmart: 780, waterSaved: 1620 },
    { day: 'Tue', traditionalFurrow: 2200, amatsiSmart: 820, waterSaved: 1380 },
    { day: 'Wed (Rain)', traditionalFurrow: 2100, amatsiSmart: 0, waterSaved: 2100 },
    { day: 'Thu', traditionalFurrow: 2500, amatsiSmart: 850, waterSaved: 1650 },
    { day: 'Fri', traditionalFurrow: 2300, amatsiSmart: 720, waterSaved: 1580 },
    { day: 'Sat', traditionalFurrow: 2600, amatsiSmart: 900, waterSaved: 1700 },
    { day: 'Sun', traditionalFurrow: 2400, amatsiSmart: 750, waterSaved: 1650 },
  ];

  const totalTraditional = data.reduce((acc, curr) => acc + curr.traditionalFurrow, 0);
  const totalAmatsi = data.reduce((acc, curr) => acc + curr.amatsiSmart, 0);
  const totalSaved = totalTraditional - totalAmatsi;
  const savingsPct = Math.round((totalSaved / totalTraditional) * 100);

  return (
    <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs font-futura">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F3F1EE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF9F7] border border-[#E5E2DE] flex items-center justify-center text-[#1A1817]">
            <Droplet className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#615B57] uppercase tracking-widest block">
              Lake Victoria Basin Water Balance
            </span>
            <h3 className="font-bold text-[#1A1817] text-base sm:text-lg">
              Traditional Furrow Loss vs. AMATSI Precision Drip
            </h3>
          </div>
        </div>

        {/* Savings Badge */}
        <div className="flex items-center gap-2 bg-[#16A34A]/10 border border-[#16A34A]/20 px-4 py-2 rounded-2xl self-start sm:self-auto">
          <TrendingDown className="w-5 h-5 text-[#15803D]" />
          <div>
            <span className="text-[9px] text-[#15803D] uppercase font-black tracking-wider block">
              Weekly Water Saved
            </span>
            <span className="text-sm sm:text-base font-black text-[#14532D]">
              -{savingsPct}% ({totalSaved.toLocaleString()} Liters)
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F1EE" />
            <XAxis dataKey="day" stroke="#A8A29D" fontSize={11} tickLine={false} />
            <YAxis stroke="#A8A29D" fontSize={11} tickLine={false} unit="L" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1817',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                border: '1px solid #2B2725',
                fontFamily: 'var(--font-futura)'
              }}
              formatter={(val: number) => [`${val.toLocaleString()} Liters`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '12px', fontFamily: 'var(--font-futura)' }}
              iconType="circle"
            />
            <Bar
              dataKey="traditionalFurrow"
              name="Traditional Flooding / Furrow (60-80% lost to deep cracks)"
              fill="#D8D4CE"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="amatsiSmart"
              name="AMATSI Kijani Precision Drip (Targeted to root zone)"
              fill="#16A34A"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Evidence Banner */}
      <div className="mt-4 bg-[#FAF9F7] rounded-2xl p-4 border border-[#E5E2DE] flex items-start gap-3 text-xs text-[#615B57] leading-relaxed">
        <Info className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#1A1817]">Why Smallholders Lose 60–80% Water: </strong>
          In the Kano Plains and Lake Victoria lowlands, heavy Black Cotton Vertisol soils develop deep fissures during dry spells. When farmers flood furrows blindly without real-time telemetry, water bypasses the active 20cm vegetable root zone through cracks, leaching nutrients and wasting expensive pump petrol. Kijani API Box provides real-time moisture data to pulse water precisely when needed and in the exact dosage.
        </div>
      </div>

    </div>
  );
};
