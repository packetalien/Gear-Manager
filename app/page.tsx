import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen tactical-hud p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">
          Gear-Manager
        </h1>
        <p className="text-gray-300 mb-8">
          A modern browser-first GURPS TTRPG Assistant with Tarkov-style volumetric grid inventory management.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/inventory"
            className="tactical-card p-6 hover:bg-gray-700/50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Inventory</h2>
            <p className="text-gray-400 text-sm">
              Manage your gear with volumetric grid inventory
            </p>
          </Link>
          
          <Link
            href="/crafting"
            className="tactical-card p-6 hover:bg-gray-700/50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-2">Crafting</h2>
            <p className="text-gray-400 text-sm">
              Create and modify items
            </p>
          </Link>
          
          <Link
            href="/gm-tools"
            className="tactical-card p-6 hover:bg-gray-700/50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-2">GM Tools</h2>
            <p className="text-gray-400 text-sm">
              Game master utilities
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
