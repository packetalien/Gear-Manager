import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen tactical-hud p-8 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-white mb-4 neon-accent">
          Gear-Manager
        </h1>
        <p className="text-gray-300 mb-12 text-lg">
          Premium GURPS TTRPG Assistant with Tarkov-style volumetric grid inventory management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/inventory"
            className="glass-panel p-8 hover:neon-border transition-all group"
          >
            <h2 className="text-2xl font-semibold text-white mb-3 group-hover:neon-accent transition-colors">
              Inventory
            </h2>
            <p className="text-gray-400">
              Tactical gear management with real-time encumbrance
            </p>
          </Link>
          
          <Link
            href="/crafting"
            className="glass-panel p-8 hover:neon-border transition-all group opacity-50"
          >
            <h2 className="text-2xl font-semibold text-white mb-3 group-hover:neon-accent transition-colors">
              Crafting
            </h2>
            <p className="text-gray-400">
              Coming soon
            </p>
          </Link>
          
          <Link
            href="/gm-tools"
            className="glass-panel p-8 hover:neon-border transition-all group opacity-50"
          >
            <h2 className="text-2xl font-semibold text-white mb-3 group-hover:neon-accent transition-colors">
              GM Tools
            </h2>
            <p className="text-gray-400">
              Coming soon
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
