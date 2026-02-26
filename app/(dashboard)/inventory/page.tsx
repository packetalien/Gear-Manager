"use client";

/**
 * Inventory Page - Main inventory management interface
 * Features: Tactical vest grid, encumbrance display, item management
 */

import { useState } from "react";
import { GridContainer } from "@/components/inventory/GridContainer";
import { EncumbranceDisplay } from "@/components/gurps/EncumbranceDisplay";
import type { Character, InventorySlot, Item } from "@/types";
import { getSampleItem } from "@/lib/gurps";

export default function InventoryPage() {
  // Sample ST 12 Drow-style operator
  const [character] = useState<Character>({
    id: "char-1",
    userId: "user-1",
    name: "Drow Operator",
    strength: 12,
    dexterity: 14,
    intelligence: 13,
    health: 12,
    inventorySlots: [],
    equippedItems: [],
  });

  // Tactical vest (8×6 grid)
  const [tacticalVest] = useState<InventorySlot>({
    id: "vest-1",
    characterId: character.id,
    name: "Tactical Vest",
    gridWidth: 8,
    gridHeight: 6,
    slotType: "vest",
    items: [],
  });

  // Sample items pre-populated in the vest
  const [items, setItems] = useState<Item[]>([
    {
      id: "item-1",
      itemDefinitionId: "magazine-30",
      itemDefinition: getSampleItem("magazine-30"),
      characterId: character.id,
      quantity: 1,
      gridX: 0,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-2",
      itemDefinitionId: "magazine-30",
      itemDefinition: getSampleItem("magazine-30"),
      characterId: character.id,
      quantity: 1,
      gridX: 1,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-3",
      itemDefinitionId: "medkit",
      itemDefinition: getSampleItem("medkit"),
      characterId: character.id,
      quantity: 1,
      gridX: 0,
      gridY: 1,
      rotation: 0,
    },
    {
      id: "item-4",
      itemDefinitionId: "rifle-m4",
      itemDefinition: getSampleItem("rifle-m4"),
      characterId: character.id,
      quantity: 1,
      gridX: 2,
      gridY: 2,
      rotation: 0,
    },
  ]);

  const handleItemMove = (itemId: string, x: number, y: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, gridX: Math.floor(x / 40), gridY: Math.floor(y / 40) }
          : item
      )
    );
  };

  const handleItemRotate = (itemId: string, rotation: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, rotation } : item))
    );
  };

  return (
    <main className="min-h-screen tactical-hud p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {character.name}
          </h1>
          <p className="text-gray-400">
            ST {character.strength} | DX {character.dexterity} | IQ{" "}
            {character.intelligence} | HT {character.health}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Grid */}
          <div className="lg:col-span-2">
            <GridContainer
              slot={tacticalVest}
              items={items}
              cellSize={40}
              onItemMove={handleItemMove}
              onItemRotate={handleItemRotate}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <EncumbranceDisplay character={character} items={items} />

            {/* Item List */}
            <div className="tactical-card p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Items ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="text-sm text-gray-400 bg-gray-800/30 p-2 rounded"
                  >
                    {item.itemDefinition?.name} × {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
