/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FoodItem {
  id: string;
  type: string;
  quantity: string;
  expiryTime: string; // ISO string or relative
  location: string;
  donorName: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface Recipient {
  id: string;
  name: string;
  type: 'Shelter' | 'NGO' | 'Community Center';
  needs: string;
  capacity: number;
  location: string;
  distance: number; // in km
  urgency: number; // 0-10
  coordinates: [number, number];
  description?: string;
  hours?: string;
  contact?: string;
  lastActivity?: string;
}

export interface AllocationPlan {
  bestPlan: string;
  priorityRanking: {
    recipientId: string;
    recipientName: string;
    score: number;
    reason: string;
  }[];
  suggestedRoute: {
    step: number;
    location: string;
    action: string;
    coordinates?: [number, number];
  }[];
  wasteReductionEstimate: string;
  emergencyRecommendations?: string;
  impactSummary: {
    peopleFed: number;
    kgSaved: number;
    co2Reduced: number;
  };
}
