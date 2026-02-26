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
          {/* Container Tabs - Sleek with grid size badges */}
          <div className="flex gap-2 mb-4 border-b border-gray-800">
            {CONTAINER_TABS.map((tab) => {
              const container = character.containers.find(
                (c) => c.containerType === tab.type
              );
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-[#00ff9f]"
                      : "text-gray-400 hover:text-white"
                  } ${!container ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={!container}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.label}</span>
                    {container && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive 
                          ? "bg-[#00ff9f]/20 text-[#00ff9f]" 
                          : "bg-gray-800/50 text-gray-500"
                      }`}>
                        {container.gridWidth}×{container.gridHeight}
                      </span>
                    )}
                  </div>
                  {/* Active underline */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff9f] shadow-[0_0_8px_rgba(0,255,159,0.6)]" />
                  )}
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
