/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { AllocationPlan, FoodItem, Recipient } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAllocationPlan(
  donation: FoodItem,
  recipients: Recipient[]
): Promise<AllocationPlan | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are SaveSmart AI, a logistics optimizer and humanitarian planner. 
Analyze the following food donation and suggest the best allocation plan across nearby recipients.

FOOD DONATION:
- Donor: ${donation.donorName}
- Type: ${donation.type}
- Quantity: ${donation.quantity}
- Expiry: ${donation.expiryTime}
- Location: ${donation.location}

NEARBY RECIPIENTS:
${JSON.stringify(recipients, null, 2)}

Provide a detailed allocation plan focusing on:
1. Minimizing waste (prioritizing short expiry food to nearest/highest urgency recipients)
2. Maximizing impact (feeding most people)
3. Logistical efficiency (suggested delivery route with coordinates if possible, use the ones provided in the context)

NEARBY RECIPIENTS (with coordinates):
${JSON.stringify(recipients, null, 2)}

DONATION (start point):
${donation.location} at [${donation.coordinates}]

Response must be in JSON format matching the defined schema. 
For 'suggestedRoute', use the coordinates of the recipients and the donor.
Ensure 'suggestedRoute' coordinates are in [lat, lng] format.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestPlan: { type: Type.STRING },
            priorityRanking: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  recipientId: { type: Type.STRING },
                  recipientName: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                },
                required: ["recipientId", "recipientName", "score", "reason"],
              },
            },
            suggestedRoute: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.NUMBER },
                  location: { type: Type.STRING },
                  action: { type: Type.STRING },
                },
                required: ["step", "location", "action"],
              },
            },
            wasteReductionEstimate: { type: Type.STRING },
            emergencyRecommendations: { type: Type.STRING },
            impactSummary: {
              type: Type.OBJECT,
              properties: {
                peopleFed: { type: Type.NUMBER },
                kgSaved: { type: Type.NUMBER },
                co2Reduced: { type: Type.NUMBER },
              },
              required: ["peopleFed", "kgSaved", "co2Reduced"],
            },
          },
          required: [
            "bestPlan",
            "priorityRanking",
            "suggestedRoute",
            "wasteReductionEstimate",
            "impactSummary",
          ],
        },
      },
    });

    if (!response.text) return null;
    return JSON.parse(response.text) as AllocationPlan;
  } catch (error) {
    console.error("Error generating allocation plan:", error);
    return null;
  }
}
