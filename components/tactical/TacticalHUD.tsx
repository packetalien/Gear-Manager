"use client";

/**
 * TacticalHUD - Top bar with character info, encumbrance meter, and quick stats
 * Premium video-game style with glassmorphism and neon accents
 */

import { useMemo } from "react";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { encumbranceMeterSegments, basicLift, encumbranceLevel } from "@/lib/gurps/encumbrance";
import { Save } from "lucide-react";

export function TacticalHUD() {
  const character = useInventoryStore((state) => state.character);
  const containers = useInventoryStore((state) => state.character?.containers ?? []);

  // Compute values from state directly to avoid infinite loops
  const totalWeight = useMemo(() => {
    if (!character) return 0;
    return containers.reduce((total, container) => {
      return total + container.items.reduce((sum, item) => {
        const itemWeight = item.itemDefinition?.weight ?? 0;
        return sum + itemWeight * item.quantity;
      }, 0);
    }, 0);
  }, [character, containers]);

  const encumbrance = useMemo(() => {
    if (!character) return null;
    return encumbranceLevel(totalWeight, character.strength);
  }, [character, totalWeight]);

  const effectiveMove = useMemo(() => {
    if (!character || !encumbrance) return character?.move ?? 0;
    return Math.max(1, character.move + encumbrance.moveModifier);
  }, [character, encumbrance]);

  const effectiveDodge = useMemo(() => {
    if (!character || !encumbrance) return character?.dodge ?? 0;
    return Math.max(1, character.dodge + encumbrance.dodgeModifier);
  }, [character, encumbrance]);

  if (!character || !encumbrance) {
    return null;
  }

  const bl = basicLift(character.strength);
  const segments = encumbranceMeterSegments(character.strength);
  const encPercentage = Math.min(100, (totalWeight / (bl * 10)) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 h-[60px] glass-panel z-50 flex items-center px-6">
      {/* Left: Character Name + Portrait */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff9f] to-[#00cc7f] flex items-center justify-center text-black font-bold text-sm">
          {character.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{character.name}</div>
          <div className="text-gray-400 text-xs">ST {character.strength}</div>
        </div>
      </div>

      {/* Center: Encumbrance Meter */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Encumbrance</span>
            <span className="text-xs font-mono text-white">
              {totalWeight.toFixed(1)} / {bl.toFixed(1)} lbs
            </span>
          </div>
          
          {/* Encumbrance Bar */}
          <div className="relative h-6 bg-gray-900/50 rounded-sm overflow-hidden border border-gray-700/50">
            {/* Segments */}
            {segments.map((seg, idx) => (
              <div
                key={seg.level}
                className="absolute h-full"
                style={{
                  left: `${seg.start}%`,
                  width: `${seg.end - seg.start}%`,
                  background: seg.color,
                  opacity: encPercentage > seg.start ? 1 : 0.3,
                }}
              />
            ))}
            
            {/* Current position indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white"
              style={{ left: `${encPercentage}%` }}
            />
            
            {/* Level label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  encumbrance.level !== "None" && encumbrance.level !== "Light"
                    ? "text-red-400"
                    : "text-white"
                }`}
                style={{ textShadow: "0 0 8px currentColor" }}
              >
                {encumbrance.level}
              </span>
            </div>
          </div>

          {/* Penalties Display */}
          {(encumbrance.moveModifier !== 0 || encumbrance.dodgeModifier !== 0) && (
            <div className="mt-1 flex items-center justify-center gap-4 text-xs">
              {encumbrance.moveModifier !== 0 && (
                <span className="text-red-400 font-bold">
                  Move {encumbrance.moveModifier > 0 ? "+" : ""}{encumbrance.moveModifier}
                </span>
              )}
              {encumbrance.dodgeModifier !== 0 && (
                <span className="text-red-400 font-bold">
                  Dodge {encumbrance.dodgeModifier > 0 ? "+" : ""}{encumbrance.dodgeModifier}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Quick Stats + Save Button */}
      <div className="flex items-center gap-6 min-w-[280px] justify-end">
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400 text-xs">Move</div>
            <div className="text-white font-mono font-bold">{effectiveMove}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs">Dodge</div>
            <div className="text-white font-mono font-bold">{effectiveDodge}</div>
          </div>
        </div>
        
        <button className="glass-panel px-4 py-2 rounded-sm flex items-center gap-2 text-sm text-white hover:neon-border transition-all">
          <Save className="w-4 h-4" />
          Save Loadout
        </button>
      </div>
    </div>
  );
}
