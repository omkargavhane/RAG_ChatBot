import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { GoogleGenAI } from "@google/genai";
import { Pinecone } from '@pinecone-database/pinecone';

const ai = new GoogleGenAI({});

/**
 * Rewrites a user question into a standalone question using full conversation history.
 * Ensures no empty messages are sent to Gemini.
 */
async function transformQuery(question, history) {
    // Filter out empty messages
    const aiHistory = history
        .filter(msg => msg.text && msg.text.trim() !== "")
        .map(msg => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
        }));

    // Add current user message
    aiHistory.push({ role: 'user', parts: [{ text: question }] });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: aiHistory,
        config: {
            systemInstruction: `You are a query rewriting expert.
            Based on the chat history, rephrase the user question into a complete standalone question
            that can be understood without the previous messages. Only output the rewritten question.`
        }
    });

    return response.text;
}

/**
 * Main chatting function.
 * history: Array of { sender: "user"|"bot", text: string }
 */
export async function chatting(history) {
    if (!Array.isArray(history)) history = [];

    // Filter out empty messages
    const filteredHistory = history.filter(msg => msg.text && msg.text.trim() !== "");

    // Get last user message
    const lastUserMsg = filteredHistory.filter(m => m.sender === "user").slice(-1)[0]?.text;
    if (!lastUserMsg) return "I could not find the answer in the provided document.";

    // Transform query with full history
    const queries = await transformQuery(lastUserMsg, filteredHistory);

    // Embed query using Google embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });
    const queryVector = await embeddings.embedQuery(queries);

    // Pinecone RAG search
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
    });

    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");

    // Build AI history for Gemini including context and previous conversation
    const aiHistory = filteredHistory.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
    }));

    // Append current user message
    aiHistory.push({ role: 'user', parts: [{ text: queries }] });

    // Generate response
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: aiHistory,
        config: {
            systemInstruction: `You are a Competitive Programming, Data Structure & Algorithm Expert.
            Answer based ONLY on the provided context.
            Context: ${context}
            If the answer is not in the context, say "I could not find the answer in the provided document."
            Keep your answers clear, concise, and educational.`
        }
    });

    return response.text;
}
