export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen">
        {/* Admin Header */}
        <header className="border-b bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Admin Dashboard
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </>
  );
}
