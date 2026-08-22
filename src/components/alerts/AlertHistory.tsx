import React, { useState } from 'react';
import { SMSAlert, Language } from '../../types';
import { MessageSquare, Send, CheckCircle2, Filter, Smartphone } from 'lucide-react';

interface AlertHistoryProps {
  alerts: SMSAlert[];
  onTriggerTestSms: (lang: Language) => void;
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts, onTriggerTestSms }) => {
  const [filterLang, setFilterLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    const matchesLang = filterLang === 'all' || a.language === filterLang;
    const matchesSearch = a.messageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="space-y-6 font-futura">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E5E2DE] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20 uppercase tracking-widest">
              Africa's Talking Gateway
            </span>
            <h2 className="text-xl font-extrabold text-[#1A1817]">
              SMS Broadcast & Telemetry Log
            </h2>
          </div>
          <p className="text-xs text-[#615B57] mt-1">
            Zero-data 2G delivery to smallholders across Kisumu, Homa Bay, and Siaya counties
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerTestSms('en')}
            className="px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test (EN)</span>
          </button>
          <button
            onClick={() => onTriggerTestSms('sw')}
            className="px-3 py-2 bg-[#FAF9F7] hover:bg-[#F3F1EE] text-[#1A1817] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#E5E2DE]"
          >
            <span>SW</span>
          </button>
          <button
            onClick={() => onTriggerTestSms('luo')}
            className="px-3 py-2 bg-[#FAF9F7] hover:bg-[#F3F1EE] text-[#1A1817] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#E5E2DE]"
          >
            <span>LUO</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E2DE] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search alerts or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2.5 text-xs bg-[#FAF9F7] border border-[#E5E2DE] rounded-xl text-[#1A1817] focus:outline-none focus:border-[#16A34A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <Filter className="w-3.5 h-3.5 text-[#615B57]" />
          <span className="text-[#615B57] font-semibold">Filter Language:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="p-2 text-xs bg-[#FAF9F7] border border-[#E5E2DE] rounded-xl focus:outline-none font-bold text-[#1A1817]"
          >
            <option value="all">All Languages</option>
            <option value="en">English (EN)</option>
            <option value="sw">Kiswahili (SW)</option>
            <option value="luo">Dholuo (LUO)</option>
          </select>
        </div>
      </div>

      {/* Alerts Log Table / List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E5E2DE] p-8 text-center text-[#A8A29D] text-xs">
            No SMS logs match the current search filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-3xl border border-[#E5E2DE] p-5 shadow-xs hover:border-[#D8D4CE] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  alert.action === 'IRRIGATE' ? 'bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20' :
                  alert.action === 'WAIT' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                  alert.action === 'CONSERVE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-[#FAF9F7] text-[#1A1817] border border-[#E5E2DE]'
                }`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-extrabold text-xs text-[#1A1817]">{alert.recipientName} ({alert.recipientPhone})</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#FAF9F7] text-[#1A1817] border border-[#E5E2DE]">
                      {alert.language.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      alert.action === 'IRRIGATE' ? 'bg-[#16A34A]/10 text-[#15803D]' :
                      alert.action === 'WAIT' ? 'bg-sky-50 text-sky-800' :
                      'bg-[#FAF9F7] text-[#615B57]'
                    }`}>
                      {alert.action}
                    </span>
                    <span className="text-[11px] text-[#A8A29D]">• {alert.timestamp}</span>
                  </div>
                  <p className="text-xs font-mono bg-[#FAF9F7] p-3 rounded-xl border border-[#E5E2DE] text-[#1A1817] select-all leading-relaxed">
                    {alert.messageText}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F3F1EE]">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#16A34A]/10 px-3 py-1 rounded-full border border-[#16A34A]/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  {alert.status}
                </span>
                <span className="text-[10px] text-[#A8A29D] font-mono mt-1">
                  Cost: KES {alert.costKes}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
