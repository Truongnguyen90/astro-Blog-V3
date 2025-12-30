/**
 * Authentication Utilities
 *
 * Helper functions for authentication and session management.
 *
 * @module utils/admin/auth
 */

import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Check if user is currently authenticated
 *
 * @returns Promise resolving to session or null
 *
 * @example
 * ```typescript
 * const session = await checkAuth();
 * if (session) {
 *   console.log('User is authenticated:', session.user.email);
 * }
 * ```
 */
export async function checkAuth(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Auth check error:', error);
    return null;
  }

  return session;
}

/**
 * Get current authenticated user
 *
 * @returns Promise resolving to user or null
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('Current user:', user.email);
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await checkAuth();
  return session?.user ?? null;
}

/**
 * Sign out the current user
 *
 * @returns Promise that resolves when sign out is complete
 *
 * @example
 * ```typescript
 * await signOut();
 * window.location.href = '/admin/login';
 * ```
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Sign in with OAuth provider
 *
 * @param provider - OAuth provider (github, google, etc.)
 * @param redirectTo - URL to redirect to after authentication
 *
 * @example
 * ```typescript
 * await signInWithProvider('github', '/admin');
 * ```
 */
export async function signInWithProvider(
  provider: 'github' | 'google',
  redirectTo?: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${window.location.origin}/admin`,
    },
  });

  if (error) {
    console.error(`${provider} sign in error:`, error);
    throw error;
  }
}

/**
 * Sign in with magic link (OTP)
 *
 * @param email - User's email address
 * @param redirectTo - URL to redirect to after authentication
 *
 * @example
 * ```typescript
 * await signInWithMagicLink('user@example.com', '/admin');
 * ```
 */
export async function signInWithMagicLink(
  email: string,
  redirectTo?: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/admin`,
    },
  });

  if (error) {
    console.error('Magic link error:', error);
    throw error;
  }
}

/**
 * Refresh the current session
 *
 * @returns Promise resolving to refreshed session or null
 *
 * @example
 * ```typescript
 * const session = await refreshSession();
 * if (session) {
 *   console.log('Session refreshed');
 * }
 * ```
 */
export async function refreshSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Session refresh error:', error);
    return null;
  }

  return session;
}

/**
 * Check if user has specific role or permission
 *
 * @param user - User object
 * @param role - Role to check for
 * @returns Whether user has the role
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (hasRole(user, 'admin')) {
 *   console.log('User is admin');
 * }
 * ```
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;

  // Check user metadata for roles
  const roles = user.user_metadata?.roles || [];
  return roles.includes(role);
}

/**
 * Format user display name
 *
 * @param user - User object
 * @returns Formatted display name
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * const name = getUserDisplayName(user);
 * // Returns: "John Doe" or "john@example.com"
 * ```
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';

  // Try full name from metadata
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }

  // Try name from metadata
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }

  // Fallback to email
  return user.email || 'User';
}

/**
 * Get user avatar URL
 *
 * @param user - User object
 * @returns Avatar URL or null
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * const avatarUrl = getUserAvatar(user);
 * ```
 */
export function getUserAvatar(user: User | null): string | null {
  if (!user) return null;

  // Try avatar URL from metadata
  if (user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }

  // Try picture from metadata
  if (user.user_metadata?.picture) {
    return user.user_metadata.picture;
  }

  return null;
}
