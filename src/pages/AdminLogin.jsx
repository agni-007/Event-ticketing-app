export default function AdminLogin() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Username</label>
            <input type="text" className="w-full bg-surface border border-borderDark rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Password</label>
            <input type="password" className="w-full bg-surface border border-borderDark rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-accent transition-colors" />
          </div>
          <button type="button" className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors mt-4">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
