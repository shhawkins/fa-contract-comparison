import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

// Aviation-specific system prompt for contract translation
const SYSTEM_PROMPT = `You are a specialized "Contract Translator" designed to help flight attendants understand complex contract language in plain English. Your role is to:

1. Translate legal contract language into practical, everyday terms
2. Explain how contract changes specifically affect flight attendants' work and life
3. Focus on the practical implications rather than legal technicalities
4. Use aviation industry terminology appropriately
5. Always provide page references when discussing specific contract sections
6. Be clear, concise, and helpful

Key areas to focus on:
- Scheduling rules and flexibility
- Pay scales and compensation
- Benefits and time off policies
- Work rules and regulations
- Base assignments and bidding
- Overtime and premium pay

IMPORTANT: You are NOT providing legal advice. You are helping translate complex language into understandable terms. Always remind users to consult with their union representatives for official guidance.

When referencing contract content, always include page numbers when available to help users find the information in their physical contracts.`;

export class ChatService {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    contractContext?: string
  ): Promise<ChatResponse> {
    if (!this.openai) {
      return {
        message: '',
        error: 'API key not configured. Please add your OpenAI API key in the settings.',
      };
    }

    try {
      // Build context with contract information if provided
      let systemMessage = SYSTEM_PROMPT;
      if (contractContext) {
        systemMessage += `\n\nCurrent contract context:\n${contractContext}`;
      }

      // Prepare messages for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemMessage },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4', // Use GPT-4 for better contract analysis
        messages,
        max_tokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent, factual responses
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const responseMessage = completion.choices[0]?.message?.content || 'No response generated.';

      return {
        message: responseMessage,
      };
    } catch (error: unknown) {
      console.error('Chat service error:', error);
      
      // Handle specific OpenAI errors
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as { status?: number; message?: string };
        if (apiError.status === 401) {
          return {
            message: '',
            error: 'Invalid API key. Please check your OpenAI API key and try again.',
          };
        } else if (apiError.status === 429) {
          return {
            message: '',
            error: 'Rate limit exceeded. Please wait a moment and try again.',
          };
        } else if (apiError.status === 400) {
          return {
            message: '',
            error: 'Request error. Please try rephrasing your question.',
          };
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        message: '',
        error: `Error communicating with OpenAI: ${errorMessage}`,
      };
    }
  }

  // Helper method to extract relevant contract context based on user query
  static extractRelevantContext(query: string, contractData: { sections?: Array<{ content?: string; pageStart?: number }> }): string {
    if (!contractData || !contractData.sections) return '';

    const queryLower = query.toLowerCase();
    const relevantSections: string[] = [];

    // Search for relevant sections based on query keywords
    const searchTerms = [
      'schedule', 'scheduling', 'pay', 'salary', 'wage', 'benefit', 'vacation', 
      'sick', 'overtime', 'premium', 'base', 'assignment', 'bidding', 'seniority',
      'crew', 'flight', 'duty', 'rest', 'time', 'hours'
    ];

    // Find sections that contain relevant terms
    contractData.sections.forEach((section: { content?: string; pageStart?: number }) => {
      const sectionText = (section.content || '').toLowerCase();
      const hasRelevantTerm = searchTerms.some(term => 
        queryLower.includes(term) && sectionText.includes(term)
      );

      if (hasRelevantTerm) {
        const contextString = `Page ${section.pageStart || 'Unknown'}: ${section.content?.substring(0, 500) || ''}...`;
        relevantSections.push(contextString);
      }
    });

    // Limit context to avoid token limits
    return relevantSections.slice(0, 3).join('\n\n');
  }
} 