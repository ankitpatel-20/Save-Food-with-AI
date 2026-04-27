/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Map, Marker } from 'pigeon-maps';
import { FoodItem, Recipient, AllocationPlan } from '../types';

interface MapComponentProps {
  donation: FoodItem;
  recipients: Recipient[];
  allocation: AllocationPlan | null;
}

export default function MapComponent({ donation, recipients, allocation }: MapComponentProps) {
  // Center map on donor or NYC center
  const center = donation.coordinates || [40.7128, -74.0060];
  const MarkerAny = Marker as any;
  
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group min-h-[350px]">
      <Map 
        height={350} 
        defaultCenter={center} 
        defaultZoom={13}
      >
        {/* Donor Marker */}
        <MarkerAny 
          width={40} 
          anchor={donation.coordinates} 
          color="#10b981" 
        />
        
        {/* Recipient Markers */}
        {recipients.map((r, i) => (
          <MarkerAny 
            key={r.id || i}
            width={30} 
            anchor={r.coordinates} 
            color={allocation?.priorityRanking.find(pr => pr.recipientId === r.id) ? "#0f172a" : "#94a3b8"}
          />
        ))}

        {/* Route Steps (Numbered Markers) */}
        {allocation?.suggestedRoute.map((step, idx) => (
          step.coordinates && (
            <MarkerAny 
              key={`step-${idx}`}
              width={35}
              anchor={step.coordinates}
              payload={idx + 1}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-[10px] font-bold shadow-md border-2 border-white translate-y-[-50%]">
                {idx + 1}
              </div>
            </MarkerAny>
          )
        ))}
      </Map>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-widest space-y-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>Donor Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-900"></div>
          <span>Recipients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px]">#</div>
          <span>Delivery Sequence</span>
        </div>
      </div>
    </div>
  );
}
