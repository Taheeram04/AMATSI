import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Lazy / Safe Google Gen AI initialization
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      platform: 'AMATSI Smart Irrigation'
    });
  });

  // AI Agronomist Consultation API
  app.post('/api/gemini/agronomist', async (req, res) => {
    const {
      prompt,
      language = 'en',
      fieldContext = {}
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const langInstruction =
      language === 'sw'
        ? 'Jibu kwa Kiswahili fasaha kinachofaa mkulima wa Kenya Magharibi na bonde la Ziwa Victoria.'
        : language === 'luo'
        ? 'Dwoko gi Dholuo maber makonyo japur e loka Nam Lolwe (Lake Victoria basin).'
        : 'Respond in clear, encouraging English tailored for smallholder farmers in Kenya and the Lake Victoria Basin.';

    const systemInstruction = `You are "Amatsi AI Agronomist" (Daktari wa Udongo na Mazao), an expert agricultural scientist specializing in the Lake Victoria Basin (Kisumu, Homa Bay, Siaya, Busia, Migori, Kano Plains).
Your expertise covers:
1. Soil Physics: Black Cotton Vertisols (cracking clays with high water-holding capacity, slow infiltration, high runoff risk, and susceptibility to deep percolation nutrient leaching).
2. Crops: Kales (Sukuma Wiki), Indigenous African Nightshade (Managu), Spider Plant (Akeyo/Saget), Maize (Zea mays), and Tomatoes.
3. Smart Irrigation: High-efficiency short pulse drip irrigation, root-zone management (top 15-25cm for kales vs 60cm for maize), water savings (50-70% over furrow flood), avoiding water hyacinth-triggering fertilizer runoff into Lake Victoria.
4. Economics: Slashing petrol water-pump fuel costs (e.g. saving KES 1,000-1,500/week) and expanding vegetable cultivation with saved water.
5. Communication: Practical, actionable, compassionate, and jargon-free.
${langInstruction}`;

    const contextText = `
CURRENT FARM CONTEXT:
- Plot: ${fieldContext.plotName || 'John\'s 0.5-Acre Plot'}
- Crop: ${fieldContext.crop || 'Kales (Sukuma Wiki)'}
- Soil: ${fieldContext.soilType || 'Black Cotton Clay (Vertisol)'}
- Soil Moisture: ${fieldContext.moisturePercent ?? 55}%
- Rain Probability: ${fieldContext.rainProbability ?? 25}%
- Tank Water: ${fieldContext.tankLiters ?? 2400} Liters
`;

    // 1. Try Live Gemini 3.7 Flash if configured
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: `${contextText}\n\nFARMER INQUIRY:\n${prompt}`,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });

        const reply = response.text || 'I have analyzed your farm telemetry. Keep your soil moisture between 50% and 70% to maximize vegetable yield.';
        return res.json({
          reply,
          source: 'gemini-3.7-flash',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } catch (err: any) {
        console.error('Gemini API Error:', err?.message || err);
        // Fall through to domain fallback
      }
    }

    // 2. Intelligent Domain-Specific Rule Fallback if offline or no key
    const lower = prompt.toLowerCase();
    let fallbackReply = '';

    if (lower.includes('black cotton') || lower.includes('soil') || lower.includes('vertisol') || lower.includes('udongo')) {
      if (language === 'sw') {
        fallbackReply = `Udongo wa Black Cotton (Vertisols) kwenye bonde la Kano na Ziwa Victoria una sifa ya kushika maji kwa wingi lakini hunyonya maji polepole sana. Epuka mafuriko ya mifereji (furrow flooding) kwani maji hupotea chini ya mizizi (deep percolation) na kukausha mizizi ya juu. Tumia umwagiliaji wa matone wa dakika 20-30 kila siku mbili ili mizizi ya Sukuma Wiki ipate virutubisho bila kuoza.`;
      } else if (language === 'luo') {
        fallbackReply = `Lowo mar cotton makol (black cotton) e piny Kano nigi teko mar mako pi, to pi donjo motegno. Kik ibuk pi gi mifereji; ti gi drip irrigation mar dakika 20 mondo koth kik keth lweny e bwo lowo. Sukuma wiki gi managu biro dongo maber ahinya.`;
      } else {
        fallbackReply = `Black Cotton Vertisol soils in the Kano Plains have high moisture retention but very slow infiltration. When flooded with furrow irrigation, water bypasses the shallow 20cm root zone through cracks, washing away nitrogen. Recommendation: Apply short 20-25 minute drip pulses. This keeps the active root zone moist without waterlogging or nutrient loss.`;
      }
    } else if (lower.includes('water') || lower.includes('irrigate') || lower.includes('how long') || lower.includes('dakika') || lower.includes('pi')) {
      if (language === 'sw') {
        fallbackReply = `Kulingana na unyevu wako wa sasa (${fieldContext.moisturePercent ?? 55}%), unahitaji umwagiliaji mfupi wa dakika 20 kwa mfumo wa matone (Drip). Hii inatosha kulainisha kina cha mizizi cha sentimita 20 bila kupoteza maji au petroli ya pampu.`;
      } else if (language === 'luo') {
        fallbackReply = `Kaluwore gi pi manie lowo sani (${fieldContext.moisturePercent ?? 55}%), ol pi mar dakika 20 kende. Mano oromo kendo ok bi ketho mafuta mar pampu.`;
      } else {
        fallbackReply = `With your current root-zone moisture at ${fieldContext.moisturePercent ?? 55}%, apply a 20-minute targeted drip irrigation cycle now. This precisely hydrates the top 20cm where 85% of vegetable feeder roots reside, saving up to 70% of water compared to traditional flood trenches.`;
      }
    } else if (lower.includes('fuel') || lower.includes('petrol') || lower.includes('cost') || lower.includes('pesa') || lower.includes('shilling')) {
      if (language === 'sw') {
        fallbackReply = `Kwa kupunguza muda wa kuendesha pampu ya petroli kutoka saa 3 hadi dakika 40 kwa wiki kwa kufuata vipimo vya AMATSI, unaokoa takriban KES 1,200 hadi KES 1,600 kila wiki kwenye mafuta. Pesa hizi zinaweza kuwekezwa kwenye mbegu bora za Managu au mbolea ya asili.`;
      } else if (language === 'luo') {
        fallbackReply = `Kiti gi AMATSI, igwelo mafuta mar pampu mar pesa KES 1,200 juma ka juma. Pesa magi inyalo keto e nyiewo koth Managu kata Akeyo mondo imed lony e chir.`;
      } else {
        fallbackReply = `By eliminating blind over-pumping, AMATSI cuts your petrol pump runtime from 12 hours/week to ~4 hours/week. That saves an estimated KES 1,200 to 1,500 every single week in fuel costs while extending your pump's operational lifespan.`;
      }
    } else if (lower.includes('hyacinth') || lower.includes('lake') || lower.includes('victoria') || lower.includes('nam')) {
      if (language === 'sw') {
        fallbackReply = `Umwagiliaji wa matone unaolengwa huzuia mbolea ya nitrojeni na fosforasi kusombwa na maji ya ziada hadi Mto Nyando na Ziwa Victoria. Hii inasaidia moja kwa moja kuzuia ukuaji wa magugu maji (Water Hyacinth) yanayofunga bandari ya Kisumu.`;
      } else if (language === 'luo') {
        fallbackReply = `Ka wagengo pi mar pur kik mol e Aora Nyando gi Nam Lolwe, wagengo goga mar hyacinth maketho loka Kisumu kendo ketho rech. Pur mar rieko konyo nam duto.`;
      } else {
        fallbackReply = `Precision irrigation prevents fertilizer runoff into Lake Victoria tributaries like River Nyando. This directly suppresses eutrophication and stops the explosive spread of invasive Water Hyacinth blooms, protecting our fish stocks and fishing communities.`;
      }
    } else {
      if (language === 'sw') {
        fallbackReply = `Habari mkulima! Mimi ni Amatsi AI Agronomist. Ninaweza kukusaidia kuhusu udongo wa Black Cotton, ratiba bora za umwagiliaji, kupunguza gharama za petroli, na kukuza mboga za kienyeji kama Managu na Sukuma Wiki kwa faida kubwa.`;
      } else if (language === 'luo') {
        fallbackReply = `Misawa japur! An Amatsi AI Agronomist. Anyalo konyi kuom kwayo mar lowo, pigo kothe gi drip, gwelo mafuta mar pampu, kod pur mar Managu gi Sukuma Wiki e loka Kano.`;
      } else {
        fallbackReply = `Hello farmer! I am your Amatsi Basin Agronomist. I'm calibrated specifically for Lake Victoria smallholder agriculture, black cotton clay soils, and indigenous vegetables. Feel free to ask about irrigation cycles, soil vertisols, pump fuel savings, or pest management.`;
      }
    }

    return res.json({
      reply: fallbackReply,
      source: 'amatsi-basin-engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AMATSI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
