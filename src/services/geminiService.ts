import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Initialize the Google Generative AI instance
const ai = new GoogleGenerativeAI(API_KEY || '');

// Message type for the Gemini API
interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Content type for API requests
interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Kripto ve finans botunun sistem yönergesi
const SYSTEM_PROMPT = `Sen Opus-Q isimli kripto para ve finans platformunun yapay zeka asistanısın. 
Adın Opus. Kullanıcılara kripto paralar, blockchain teknolojisi, yatırım stratejileri ve finans konularında yardımcı oluyorsun.

İşte özelliklerin ve görevlerin:

1. Kripto paralar (Bitcoin, Ethereum, Solana, vb.) hakkında güncel bilgiler sunabilirsin.
2. Finans ve yatırım terimleri hakkında açıklamalar yapabilirsin.
3. Blockchain teknolojisi ve çalışma prensipleri hakkında bilgiler verebilirsin.
4. DeFi, NFT, Web3 gibi konular hakkında açıklamalar yapabilirsin.
5. Yatırım tavsiyeleri verebilirsin - bu konuda detaylı ve açıklayıcı ol.
6. Yatırım stratejileri, portföy yönetimi ve risk değerlendirmesi hakkında öneriler sunabilirsin.
7. Kripto para piyasalarındaki trendleri analiz edebilir ve gelecekteki olası senaryoları paylaşabilirsin.
8. Kullanıcıya nazik, profesyonel ve yardımcı bir üslupla cevap ver.
9. Bilmediğin veya emin olmadığın konularda dürüst ol.
10. Cevaplarını tamamen Türkçe olarak ver.
11. Cevaplarını formatlamak için Markdown kullan - başlıklar, listeler, kalın yazı vb. için.
12. Konuyla ilgisiz veya uygunsuz soruları kibarca geri çevir.

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

    console.log('Sending request to Gemini API using @google/generative-ai library');
    
    // Check if we have valid messages
    if (messages.length === 0) {
      console.error('No messages provided to Gemini API');
      return "Mesaj bulunamadı. Lütfen bir soru sorun.";
    }
    
    // Generate content using conversation history
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Get the last message
    const lastMessage = messages[messages.length - 1];
    
    // Prepare content for generation
    const content: GeminiContent[] = [];
    
    // First add system prompt as a separate content block
    content.push({
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }]
    });
    
    // Add previous conversation as context
    if (messages.length > 1) {
      for (let i = 0; i < messages.length; i++) {
        content.push({
          role: messages[i].role,
          parts: messages[i].parts
        });
      }
    } else {
      // If it's just one message, add it directly
      content.push({
        role: lastMessage.role,
        parts: lastMessage.parts
      });
    }
    
    try {
      console.log("Sending content to Gemini:", JSON.stringify(content).substring(0, 200) + "...");
      
      // Use generateContent with the entire history
      const result = await model.generateContent({
        contents: content,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      const response = result.response;
      
      if (response && response.text) {
        return response.text();
      } else {
        console.error('Gemini API: No response text returned', response);
        return "Yanıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.";
      }
    } catch (error: unknown) {
      console.error('Error generating content:', error);
      
      // Fallback to simple message if content approach fails
      try {
        // Create a simpler prompt that includes just system prompt and last message
        const simpleContent: GeminiContent[] = [
          {
            role: "user",
            parts: [{ text: `${SYSTEM_PROMPT}\n\nÖnceki konuşma: 
            ${messages.slice(0, -1).map(m => 
              `${m.role === 'user' ? 'Kullanıcı' : 'AI'}: ${m.parts[0].text}`
            ).join('\n')}
            
            Kullanıcı şimdi soruyor: ${lastMessage.parts[0].text}` }]
          }
        ];
        
        const fallbackResult = await model.generateContent({
          contents: simpleContent,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        });
        
        const fallbackResponse = fallbackResult.response;
        
        if (fallbackResponse && fallbackResponse.text) {
          return fallbackResponse.text();
        } else {
          return "Yanıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.";
        }
      } catch (fallbackError: unknown) {
        console.error('Error in fallback approach:', fallbackError);
        return "Bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.";
      }
    }
  } catch (error: unknown) {
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

// Check if the conversation is empty
export function isConversationEmpty(messages: GeminiMessage[]): boolean {
  return messages.length === 0 || (messages.length === 1 && messages[0].parts[0].text.trim() === '');
} 