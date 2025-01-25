import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

// Backend API URL - should be in environment variable in production
const BACKEND_URL = "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const { model, messages: originalMessages } = await req.json();
    
    // Create a working copy of messages
    let messages = [...originalMessages];

    // Get the last user message
    const lastUserMessage = messages.findLast((msg: any) => msg.role === "user");
    
    if (lastUserMessage) {
      try {
        // Call our backend to get relevant context
        const contextResponse = await fetch(`${BACKEND_URL}/context?user_input=${encodeURIComponent(lastUserMessage.content)}`);
        const contextData = await contextResponse.json();
        
        if (contextData.status === "success" && contextData.data) {
          // Find the index where to inject the context
          const lastSystemIndex = messages.findIndex((msg: any) => msg.role === "system");
          
          // Create context message
          const contextMessage = {
            role: "system",
            content: `Here is some relevant context for the conversation:\n${contextData.data}\n\nPlease use this context to inform your response.`
          };
          
          // Clone messages array to avoid mutating the original
          const messagesWithContext = [...messages];
          
          if (lastSystemIndex >= 0) {
            // Append context to existing system message
            messagesWithContext[lastSystemIndex].content += `\n\nAdditional Context:\n${contextData.data}`;
          } else {
            // Insert new system message at the start
            messagesWithContext.unshift(contextMessage);
          }
          
          // Update messages
          messages = messagesWithContext;
        }
      } catch (error) {
        // Log error but continue with original messages if context fetch fails
        console.error("Error fetching context:", error);
      }
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
    });

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error("Error in /chat/completions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
