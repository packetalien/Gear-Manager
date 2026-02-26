/**
 * Sample Character Data - ST 12 Drow Operator
 * Pre-populated with tactical vest and items for testing
 */

import type { GURPSCharacter, GURPSItem, InventoryContainer, GURPSItemDefinition } from "@/types/gurps";
import { getSampleItem } from "@/lib/gurps";
import { basicLift } from "@/lib/gurps/encumbrance";

export function createSampleCharacter(): GURPSCharacter {
  const character: GURPSCharacter = {
    id: "char-drow-operator",
    userId: "user-1",
    name: "Drow Operator",
    strength: 12,
    dexterity: 14,
    intelligence: 13,
    health: 12,
    basicLift: basicLift(12),
    move: 12, // Base Move = HT
    dodge: Math.floor((14 + 12) / 4) + 3, // (DX + HT) / 4 + 3
    containers: [],
    equippedItems: new Map(),
    loadouts: [],
  };

  // Tactical Vest (8×6 grid)
  const tacticalVest: InventoryContainer = {
    id: "container-tactical-vest",
    characterId: character.id,
    name: "Tactical Vest",
    gridWidth: 8,
    gridHeight: 6,
    containerType: "person",
    items: [],
    maxWeight: 20,
  };

  // Sample items
  const items: GURPSItem[] = [
    {
      id: "item-mag-1",
      itemDefinitionId: "magazine-30",
      itemDefinition: getSampleItem("magazine-30"),
      characterId: character.id,
      quantity: 1,
      gridX: 0,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-mag-2",
      itemDefinitionId: "magazine-30",
      itemDefinition: getSampleItem("magazine-30"),
      characterId: character.id,
      quantity: 1,
      gridX: 1,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-mag-3",
      itemDefinitionId: "magazine-30",
      itemDefinition: getSampleItem("magazine-30"),
      characterId: character.id,
      quantity: 1,
      gridX: 2,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-medkit",
      itemDefinitionId: "medkit",
      itemDefinition: getSampleItem("medkit"),
      characterId: character.id,
      quantity: 1,
      gridX: 0,
      gridY: 1,
      rotation: 0,
    },
    {
      id: "item-rifle",
      itemDefinitionId: "rifle-m4",
      itemDefinition: getSampleItem("rifle-m4"),
      characterId: character.id,
      quantity: 1,
      gridX: 2,
      gridY: 2,
      rotation: 0,
    },
    {
      id: "item-mag-4",
      itemDefinitionId: "magazine-30",
      itemDefinition: getSampleItem("magazine-30"),
      characterId: character.id,
      quantity: 1,
      gridX: 5,
      gridY: 0,
      rotation: 0,
    },
  ];

  tacticalVest.items = items;
  character.containers = [tacticalVest];

  return character;
}
