import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize the Google Generative AI instance
const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

// Message type for the Gemini API
interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Kripto ve finans botunun sistem yönergesi
const SYSTEM_PROMPT = `Sen Opus-Q isimli kripto para ve finans platformunun yapay zeka asistanısın. 
Adın Opus. Kullanıcılara kripto paralar, blockchain teknolojisi, yatırım stratejileri ve finans konularında yardımcı oluyorsun.

İşte özelliklerin ve sınırlamaların:

1. Kripto paralar (Bitcoin, Ethereum, Solana, vb.) hakkında güncel bilgiler sunabilirsin.
2. Finans ve yatırım terimleri hakkında açıklamalar yapabilirsin.
3. Blockchain teknolojisi ve çalışma prensipleri hakkında bilgiler verebilirsin.
4. DeFi, NFT, Web3 gibi konular hakkında açıklamalar yapabilirsin.
5. Yatırım tavsiyeleri vermekten kaçınmalısın - "finansal tavsiye değildir" şeklinde uyarılar ekle.
6. Kullanıcıya nazik, profesyonel ve yardımcı bir üslupla cevap ver.
7. Bilmediğin veya emin olmadığın konularda dürüst ol.
8. Cevaplarını tamamen Türkçe olarak ver.
9. Cevaplarını formatlamak için Markdown kullan - başlıklar, listeler, kalın yazı vb. için.
10. Konuyla ilgisiz veya uygunsuz soruları kibarca geri çevir.

Cevapların kolayca anlaşılabilir, doğru ve faydalı olmalı.`;

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  promptFeedback: {
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
    blockReason?: string;
  };
}

export async function sendMessageToGemini(messages: GeminiMessage[]): Promise<string> {
  try {
    if (!API_KEY) {
      console.error('Gemini API key is missing');
      return "API anahtarı eksik. Lütfen sistem yöneticisiyle iletişime geçin.";
    }

    console.log('Sending request to Gemini API using @google/genai library');

    // Get the last user message content
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].parts[0].text : "";
    
    // Sistem yönergesini kullanıcı mesajına ekle
    const enhancedContent = `${SYSTEM_PROMPT}\n\nKullanıcı Sorusu: ${lastUserMessage}`;

    // Generate content using the simplified API
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: enhancedContent
    });
    
    if (response && response.text) {
      return response.text;
    } else {
      console.error('Gemini API: No response text returned', response);
      return "Yanıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.";
    }
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    return "Bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.";
  }
}

// Helper to format messages for the Gemini API
export function formatMessagesForGemini(messages: { role: 'user' | 'assistant'; content: string }[]): GeminiMessage[] {
  return messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
} 