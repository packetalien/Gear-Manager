"use client";

/**
 * Hotbar - Bottom quick-access bar with 10 slots (1-0 keys)
 * Items show large icons with ammo/charge counters
 */

import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { useCallback, useEffect } from "react";

export function Hotbar() {
  const character = useInventoryStore((state) => state.character);
  const addItemToHotbar = useInventoryStore((state) => state.addItemToHotbar);
  const removeItemFromHotbar = useInventoryStore((state) => state.removeItemFromHotbar);

  // Get items in hotbar slots
  const hotbarItems = Array.from({ length: 10 }, (_, i) => {
    if (!character) return null;
    return character.containers
      .flatMap((c) => c.items)
      .find((item) => item.hotbarSlot === i) || null;
  });

  // Keyboard shortcuts (1-0 keys)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= "1" && key <= "9") {
        const slot = parseInt(key) - 1;
        // Toggle item in hotbar (placeholder - would need item selection logic)
      } else if (key === "0") {
        const slot = 9;
        // Toggle item in hotbar
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] glass-panel z-50 flex items-center justify-center gap-2 px-4">
      {Array.from({ length: 10 }, (_, index) => {
        const item = hotbarItems[index];
        const keyLabel = index === 9 ? "0" : (index + 1).toString();

        return (
          <div
            key={index}
            className="glass-panel w-16 h-16 rounded-sm flex flex-col items-center justify-center relative cursor-pointer hover:neon-border transition-all group"
            onDrop={(e) => {
              e.preventDefault();
              // Handle drop from inventory
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
          >
            {item ? (
              <>
                <div className="text-xs text-white font-semibold text-center px-1 truncate w-full">
                  {item.itemDefinition?.name}
                </div>
                {item.quantity > 1 && (
                  <div className="absolute bottom-1 right-1 text-[#00ff9f] text-xs font-bold">
                    ×{item.quantity}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-600 text-xs">{keyLabel}</div>
            )}
            <div className="absolute -top-1 -left-1 text-[#00ff9f] text-[10px] font-mono opacity-50">
              {keyLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}
