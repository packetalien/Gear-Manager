"use client";

/**
 * PaperDoll - Full-body SVG silhouette with clickable GURPS hit locations
 * Interactive zones that highlight equipped armor and show protection stats
 */

import { useInventoryStore } from "@/lib/stores/inventoryStore";
import type { HitLocation } from "@/types/gurps";

const HIT_LOCATION_PATHS: Record<HitLocation, string> = {
  skull: "M 45 8 Q 50 5 55 8 L 58 12 Q 60 15 58 18 L 55 22 Q 50 25 45 22 L 42 18 Q 40 15 42 12 Z",
  eyes: "M 47 16 L 50 16 L 50 19 L 47 19 Z M 50 16 L 53 16 L 53 19 L 50 19 Z",
  face: "M 42 22 L 58 22 L 58 32 L 42 32 Z",
  neck: "M 47 32 L 53 32 L 53 40 L 47 40 Z",
  torso: "M 38 40 L 62 40 L 62 72 L 38 72 Z",
  vitals: "M 43 48 L 57 48 L 57 62 L 43 62 Z",
  groin: "M 43 72 L 57 72 L 57 80 L 43 80 Z",
  arms: "M 20 42 L 38 45 L 38 68 L 25 72 Z M 62 45 L 80 42 L 80 72 L 62 68 Z",
  hands: "M 18 72 L 28 76 L 28 82 L 18 82 Z M 72 76 L 82 72 L 82 82 L 72 82 Z",
  legs: "M 40 80 L 46 80 L 46 96 L 40 96 Z M 54 80 L 60 80 L 60 96 L 54 96 Z",
  feet: "M 38 96 L 46 99 L 46 102 L 38 102 Z M 54 99 L 62 96 L 62 102 L 54 102 Z",
};

const HIT_LOCATION_LABELS: Record<HitLocation, string> = {
  skull: "Skull",
  eyes: "Eyes",
  face: "Face",
  neck: "Neck",
  torso: "Torso",
  vitals: "Vitals",
  groin: "Groin",
  arms: "Arms",
  hands: "Hands",
  legs: "Legs",
  feet: "Feet",
};

export function PaperDoll() {
  const character = useInventoryStore((state) => state.character);
  const selectedHitLocation = useInventoryStore((state) => state.selectedHitLocation);
  const setSelectedHitLocation = useInventoryStore((state) => state.setSelectedHitLocation);
  const equippedItems = character?.equippedItems ?? new Map();

  const handleLocationClick = (location: HitLocation) => {
    setSelectedHitLocation(location === selectedHitLocation ? null : location);
  };

  return (
    <div className="glass-panel p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
        Paper Doll
      </h3>
      
      <div className="relative">
        <svg
          viewBox="0 0 100 110"
          className="w-full h-auto"
          style={{ maxHeight: "400px" }}
        >
          {/* Body outline */}
          <path
            d="M 50 10 L 60 15 L 55 25 L 45 25 L 40 25 L 25 45 L 20 75 L 20 85 L 30 85 L 30 80 L 40 70 L 40 50 L 40 42 L 48 42 L 48 35 L 45 35 L 45 25 L 50 10 Z M 60 15 L 55 25 L 55 35 L 52 35 L 52 42 L 60 42 L 60 50 L 60 70 L 70 80 L 70 85 L 80 85 L 80 75 L 75 45 L 60 50 L 60 42 L 60 35 L 55 35 L 55 25 L 60 15 Z M 40 75 L 60 75 L 60 82 L 58 82 L 58 95 L 52 95 L 52 82 L 48 82 L 48 95 L 42 95 L 42 82 L 40 82 Z"
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(0, 255, 159, 0.3)"
            strokeWidth="0.5"
          />
          
          {/* Hit location zones */}
          {(Object.keys(HIT_LOCATION_PATHS) as HitLocation[]).map((location) => {
            const equipped = equippedItems.get(location);
            const isSelected = selectedHitLocation === location;
            const isActive = isSelected || !!equipped;
            
            return (
              <g key={location}>
                <path
                  d={HIT_LOCATION_PATHS[location]}
                  className={isActive ? "hit-location-active" : ""}
                  fill={equipped ? "rgba(0, 255, 159, 0.4)" : "rgba(255, 255, 255, 0.05)"}
                  stroke={isActive ? "#00ff9f" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth={isActive ? "1.5" : "0.5"}
                  onClick={() => handleLocationClick(location)}
                  style={{ cursor: "pointer" }}
                />
                {equipped && (
                  <text
                    x="50"
                    y={getLabelY(location)}
                    textAnchor="middle"
                    className="text-[2px] fill-[#00ff9f] pointer-events-none"
                    style={{ fontSize: "3px" }}
                  >
                    DR {equipped.itemDefinition?.dr ?? 0}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Equipped Items List */}
      <div className="mt-4 space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Equipped</div>
        {equippedItems.size === 0 ? (
          <div className="text-xs text-gray-500 italic">No items equipped</div>
        ) : (
          Array.from(equippedItems.entries()).map(([location, item]) => (
            <div
              key={location}
              className="text-xs text-gray-300 p-2 rounded bg-gray-900/30 hover:bg-gray-900/50 cursor-pointer transition-colors"
              onClick={() => handleLocationClick(location)}
            >
              <div className="font-semibold">{HIT_LOCATION_LABELS[location as HitLocation]}</div>
              <div className="text-gray-400">{item.itemDefinition?.name}</div>
              {item.itemDefinition?.dr && (
                <div className="text-[#00ff9f]">DR {item.itemDefinition.dr}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getLabelY(location: HitLocation): number {
  const positions: Record<HitLocation, number> = {
    skull: 12,
    eyes: 20,
    face: 30,
    neck: 38,
    torso: 58,
    vitals: 57,
    groin: 78,
    arms: 60,
    hands: 80,
    legs: 88,
    feet: 97,
  };
  return positions[location] ?? 50;
}
