/**
 * Zustand Store for Inventory State Management
 * Real-time state for GURPS inventory with encumbrance calculations
 */

import { create } from "zustand";
import type { GURPSCharacter, GURPSItem, InventoryContainer, HitLocation } from "@/types/gurps";
import { encumbranceLevel } from "@/lib/gurps/encumbrance";

interface InventoryState {
  character: GURPSCharacter | null;
  selectedItem: GURPSItem | null;
  selectedContainer: InventoryContainer | null;
  selectedHitLocation: HitLocation | null;
  draggingItem: GURPSItem | null;
  
  // Actions
  setCharacter: (character: GURPSCharacter) => void;
  setSelectedItem: (item: GURPSItem | null) => void;
  setSelectedContainer: (container: InventoryContainer | null) => void;
  setSelectedHitLocation: (location: HitLocation | null) => void;
  setDraggingItem: (item: GURPSItem | null) => void;
  
  // Inventory operations
  moveItem: (itemId: string, containerId: string, gridX: number, gridY: number, rotation?: number) => void;
  rotateItem: (itemId: string, rotation: number) => void;
  equipItem: (itemId: string, location: HitLocation) => void;
  unequipItem: (location: HitLocation) => void;
  addItemToHotbar: (itemId: string, slot: number) => void;
  removeItemFromHotbar: (slot: number) => void;
  
  // Computed values
  getTotalWeight: () => number;
  getEncumbrance: () => ReturnType<typeof encumbranceLevel> | null;
  getEffectiveMove: () => number;
  getEffectiveDodge: () => number;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  character: null,
  selectedItem: null,
  selectedContainer: null,
  selectedHitLocation: null,
  draggingItem: null,
  
  setCharacter: (character) => set({ character }),
  
  setSelectedItem: (item) => set({ selectedItem: item }),
  
  setSelectedContainer: (container) => set({ selectedContainer: container }),
  
  setSelectedHitLocation: (location) => set({ selectedHitLocation: location }),
  
  setDraggingItem: (item) => set({ draggingItem: item }),
  
  moveItem: (itemId, containerId, gridX, gridY, rotation = 0) => {
    const state = get();
    if (!state.character) return;
    
    const updatedContainers = state.character.containers.map((container) => {
      if (container.id === containerId) {
        const updatedItems = container.items.map((item) =>
          item.id === itemId
            ? { ...item, gridX, gridY, rotation, containerId }
            : item
        );
        return { ...container, items: updatedItems };
      }
      // Remove from other containers
      return {
        ...container,
        items: container.items.filter((item) => item.id !== itemId),
      };
    });
    
    set({
      character: {
        ...state.character,
        containers: updatedContainers,
      },
    });
  },
  
  rotateItem: (itemId, rotation) => {
    const state = get();
    if (!state.character) return;
    
    const updatedContainers = state.character.containers.map((container) => ({
      ...container,
      items: container.items.map((item) =>
        item.id === itemId ? { ...item, rotation } : item
      ),
    }));
    
    set({
      character: {
        ...state.character,
        containers: updatedContainers,
      },
    });
  },
  
  equipItem: (itemId, location) => {
    const state = get();
    if (!state.character) return;
    
    const updatedEquipped = new Map(state.character.equippedItems);
    updatedEquipped.set(location, state.character.containers
      .flatMap((c) => c.items)
      .find((item) => item.id === itemId)!);
    
    set({
      character: {
        ...state.character,
        equippedItems: updatedEquipped,
      },
    });
  },
  
  unequipItem: (location) => {
    const state = get();
    if (!state.character) return;
    
    const updatedEquipped = new Map(state.character.equippedItems);
    updatedEquipped.delete(location);
    
    set({
      character: {
        ...state.character,
        equippedItems: updatedEquipped,
      },
    });
  },
  
  addItemToHotbar: (itemId, slot) => {
    const state = get();
    if (!state.character) return;
    
    const updatedContainers = state.character.containers.map((container) => ({
      ...container,
      items: container.items.map((item) =>
        item.id === itemId ? { ...item, hotbarSlot: slot } : item
      ),
    }));
    
    set({
      character: {
        ...state.character,
        containers: updatedContainers,
      },
    });
  },
  
  removeItemFromHotbar: (slot) => {
    const state = get();
    if (!state.character) return;
    
    const updatedContainers = state.character.containers.map((container) => ({
      ...container,
      items: container.items.map((item) =>
        item.hotbarSlot === slot ? { ...item, hotbarSlot: undefined } : item
      ),
    }));
    
    set({
      character: {
        ...state.character,
        containers: updatedContainers,
      },
    });
  },
  
  getTotalWeight: () => {
    const state = get();
    if (!state.character) return 0;
    
    return state.character.containers.reduce((total, container) => {
      return total + container.items.reduce((sum, item) => {
        const itemWeight = item.itemDefinition?.weight ?? 0;
        return sum + itemWeight * item.quantity;
      }, 0);
    }, 0);
  },
  
  getEncumbrance: () => {
    const state = get();
    if (!state.character) return null;
    
    const totalWeight = get().getTotalWeight();
    return encumbranceLevel(totalWeight, state.character.strength);
  },
  
  getEffectiveMove: () => {
    const state = get();
    if (!state.character) return 0;
    
    const encumbrance = get().getEncumbrance();
    if (!encumbrance) return state.character.move;
    
    return Math.max(1, state.character.move + encumbrance.moveModifier);
  },
  
  getEffectiveDodge: () => {
    const state = get();
    if (!state.character) return 0;
    
    const encumbrance = get().getEncumbrance();
    if (!encumbrance) return state.character.dodge;
    
    return Math.max(1, state.character.dodge + encumbrance.dodgeModifier);
  },
}));
