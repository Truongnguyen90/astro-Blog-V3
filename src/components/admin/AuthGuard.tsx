/**
 * Authentication Guard Component
 *
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to login page.
 *
 * @module components/admin/AuthGuard
 */

import { useAuth } from './AuthProvider';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;
  /**
   * Redirect URL for unauthenticated users
   * @default '/admin/login'
   */
  redirectTo?: string;
}

/**
 * Authentication Guard
 *
 * Wraps protected content and ensures user is authenticated.
 * Shows loading state while checking authentication.
 * Redirects to login if not authenticated.
 *
 * @example
 * ```tsx
 * <AuthGuard>
 *   <AdminDashboard />
 * </AuthGuard>
 * ```
 *
 * @example With custom loading
 * ```tsx
 * <AuthGuard loadingComponent={<Spinner />}>
 *   <AdminDashboard />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  loadingComponent,
  redirectTo = '/admin/login',
}: AuthGuardProps) {
  const { session, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Redirect if not authenticated
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
