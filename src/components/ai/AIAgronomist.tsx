import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Sprout, Droplets, Fuel, ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import { FarmPlot, Language, SoilReading, TankReading, WeatherReading } from '../../types';
import { Logo } from '../common/Logo';

interface AIAgronomistProps {
  selectedPlot: FarmPlot;
  soil: SoilReading;
  weather: WeatherReading;
  tank: TankReading;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  source?: string;
}

export const AIAgronomist: React.FC<AIAgronomistProps> = ({
  selectedPlot,
  soil,
  weather,
  tank,
  language,
  onSelectLanguage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'bot',
      text:
        language === 'sw'
          ? `Habari John! Mimi ni Daktari wako wa Udongo na Mazao (Amatsi AI Agronomist). Udongo wa Black Cotton kwenye shamba lako la Kales una unyevu wa ${soil.moisturePercent}%. Unaweza kuniuliza kuhusu umwagiliaji wa matone, kuokoa mafuta ya pampu, au kuzuia upotevu wa maji.`
          : language === 'luo'
          ? `Misawa John! An Amatsi AI Agronomist. Lowo mar Black Cotton e puothi mar Kales nigi pi mar ${soil.moisturePercent}%. Penja gimoro amora e wi pigo puodhi, gwelo mafuta mar pampu, kata rito Nam Lolwe.`
          : `Hello John! I'm your Amatsi AI Agronomist, calibrated for Lake Victoria Basin vertisol soils and smallholder vegetable production. Your ${selectedPlot.name} currently records ${soil.moisturePercent}% soil moisture. How can I help optimize your field today?`,
      timestamp: 'Just now',
      source: 'gemini-3.7-flash'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedQuestions = [
    {
      label: 'Black Cotton Soil & Deep Leaching',
      query: 'Why does furrow flooding waste 80% water on Black Cotton vertisols, and how does drip pulse fix it?',
      icon: <Sprout className="w-3.5 h-3.5 text-[#16A34A]" />
    },
    {
      label: 'Optimal Drip Duration',
      query: `With soil moisture at ${soil.moisturePercent}%, how many minutes should I run my drip lines for ${selectedPlot.crop}?`,
      icon: <Droplets className="w-3.5 h-3.5 text-[#0284C7]" />
    },
    {
      label: 'Slashing Pump Petrol Cost',
      query: 'How much money in petrol fuel can I save per week by switching from 3-hour flood pumping to 20-minute drip cycles?',
      icon: <Fuel className="w-3.5 h-3.5 text-[#F59E0B]" />
    },
    {
      label: 'Lake Victoria Water Hyacinth',
      query: 'How does precision irrigation prevent fertilizer runoff into River Nyando and stop water hyacinth blooms in Lake Victoria?',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" />
    }
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/agronomist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language,
          fieldContext: {
            plotName: selectedPlot.name,
            crop: selectedPlot.crop,
            soilType: selectedPlot.soilType,
            moisturePercent: soil.moisturePercent,
            rainProbability: weather.rainProbabilityPercent,
            tankLiters: tank.currentLiters
          }
        })
      });

      const data = await res.json();
      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Soil moisture is optimal. Continue with scheduled drip irrigation.',
        timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.7-flash'
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const errorReply: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text:
          language === 'sw'
            ? `Samahani, mtandao umekatika kidogo. Kulingana na kanuni za AMATSI, unyevu wako wa ${soil.moisturePercent}% unahitaji dakika 20 za umwagiliaji wa matone.`
            : `Precision recommendation: Keep root-zone moisture at 50-70% using 20-minute drip cycles. Drip directly targets the active 20cm root zone and prevents black cotton deep percolation.`,
        timestamp: 'Offline Advice',
        source: 'amatsi-basin-engine'
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'bot',
        text:
          language === 'sw'
            ? `Soga imerejeshwa. Mimi ni Amatsi AI Agronomist. Ninaweza kukusaidia vipi leo kuhusu shamba lako?`
            : language === 'luo'
            ? `Soga ochaki manyien. An Amatsi AI Agronomist. Ere kaka anyalo konyi sani e puothi?`
            : `Chat refreshed. Ask me anything regarding soil vertisols, crop scheduling, pump fuel savings, or Lake Victoria ecological farming.`,
        timestamp: 'Just now',
        source: 'gemini-3.7-flash'
      }
    ]);
  };

  return (
    <div className="space-y-6 font-futura">
      
      {/* Header Banner in Cotton Black Soil & Vegetation Green */}
      <div className="bg-[#1A1817] text-white rounded-3xl p-6 sm:p-7 border border-[#2B2725] shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16A34A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#16A34A]/20 text-[#4ADE80] border border-[#16A34A]/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4ADE80]" />
              AI Agronomist • Gemini 3.7 Flash
            </span>
            <span className="text-[11px] text-[#A8A29D] font-medium hidden sm:inline">
              Lake Victoria Basin Commission Calibrated
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-futura">
            Amatsi Basin Agronomist
          </h2>

          <p className="text-xs sm:text-sm text-[#D6D3CD] leading-relaxed font-futura">
            Real-time agronomical consultation tailored to <strong>Black Cotton Vertisols</strong>, local crops (Kales, Managu, Spider Plant, Maize), and pump fuel efficiency in Kisumu, Homa Bay, and Siaya.
          </p>
        </div>

        {/* Right context capsule: Active Telemetry */}
        <div className="relative z-10 bg-[#262322] border border-[#383432] p-4 rounded-2xl flex flex-col gap-2 shrink-0 sm:min-w-[240px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A29D]">
            Live Injected Context
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#D6D3CD]">Active Plot:</span>
            <span className="font-bold text-white">{selectedPlot.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#D6D3CD]">Soil Moisture:</span>
            <span className="font-bold text-[#4ADE80]">{soil.moisturePercent}% (VWC)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#D6D3CD]">Soil Type:</span>
            <span className="font-bold text-white text-[11px] truncate max-w-[130px]">{selectedPlot.soilType}</span>
          </div>
        </div>

      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#615B57]">
            Recommended Inquiries
          </span>
          <button
            onClick={handleResetChat}
            className="text-xs font-semibold text-[#16A34A] hover:text-[#15803D] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Chat</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.query)}
              className="bg-white hover:bg-[#FAF9F7] text-left p-3 rounded-2xl border border-[#E5E2DE] hover:border-[#16A34A] transition-all shadow-xs group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {q.icon}
                <span className="text-xs font-bold text-[#1A1817] group-hover:text-[#16A34A] transition-colors">
                  {q.label}
                </span>
              </div>
              <p className="text-[11px] text-[#615B57] line-clamp-2 leading-relaxed">
                {q.query}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window: Cotton Black Soil & Vegetation Theme */}
      <div className="bg-white rounded-3xl border border-[#E5E2DE] shadow-xs flex flex-col h-[520px] overflow-hidden">
        
        {/* Chat Header Bar */}
        <div className="px-6 py-4 bg-[#FAF9F7] border-b border-[#E5E2DE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1A1817] text-[#4ADE80] flex items-center justify-center font-bold text-sm shadow-xs border border-[#2B2725]">
              <Bot className="w-4 h-4 text-[#4ADE80]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A1817] leading-none">
                Amatsi Agronomic Assistant
              </h3>
              <span className="text-[10px] text-[#16A34A] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                Active Basin Model (English • Kiswahili • Dholuo)
              </span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-[#E5E2DE]/60 p-1 rounded-xl">
            {(['en', 'sw', 'luo'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => onSelectLanguage(l)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  language === l
                    ? 'bg-[#1A1817] text-white shadow-2xs'
                    : 'text-[#615B57] hover:text-[#1A1817]'
                }`}
              >
                {l === 'en' ? 'English' : l === 'sw' ? 'Kiswahili' : 'Dholuo'}
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[88%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-[#1A1817] text-[#4ADE80] border border-[#2B2725]'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#16A34A] text-white rounded-tr-none font-medium'
                      : 'bg-[#FAF9F7] text-[#1A1817] rounded-tl-none border border-[#E5E2DE]'
                  }`}
                >
                  <p className="whitespace-pre-line font-futura">{m.text}</p>
                </div>

                <div
                  className={`flex items-center gap-2 px-1 text-[10px] text-[#A8A29D] ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.source && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#615B57]">
                        {m.source}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[80%] animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-[#1A1817] text-[#4ADE80] flex items-center justify-center shrink-0 border border-[#2B2725]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FAF9F7] border border-[#E5E2DE] p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="text-xs text-[#615B57] font-medium">
                  Analyzing soil physics & telemetry...
                </span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-[#FAF9F7] border-t border-[#E5E2DE]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'sw'
                  ? 'Uliza swali kuhusu udongo, maji, mboga za kienyeji, au kuokoa mafuta...'
                  : language === 'luo'
                  ? 'Penj penjo e wi lowo, pi mar puodhi, koth managu, kata mafuta...'
                  : 'Ask about black cotton soils, drip schedules, managu, pump fuel savings...'
              }
              className="flex-1 text-xs sm:text-sm p-3.5 bg-white border border-[#E5E2DE] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent text-[#1A1817] placeholder:text-[#A8A29D]"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-40 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Consult</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
