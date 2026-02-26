"use client";

/**
 * ItemInspector - Hybrid right panel
 * Top half: Detailed GURPS stat card for selected item
 * Bottom half: Character-sheet style "All Gear List" table
 */

import { useMemo } from "react";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import type { HitLocation, GURPSItem } from "@/types/gurps";
import { Shield, DollarSign, Weight, Zap, ArrowUpDown } from "lucide-react";

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
  const containers = character?.containers ?? [];
  const equippedItems = character?.equippedItems ?? new Map();

  // Build comprehensive gear list (all items from all containers + equipped)
  const allGear = useMemo(() => {
    const gear: Array<{
      item: GURPSItem;
      location: string;
      weight: number;
      value: number;
      containerId?: string;
      hitLocation?: HitLocation;
    }> = [];

    // Items in containers
    containers.forEach((container) => {
      container.items.forEach((item) => {
        if (item.itemDefinition) {
          gear.push({
            item,
            location: container.name,
            weight: (item.itemDefinition.weight ?? 0) * item.quantity,
            value: (item.itemDefinition.cost ?? 0) * item.quantity,
            containerId: container.id,
          });
        }
      });
    });

    // Equipped items
    equippedItems.forEach((item, hitLocation) => {
      if (item.itemDefinition) {
        const locationLabel = HIT_LOCATION_LABELS[hitLocation as HitLocation] || hitLocation;
        gear.push({
          item,
          location: locationLabel,
          weight: (item.itemDefinition.weight ?? 0) * item.quantity,
          value: (item.itemDefinition.cost ?? 0) * item.quantity,
          hitLocation: hitLocation as HitLocation,
        });
      }
    });

    return gear.sort((a, b) => a.item.itemDefinition?.name.localeCompare(b.item.itemDefinition?.name ?? "") ?? 0);
  }, [containers, equippedItems]);

  const totalWeight = useMemo(() => allGear.reduce((sum, g) => sum + g.weight, 0), [allGear]);
  const totalValue = useMemo(() => allGear.reduce((sum, g) => sum + g.value, 0), [allGear]);

  return (
    <div className="glass-panel p-6 rounded-lg h-full flex flex-col overflow-hidden">
      {/* Top Half: Selected Item Stats Card */}
      <div className="flex-shrink-0 mb-6">
        {!selectedItem || !selectedItem.itemDefinition ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-sm">Select an item to view details</div>
          </div>
        ) : (
          <ItemStatsCard item={selectedItem} equipItem={equipItem} />
        )}
      </div>

      {/* Bottom Half: All Gear List (Character Sheet Style) */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            All Gear
          </h3>
          <div className="text-xs text-gray-400">
            {allGear.length} items
          </div>
        </div>

        {/* Scrollable table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#0a0f14]/95 backdrop-blur-sm">
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">
                  Item
                </th>
                <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">
                  Location
                </th>
                <th className="text-right py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">
                  Weight
                </th>
                <th className="text-right py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {allGear.map((gear, idx) => (
                <tr
                  key={`${gear.item.id}-${idx}`}
                  className={`border-b border-gray-900/50 hover:bg-gray-900/30 transition-colors ${
                    selectedItem?.id === gear.item.id ? "bg-[#00ff9f]/10" : ""
                  }`}
                >
                  <td className="py-2 px-2">
                    <div className="font-medium text-white">
                      {gear.item.itemDefinition?.name}
                    </div>
                    {gear.item.quantity > 1 && (
                      <div className="text-[#00ff9f] text-[10px]">×{gear.item.quantity}</div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-gray-400">
                    {gear.location}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-300">
                    {gear.weight.toFixed(1)} lbs
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-300">
                    ${gear.value.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals footer */}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex justify-between text-xs">
            <div className="text-gray-400">Total Weight:</div>
            <div className="font-mono font-bold text-white">{totalWeight.toFixed(1)} lbs</div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <div className="text-gray-400">Total Value:</div>
            <div className="font-mono font-bold text-[#00ff9f]">${totalValue.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemStatsCard({
  item,
  equipItem,
}: {
  item: GURPSItem;
  equipItem: (itemId: string, location: HitLocation) => void;
}) {
  const itemDef = item.itemDefinition;
  if (!itemDef) return null;

  const canEquip = itemDef.isArmor && itemDef.locations && itemDef.locations.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1">{itemDef.name}</h2>
        {itemDef.description && (
          <p className="text-sm text-gray-400">{itemDef.description}</p>
        )}
      </div>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {itemDef.weight !== undefined && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Weight className="w-3 h-3" />
              Weight
            </div>
            <div className="text-white font-mono font-bold">
              {itemDef.weight} lbs
            </div>
          </div>
        )}

        {itemDef.cost !== undefined && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <DollarSign className="w-3 h-3" />
              Cost
            </div>
            <div className="text-white font-mono font-bold">
              ${itemDef.cost}
            </div>
          </div>
        )}

        {itemDef.tl !== undefined && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Zap className="w-3 h-3" />
              TL
            </div>
            <div className="text-white font-mono font-bold">{itemDef.tl}</div>
          </div>
        )}

        {itemDef.lc !== undefined && (
          <div className="glass-panel p-3 rounded-sm">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Shield className="w-3 h-3" />
              LC
            </div>
            <div className="text-white font-mono font-bold">{itemDef.lc}</div>
          </div>
        )}
      </div>

      {/* Quality */}
      {itemDef.quality && (
        <div className="glass-panel p-3 rounded-sm">
          <div className="text-xs text-gray-400 mb-1">Quality</div>
          <div className="text-[#00ff9f] font-semibold">{itemDef.quality}</div>
        </div>
      )}

      {/* Armor Stats */}
      {itemDef.isArmor && itemDef.dr !== undefined && (
        <div className="glass-panel p-3 rounded-sm">
          <div className="text-xs text-gray-400 mb-1">Damage Resistance</div>
          <div className="text-white font-mono font-bold text-lg">DR {itemDef.dr}</div>
          {itemDef.locations && (
            <div className="text-xs text-gray-400 mt-1">
              Protects: {itemDef.locations.map((loc) => HIT_LOCATION_LABELS[loc]).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Weapon Stats */}
      {itemDef.damage && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Weapon Stats</div>
          <div className="glass-panel p-3 rounded-sm space-y-2">
            {itemDef.damage && (
              <div>
                <div className="text-xs text-gray-400">Damage</div>
                <div className="text-white font-mono">{itemDef.damage}</div>
              </div>
            )}
            {itemDef.reach && (
              <div>
                <div className="text-xs text-gray-400">Reach</div>
                <div className="text-white font-mono">{itemDef.reach}</div>
              </div>
            )}
            {itemDef.parry && (
              <div>
                <div className="text-xs text-gray-400">Parry</div>
                <div className="text-white font-mono">{itemDef.parry}</div>
              </div>
            )}
            {itemDef.bulk && (
              <div>
                <div className="text-xs text-gray-400">Bulk</div>
                <div className="text-white font-mono">{itemDef.bulk}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid Size */}
      <div className="glass-panel p-3 rounded-sm">
        <div className="text-xs text-gray-400 mb-1">Grid Size</div>
        <div className="text-white font-mono">
          {itemDef.gridWidth}×{itemDef.gridHeight}
        </div>
      </div>

      {/* Equip Buttons */}
      {canEquip && itemDef.locations && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 uppercase tracking-wider">Equip to Location</div>
          <div className="grid grid-cols-2 gap-2">
            {itemDef.locations.map((location) => (
              <button
                key={location}
                onClick={() => equipItem(item.id, location)}
                className="glass-panel p-2 rounded-sm text-xs text-white hover:neon-border transition-all text-left"
              >
                {HIT_LOCATION_LABELS[location]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {itemDef.notes && (
        <div className="glass-panel p-3 rounded-sm">
          <div className="text-xs text-gray-400 mb-1">Notes</div>
          <div className="text-sm text-gray-300">{itemDef.notes}</div>
        </div>
      )}
    </div>
  );
}
