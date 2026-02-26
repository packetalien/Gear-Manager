/**
 * Gear-Manager - Core TypeScript Types
 */

// GURPS Attributes
export interface GURPSAttributes {
  ST: number; // Strength
  DX: number; // Dexterity
  IQ: number; // Intelligence
  HT: number; // Health
}

// Encumbrance Levels (GURPS 4e)
export type EncumbranceLevel = "None" | "Light" | "Medium" | "Heavy" | "Extra-Heavy";

export interface EncumbranceInfo {
  level: EncumbranceLevel;
  multiplier: number; // Weight multiplier for this level
  moveModifier: number; // Movement penalty
  dodgeModifier: number; // Dodge penalty
}

// Hit Locations (GURPS 4e)
export type HitLocation =
  | "skull"
  | "eyes"
  | "face"
  | "neck"
  | "torso"
  | "vitals"
  | "groin"
  | "arms"
  | "hands"
  | "legs"
  | "feet";

// Item Definition (catalog entry)
export interface ItemDefinition {
  id: string;
  name: string;
  description?: string;
  weight: number; // lbs
  cost?: number;
  tl?: number; // Tech Level
  lc?: number; // Legality Class
  quality?: string;
  category: string;
  
  // Grid dimensions
  gridWidth: number;
  gridHeight: number;
  
  // Container properties
  isContainer: boolean;
  containerWidth?: number;
  containerHeight?: number;
  containerMaxWeight?: number;
  
  // Armor properties
  isArmor: boolean;
  dr?: number; // Damage Resistance
  locations?: HitLocation[];
}

// Item Instance (actual item)
export interface Item {
  id: string;
  itemDefinitionId: string;
  itemDefinition?: ItemDefinition;
  characterId?: string;
  containerId?: string;
  quantity: number;
  
  // Grid position
  gridX?: number;
  gridY?: number;
  rotation: number; // 0, 90, 180, 270
  
  notes?: string;
  
  // Nested items (if container)
  containedItems?: Item[];
}

// Inventory Slot (grid container)
export interface InventorySlot {
  id: string;
  characterId: string;
  name: string;
  gridWidth: number;
  gridHeight: number;
  slotType: string;
  items: Item[];
}

// Character
export interface Character {
  id: string;
  userId: string;
  name: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  health: number;
  inventorySlots: InventorySlot[];
  equippedItems: EquippedItem[];
}

// Equipped Item
export interface EquippedItem {
  id: string;
  characterId: string;
  itemId: string;
  item?: Item;
  location: HitLocation | string;
}

// Grid Position
export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// Collision Check Result
export interface CollisionResult {
  canPlace: boolean;
  conflicts: GridPosition[];
}
