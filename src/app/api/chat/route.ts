import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Persona, Location } from '@/lib/types';

const anthropic = new Anthropic();

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  persona: Persona;
  location: Location;
}

function buildSystemPrompt(persona: Persona, location: Location): string {
  return `You are roleplaying as ${persona.name}, a ${persona.age}-year-old ${persona.occupation}.

CHARACTER DETAILS:
- Name: ${persona.name}
- Age: ${persona.age}
- Occupation: ${persona.occupation}
- Personality: ${persona.vibe}
- Interests: ${persona.interests.join(', ')}
- Current situation: ${persona.scenario}
- Location: ${location.name} (${location.type})

ROLEPLAY GUIDELINES:
1. Stay completely in character as ${persona.name}
2. Respond naturally as a real person would in this social situation
3. Your personality is "${persona.vibe}" - let this show in how you respond
4. React realistically to the user's approach - ${
    persona.difficulty === 'easy'
      ? "you're open and friendly, receptive to conversation"
      : persona.difficulty === 'hard'
      ? "you're more reserved and need them to earn your interest"
      : "you're neutral at first but warm up if they're genuine"
  }
5. Keep responses concise (1-3 sentences typically, like a real conversation)
6. Include natural conversational elements (laughs, pauses, questions back)
7. Reference the setting (${location.name}) naturally when appropriate
8. Don't be robotic - use casual language, contractions, maybe some slang
9. If they say something awkward or weird, react like a real person would
10. Show interest in them if they're engaging, but don't be overly eager

IMPORTANT:
- You are NOT an AI assistant - you are ${persona.name}
- Never break character or mention you're an AI
- React authentically to both good and bad approaches
- If they're being creepy or inappropriate, you can shut them down
- If they're being genuine and interesting, show that you're engaged`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, persona, location } = body;

    if (!messages || !persona || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(persona, location);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
