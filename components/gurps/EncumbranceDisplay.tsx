"use client";

/**
 * EncumbranceDisplay - Shows GURPS encumbrance level and modifiers
 */

import { encumbranceLevel, basicLift, calculateTotalWeight } from "@/lib/gurps/encumbrance";
import type { GURPSCharacter, GURPSItem } from "@/types/gurps";

interface EncumbranceDisplayProps {
  character: GURPSCharacter;
  items: GURPSItem[];
}

export function EncumbranceDisplay({ character, items }: EncumbranceDisplayProps) {
  const bl = basicLift(character.strength);
  const totalWeight = calculateTotalWeight(
    items.map((item) => ({
      weight: item.itemDefinition?.weight ?? 0,
      quantity: item.quantity,
    }))
  );
  const encumbrance = encumbranceLevel(totalWeight, character.strength);

  const encumbranceColors = {
    None: "text-green-400",
    Light: "text-yellow-400",
    Medium: "text-orange-400",
    Heavy: "text-red-400",
    "Extra-Heavy": "text-red-600",
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Encumbrance</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Basic Lift:</span>
          <span className="text-white font-mono">{bl.toFixed(1)} lbs</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Carried Weight:</span>
          <span className="text-white font-mono">{totalWeight.toFixed(1)} lbs</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Level:</span>
          <span className={`font-semibold ${encumbranceColors[encumbrance.level]}`}>
            {encumbrance.level}
          </span>
        </div>
        
        {encumbrance.moveModifier !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Move Modifier:</span>
            <span className="text-red-400">{encumbrance.moveModifier}</span>
          </div>
        )}
        
        {encumbrance.dodgeModifier !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Dodge Modifier:</span>
            <span className="text-red-400">{encumbrance.dodgeModifier}</span>
          </div>
        )}
      </div>
    </div>
  );
}
