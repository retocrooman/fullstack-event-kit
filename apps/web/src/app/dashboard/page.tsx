'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

function DashboardPage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard" className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span data-testid="welcome-message" className="text-gray-700 font-medium text-sm sm:text-base text-center sm:text-left break-all max-w-xs sm:max-w-none">
                Welcome, <span data-testid="user-email">{user?.name || user?.email}</span>
              </span>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/api/auth/logout"
                data-testid="logout-button"
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="px-4 py-6 sm:px-6 relative z-10">
          <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-blue-200 rounded-2xl min-h-96 flex items-center justify-center shadow-xl p-4 sm:p-8">
            <div className="text-center w-full max-w-2xl">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Authentication Successful!
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8">
                You can add your application content here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/profile"
                  data-testid="profile-link"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Manage Profile
                </a>
              </div>
              <div data-testid="user-info" className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/30 w-full">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  User Information
                </h3>
                <div className="text-left space-y-3 max-w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="font-semibold text-gray-700 text-sm sm:text-base min-w-0 sm:min-w-16 flex-shrink-0">ID:</span>
                    <span className="text-gray-900 font-mono text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded break-all overflow-hidden">{user?.sub}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="font-semibold text-gray-700 text-sm sm:text-base min-w-0 sm:min-w-16 flex-shrink-0">Email:</span>
                    <span className="text-gray-900 text-sm sm:text-base break-all overflow-hidden">{user?.email}</span>
                  </div>
                  {user?.name && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <span className="font-semibold text-gray-700 text-sm sm:text-base min-w-0 sm:min-w-16 flex-shrink-0">Name:</span>
                      <span className="text-gray-900 text-sm sm:text-base break-all overflow-hidden">{user.name}</span>
                    </div>
                  )}
                  {user?.picture && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <span className="font-semibold text-gray-700 text-sm sm:text-base min-w-0 sm:min-w-16 flex-shrink-0">Avatar:</span>
                      <img src={user.picture} alt="User Avatar" className="w-12 h-12 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;