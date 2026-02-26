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

  // Sample items - Drow Operator loadout
  const items: GURPSItem[] = [
    {
      id: "item-hand-crossbow",
      itemDefinitionId: "hand-crossbow",
      itemDefinition: getSampleItem("hand-crossbow"),
      characterId: character.id,
      quantity: 1,
      gridX: 0,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-bolt-1",
      itemDefinitionId: "crossbow-bolt",
      itemDefinition: getSampleItem("crossbow-bolt"),
      characterId: character.id,
      quantity: 10,
      gridX: 2,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-bolt-2",
      itemDefinitionId: "crossbow-bolt",
      itemDefinition: getSampleItem("crossbow-bolt"),
      characterId: character.id,
      quantity: 10,
      gridX: 3,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-piwafwi",
      itemDefinitionId: "piwafwi-cloak",
      itemDefinition: getSampleItem("piwafwi-cloak"),
      characterId: character.id,
      quantity: 1,
      gridX: 5,
      gridY: 0,
      rotation: 0,
    },
    {
      id: "item-rapier",
      itemDefinitionId: "drow-rapier",
      itemDefinition: getSampleItem("drow-rapier"),
      characterId: character.id,
      quantity: 1,
      gridX: 0,
      gridY: 2,
      rotation: 0,
    },
    {
      id: "item-medkit",
      itemDefinitionId: "medkit",
      itemDefinition: getSampleItem("medkit"),
      characterId: character.id,
      quantity: 1,
      gridX: 3,
      gridY: 2,
      rotation: 0,
    },
  ];

  tacticalVest.items = items;
  character.containers = [tacticalVest];

  return character;
}
