
import { GoogleGenAI, Type, Modality } from "@google/genai";

// مقداردهی اولیه با رعایت سخت‌گیرانه قوانین امنیتی
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * تحلیل استخراجی تصویر چک
 */
export const analyzeCheckImage = async (base64Image: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/png' } },
        { text: "این تصویر یک چک بانکی است. لطفا شماره چک، مبلغ، نام صادرکننده و تاریخ سررسید را استخراج کرده و به صورت JSON برگردانید." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          checkNumber: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          issuer: { type: Type.STRING },
          dueDate: { type: Type.STRING, description: "تاریخ شمسی به فرمت 140x/xx/xx" }
        },
        required: ["checkNumber", "amount"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * تحلیل ریسک اعتباری پیشرفته
 */
export const getAdvancedRiskAnalysis = async (checksData: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `به عنوان یک کارشناس ارشد اعتبارسنجی بانکی، این چک‌ها را تحلیل کن و یک گزارش ساختاریافته شامل 'نمره ریسک' (از ۱۰۰)، 'نقاط ضعف' و 'پیشنهادات امنیتی' ارائه بده: ${checksData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskScore: { type: Type.NUMBER },
          riskLevel: { type: Type.STRING, description: "کم، متوسط، زیاد" },
          analysis: { type: Type.STRING },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["riskScore", "riskLevel", "analysis"]
      },
      thinkingConfig: { thinkingBudget: 15000 }
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * رادار پیش‌گو: تحلیل استراتژیک نقدینگی و جریانات مالی آینده
 */
export const getStrategicRoadmap = async (checksData: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `تو یک مدیر مالی (CFO) خبره با تفکر استراتژیک هستی. بر اساس چک‌های زیر، نقشه راه ۳۰ روزه نقدینگی را ترسیم کن. 
    روزهای بحرانی که خروجی نقدینگی زیاد است را شناسایی کن.
    داده‌ها: ${checksData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "یک خلاصه مدیریتی ۵۰ کلمه‌ای برای پادکست صوتی" },
          criticalDates: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                reason: { type: Type.STRING },
                severity: { type: Type.STRING, description: "HIGH, MEDIUM, LOW" }
              }
            } 
          },
          actionPlan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "حداقل ۴ گام اجرایی برای مدیریت نقدینگی" }
        },
        required: ["summary", "criticalDates", "actionPlan"]
      },
      thinkingConfig: { thinkingBudget: 25000 }
    }
  });
  return JSON.parse(response.text || '{}');
};

/**
 * جستجوی هوشمند داده‌های مالی با استفاده از ابزار Google Search
 */
export const searchFinancialData = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

/**
 * تبدیل متن به گفتار (TTS) با صدای حرفه‌ای برای گزارش‌های مدیریتی
 */
export const generateSpeechReport = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `گزارش صوتی استراتژیک تیسا برای مدیریت ارشد. موضوع: وضعیت نقدینگی. متن گزارش: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // صدای مناسب برای گزارش‌های رسمی
        },
      },
    },
  });
  
  // استخراج بایت‌های صوتی خام (Raw PCM)
  const part = response.candidates?.[0]?.content?.parts?.[0];
  return part?.inlineData?.data;
};

/**
 * ابزارهای کمکی برای مدیریت داده‌های باینری و صوتی
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * رمزنگاری داده‌های صوتی خام (PCM) از Float32 به Uint8Array (Int16)
 */
export function encodePCM(data: Float32Array): Uint8Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // محدود کردن مقدار بین -1 و 1 و سپس تبدیل به رنج Int16
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32768;
  }
  return new Uint8Array(int16.buffer);
}

/**
 * دکود کردن داده‌های صوتی برای پخش در مرورگر
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * ایجاد یک Blob با فرمت WAV از بایت‌های خام PCM جهت سازگاری با تلگرام و پخش‌کننده‌ها
 */
export function createWavBlob(pcmBase64: string, sampleRate: number = 24000): Blob {
  const pcmData = decodeBase64(pcmBase64);
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  // هدر فایل WAV (RIFF Header)
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.length, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  // زیربخش فرمت (fmt sub-chunk)
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);          // سایز زیربخش
  view.setUint16(20, 1, true);           // کد فرمت (1 برای PCM)
  view.setUint16(22, 1, true);           // تعداد کانال (1 برای مونو)
  view.setUint32(24, sampleRate, true);  // فرکانس نمونه‌برداری
  view.setUint32(28, sampleRate * 2, true); // بایت در ثانیه
  view.setUint16(32, 2, true);           // تراز بلوک
  view.setUint16(34, 16, true);          // بایت بر نمونه

  // زیربخش داده (data sub-chunk)
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmData.length, true);

  // کپی داده‌های صوتی خام بعد از هدر
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}
