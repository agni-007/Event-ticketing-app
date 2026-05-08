export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex">
      {/* Sidebar stub */}
      <div className="w-64 glass-panel rounded-2xl p-6 mr-8 min-h-[70vh]">
        <h2 className="text-lg font-bold mb-6 text-white border-b border-borderDark pb-4">Admin Menu</h2>
        <nav className="space-y-2">
          <button className="w-full text-left px-4 py-2 rounded-lg bg-white/10 text-white font-medium">Events</button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-textSecondary hover:bg-white/5 hover:text-white transition-colors">Registrations</button>
          <button className="w-full text-left px-4 py-2 rounded-lg text-textSecondary hover:bg-white/5 hover:text-white transition-colors">Verify Entry</button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-panel rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-white">Events Management</h1>
        <p className="text-textSecondary">Content will go here.</p>
      </div>
    </div>
  );
}
