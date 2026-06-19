import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Load available keys from environment
const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(Boolean); // Filters out any undefined keys

let currentKeyIndex = 0;

/**
 * Round-robin key rotation for Gemini API
 */
function getNextApiKey() {
    if (keys.length === 0) {
        throw new Error('No Gemini API keys found in the environment variables.');
    }
    const key = keys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`Rotating to API Key index: ${currentKeyIndex}`);
    return key;
}

/**
 * Classifies a complaint into a standard department using Gemini API
 * @param {string} text - The complaint text
 * @returns {Promise<{department: string}>}
 */
export async function classifyComplaint(text) {
    const apiKey = getNextApiKey();
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `You are a triage assistant for a government grievance portal. 
Classify the following complaint into EXACTLY ONE department from this preset list: 
['PWD', 'Delhi Jal Board', 'Health', 'Electricity'].

Return your answer strictly in valid JSON format like this: 
{"department": "Chosen Department"}

Complaint text: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error classifying complaint using Gemini:', error);
        throw new Error('Failed to classify complaint due to AI service error.');
    }
}
