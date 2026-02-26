"use client";

/**
 * ItemInspector - Right panel showing detailed GURPS item stats
 * High-detail card with TL, LC, Cost, Weight, Bulk, Quality, etc.
 */

import { useInventoryStore } from "@/lib/stores/inventoryStore";
import type { HitLocation } from "@/types/gurps";
import { Shield, DollarSign, Weight, Zap } from "lucide-react";

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

export function ItemInspector() {
  const selectedItem = useInventoryStore((state) => state.selectedItem);
  const character = useInventoryStore((state) => state.character);
  const equipItem = useInventoryStore((state) => state.equipItem);

  if (!selectedItem || !selectedItem.itemDefinition) {
    return (
      <div className="glass-panel p-6 rounded-lg h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-sm">Select an item to view details</div>
        </div>
      </div>
    );
  }

  const item = selectedItem.itemDefinition;
  const canEquip = item.isArmor && item.locations && item.locations.length > 0;

  return (
    <div className="glass-panel p-6 rounded-lg h-full overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-white mb-1">{item.name}</h2>
          {item.description && (
            <p className="text-sm text-gray-400">{item.description}</p>
          )}
        </div>

        {/* Basic Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {item.weight !== undefined && (
            <div className="glass-panel p-3 rounded-sm">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Weight className="w-3 h-3" />
                Weight
              </div>
              <div className="text-white font-mono font-bold">
                {item.weight} lbs
              </div>
            </div>
          )}

          {item.cost !== undefined && (
            <div className="glass-panel p-3 rounded-sm">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <DollarSign className="w-3 h-3" />
                Cost
              </div>
              <div className="text-white font-mono font-bold">
                ${item.cost}
              </div>
            </div>
          )}

          {item.tl !== undefined && (
            <div className="glass-panel p-3 rounded-sm">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Zap className="w-3 h-3" />
                TL
              </div>
              <div className="text-white font-mono font-bold">{item.tl}</div>
            </div>
          )}

          {item.lc !== undefined && (
            <div className="glass-panel p-3 rounded-sm">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                Shield
                <Shield className="w-3 h-3" />
                LC
              </div>
              <div className="text-white font-mono font-bold">{item.lc}</div>
            </div>
          )}
        </div>

        {/* Quality */}
        {item.quality && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Quality</div>
            <div className="text-[#00ff9f] font-semibold">{item.quality}</div>
          </div>
        )}

        {/* Armor Stats */}
        {item.isArmor && item.dr !== undefined && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Damage Resistance</div>
            <div className="text-white font-mono font-bold text-lg">DR {item.dr}</div>
            {item.locations && (
              <div className="text-xs text-gray-400 mt-1">
                Protects: {item.locations.map((loc) => HIT_LOCATION_LABELS[loc]).join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Weapon Stats */}
        {item.damage && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Weapon Stats</div>
            <div className="glass-panel p-3 rounded-sm space-y-2">
              {item.damage && (
                <div>
                  <div className="text-xs text-gray-400">Damage</div>
                  <div className="text-white font-mono">{item.damage}</div>
                </div>
              )}
              {item.reach && (
                <div>
                  <div className="text-xs text-gray-400">Reach</div>
                  <div className="text-white font-mono">{item.reach}</div>
                </div>
              )}
              {item.parry && (
                <div>
                  <div className="text-xs text-gray-400">Parry</div>
                  <div className="text-white font-mono">{item.parry}</div>
                </div>
              )}
              {item.bulk && (
                <div>
                  <div className="text-xs text-gray-400">Bulk</div>
                  <div className="text-white font-mono">{item.bulk}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid Size */}
        <div className="glass-panel p-3 rounded-sm">
          <div className="text-xs text-gray-400 mb-1">Grid Size</div>
          <div className="text-white font-mono">
            {item.gridWidth}×{item.gridHeight}
          </div>
        </div>

        {/* Equip Buttons */}
        {canEquip && item.locations && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Equip to Location</div>
            <div className="grid grid-cols-2 gap-2">
              {item.locations.map((location) => (
                <button
                  key={location}
                  onClick={() => equipItem(selectedItem.id, location)}
                  className="glass-panel p-2 rounded-sm text-xs text-white hover:neon-border transition-all text-left"
                >
                  {HIT_LOCATION_LABELS[location]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="text-xs text-gray-400 mb-1">Notes</div>
            <div className="text-sm text-gray-300">{item.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
