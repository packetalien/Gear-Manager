"use client";

/**
 * PaperDoll - 3D Interactive Mannequin with GURPS Hit Locations
 * Premium video-game quality using React Three Fiber
 * Hybrid: 3D immersion + character-sheet clarity
 */

import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment } from "@react-three/drei";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import type { HitLocation } from "@/types/gurps";
import { X } from "lucide-react";
import * as THREE from "three";

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

// Hit location positions in 3D space (normalized coordinates for overlay)
const HIT_LOCATION_POSITIONS: Record<HitLocation, { x: number; y: number; z: number }> = {
  skull: { x: 0, y: 1.6, z: 0 },
  eyes: { x: 0, y: 1.65, z: 0.3 },
  face: { x: 0, y: 1.5, z: 0.2 },
  neck: { x: 0, y: 1.3, z: 0 },
  torso: { x: 0, y: 0.8, z: 0 },
  vitals: { x: 0, y: 0.6, z: 0.15 },
  groin: { x: 0, y: 0.2, z: 0 },
  arms: { x: 0, y: 0.8, z: 0 },
  hands: { x: 0, y: 0.3, z: 0 },
  legs: { x: 0, y: -0.2, z: 0 },
  feet: { x: 0, y: -0.8, z: 0 },
};

// Load the mannequin model
function MannequinModel({ selectedLocation }: { selectedLocation: HitLocation | null }) {
  try {
    const { scene } = useGLTF("/models/mannequin.glb");
    const meshRef = useRef<THREE.Group>(null);

    // Clone the scene to avoid mutations
    const clonedScene = useMemo(() => {
      const cloned = scene.clone();
      // Center and scale the model appropriately
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return cloned;
    }, [scene]);

    // Highlight effect when location is selected
    useFrame(() => {
      if (meshRef.current && selectedLocation) {
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // Subtle color tint for selected state
            child.material.emissive = new THREE.Color(0x00ff9f).multiplyScalar(0.15);
          }
        });
      } else {
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive = new THREE.Color(0x000000);
          }
        });
      }
    });

    return (
      <primitive
        ref={meshRef}
        object={clonedScene}
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
      />
    );
  } catch (error) {
    // Fallback if model doesn't exist
    return (
      <mesh>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    );
  }
}

// Hit location overlay component using Html from drei
function HitLocationOverlay({
  location,
  position,
  isSelected,
  isEquipped,
  onClick,
}: {
  location: HitLocation;
  position: { x: number; y: number; z: number };
  isSelected: boolean;
  isEquipped: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isActive = isSelected || isEquipped || hovered;

  return (
    <Html
      position={[position.x, position.y, position.z]}
      center
      style={{
        pointerEvents: "auto",
        userSelect: "none",
      }}
      transform
      occlude
    >
      <div
        className={`cursor-pointer transition-all duration-200 ${
          isActive ? "scale-110" : "scale-100"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <div
          className={`rounded-full border-2 transition-all duration-200 ${
            isActive
              ? "border-[#00ff9f] bg-[#00ff9f]/20 shadow-[0_0_12px_rgba(0,255,159,0.6)] animate-pulse-glow"
              : "border-gray-600/50 bg-gray-900/20"
          }`}
          style={{
            width: isActive ? "32px" : "24px",
            height: isActive ? "32px" : "24px",
          }}
        />
        {isActive && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-[#00ff9f] drop-shadow-[0_0_4px_rgba(0,255,159,0.8)]">
            {HIT_LOCATION_LABELS[location]}
          </div>
        )}
      </div>
    </Html>
  );
}

// Auto-rotate when idle
function AutoRotate({ enabled }: { enabled: boolean }) {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (enabled && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.5;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  return null;
}

// Main 3D scene component
function MannequinScene({
  selectedLocation,
  equippedItems,
  onLocationClick,
}: {
  selectedLocation: HitLocation | null;
  equippedItems: Map<HitLocation, any>;
  onLocationClick: (loc: HitLocation) => void;
}) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const [isIdle, setIsIdle] = useState(true);
  let idleTimer: NodeJS.Timeout;

  const handleControlsChange = () => {
    setIsIdle(false);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => setIsIdle(true), 3000);
  };

  // Focus camera on hit location when selected
  useFrame(() => {
    if (selectedLocation && controlsRef.current) {
      const pos = HIT_LOCATION_POSITIONS[selectedLocation];
      // Smoothly animate camera to focus on the selected location
      const targetX = pos.x;
      const targetY = pos.y + 0.2; // Slight offset for better view
      const targetZ = pos.z + 1.5;

      camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
      controlsRef.current.target.lerp(new THREE.Vector3(pos.x, pos.y, pos.z), 0.05);
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, 10, -10]} intensity={0.4} />

      {/* Environment */}
      <Environment preset="city" />

      {/* Mannequin Model */}
      <Suspense fallback={null}>
        <MannequinModel selectedLocation={selectedLocation} />
      </Suspense>

      {/* Hit Location Overlays */}
      {(Object.keys(HIT_LOCATION_POSITIONS) as HitLocation[]).map((location) => (
        <HitLocationOverlay
          key={location}
          location={location}
          position={HIT_LOCATION_POSITIONS[location]}
          isSelected={selectedLocation === location}
          isEquipped={equippedItems.has(location)}
          onClick={() => onLocationClick(location)}
        />
      ))}

      {/* Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        enableZoom={true}
        enableRotate={true}
        onChange={handleControlsChange}
        target={[0, 0.8, 0]} // Focus on torso area
      />

      {/* Auto-rotate when idle */}
      <AutoRotate enabled={isIdle} />
    </>
  );
}

// Loading fallback
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <div className="w-8 h-8 border-2 border-[#00ff9f]/30 border-t-[#00ff9f] rounded-full animate-spin" />
      <div className="text-xs text-gray-400">Loading mannequin...</div>
    </div>
  );
}

// Error fallback if model not found
function ModelError() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-4">
      <div className="text-gray-400 text-sm">Model not found</div>
      <div className="text-xs text-gray-500">
        Place <code className="text-[#00ff9f]">mannequin.glb</code> in{" "}
        <code className="text-[#00ff9f]">public/models/</code>
      </div>
    </div>
  );
}

export function PaperDoll() {
  const character = useInventoryStore((state) => state.character);
  const selectedHitLocation = useInventoryStore((state) => state.selectedHitLocation);
  const setSelectedHitLocation = useInventoryStore((state) => state.setSelectedHitLocation);
  const equippedItems = character?.equippedItems ?? new Map();

  const handleLocationClick = (location: HitLocation) => {
    setSelectedHitLocation(location === selectedHitLocation ? null : location);
  };

  const handleClearFilter = () => {
    setSelectedHitLocation(null);
  };

  return (
    <div className="glass-panel p-4 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Paper Doll
        </h3>
        {selectedHitLocation && (
          <button
            onClick={handleClearFilter}
            className="text-xs text-gray-400 hover:text-[#00ff9f] transition-colors flex items-center gap-1"
            title="Clear filter"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* 3D Mannequin Canvas */}
      <div className="flex-1 min-h-[400px] relative rounded-sm overflow-hidden bg-transparent">
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas
            camera={{ position: [0, 1, 3], fov: 50 }}
            gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
            style={{ background: "transparent" }}
            dpr={[1, 2]} // Adaptive pixel ratio
          >
            <MannequinScene
              selectedLocation={selectedHitLocation}
              equippedItems={equippedItems}
              onLocationClick={handleLocationClick}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Equipped Items List (Character Sheet Style) */}
      <div className="mt-4 space-y-2 border-t border-gray-800 pt-4">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-semibold">
          Equipped
        </div>
        {equippedItems.size === 0 ? (
          <div className="text-xs text-gray-500 italic">No items equipped</div>
        ) : (
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {Array.from(equippedItems.entries()).map(([location, item]) => (
              <div
                key={location}
                className="glass-panel p-2 rounded-sm text-xs hover:neon-border transition-all cursor-pointer group"
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">
                      {item.itemDefinition?.name}
                    </div>
                    <div className="text-gray-400 text-[10px] mt-0.5">
                      {HIT_LOCATION_LABELS[location as HitLocation]}
                    </div>
                  </div>
                  <div className="ml-2 text-right">
                    {item.itemDefinition?.weight && (
                      <div className="text-[#00ff9f] font-mono text-[10px]">
                        {item.itemDefinition.weight} lbs
                      </div>
                    )}
                    {item.itemDefinition?.dr && (
                      <div className="text-gray-400 text-[10px]">DR {item.itemDefinition.dr}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Note: Place mannequin.glb in public/models/ directory
// The model will be loaded on first render via useGLTF hook
