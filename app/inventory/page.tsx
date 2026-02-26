"use client";

/**
 * Inventory Page - Main tactical inventory management interface
 * Premium video-game quality with full GURPS simulation
 */

import { useEffect, useState } from "react";
import { TacticalHUD } from "@/components/tactical/TacticalHUD";
import { PaperDoll } from "@/components/tactical/PaperDoll";
import { PixiGridContainer } from "@/components/inventory/PixiGridContainer";
import { ItemInspector } from "@/components/tactical/ItemInspector";
import { Hotbar } from "@/components/tactical/Hotbar";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { createSampleCharacter } from "@/lib/data/sampleCharacter";
import type { InventoryContainer } from "@/types/gurps";

const CONTAINER_TABS = [
  { id: "person", label: "On Person", type: "person" as const },
  { id: "backpack", label: "Backpack", type: "backpack" as const },
  { id: "vehicle", label: "Vehicle", type: "vehicle" as const },
  { id: "locker", label: "Base Locker", type: "locker" as const },
  { id: "alchemy", label: "Alchemy Kit", type: "alchemy" as const },
];

export default function InventoryPage() {
  const character = useInventoryStore((state) => state.character);
  const setCharacter = useInventoryStore((state) => state.setCharacter);
  const selectedContainer = useInventoryStore((state) => state.selectedContainer);
  const setSelectedContainer = useInventoryStore((state) => state.setSelectedContainer);
  
  const [activeTab, setActiveTab] = useState<string>("person");

  // Initialize sample character
  useEffect(() => {
    if (!character) {
      const sampleChar = createSampleCharacter();
      setCharacter(sampleChar);
      if (sampleChar.containers.length > 0) {
        setSelectedContainer(sampleChar.containers[0]);
      }
    }
  }, [character, setCharacter, setSelectedContainer]);

  // Update selected container when tab changes
  useEffect(() => {
    if (character) {
      const container = character.containers.find(
        (c) => c.containerType === activeTab
      );
      if (container) {
        setSelectedContainer(container);
      }
    }
  }, [activeTab, character, setSelectedContainer]);

  if (!character) {
    return (
      <div className="tactical-hud min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading character...</div>
      </div>
    );
  }

  const currentContainer = selectedContainer || character.containers[0];

  return (
    <div className="tactical-hud min-h-screen flex flex-col">
      {/* Top Bar */}
      <TacticalHUD />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 mt-[60px] mb-[80px] overflow-hidden">
        {/* Left Panel - Paper Doll */}
        <div className="w-[320px] flex-shrink-0">
          <PaperDoll />
        </div>

        {/* Center - Inventory Grids */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Container Tabs */}
          <div className="flex gap-2 mb-4">
            {CONTAINER_TABS.map((tab) => {
              const hasContainer = character.containers.some(
                (c) => c.containerType === tab.type
              );
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`glass-panel px-4 py-2 rounded-sm text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "neon-border text-[#00ff9f]"
                      : "text-gray-400 hover:text-white"
                  } ${!hasContainer ? "opacity-50" : ""}`}
                  disabled={!hasContainer}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Grid Container */}
          {currentContainer ? (
            <div className="flex-1 min-h-0">
              <PixiGridContainer container={currentContainer} cellSize={40} />
            </div>
          ) : (
            <div className="flex-1 glass-panel p-8 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-sm">No container selected</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Item Inspector */}
        <div className="w-[360px] flex-shrink-0">
          <ItemInspector />
        </div>
      </div>

      {/* Bottom Hotbar */}
      <Hotbar />
    </div>
  );
}
