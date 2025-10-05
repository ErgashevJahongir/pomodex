export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Admin Dashboard
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to the admin panel. Here you can manage users, settings, and
          system configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Users Management */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Users Management
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage user accounts, permissions, and access levels.
          </p>
        </div>

        {/* System Settings */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Settings
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences.
          </p>
        </div>

        {/* Analytics */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Analytics
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View usage statistics and performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
