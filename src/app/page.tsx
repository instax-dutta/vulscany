/**
 * Aeglyn App Root - Redirect Handler
 * 
 * This is the application root. Since we have a dedicated landing page at example.com,
 * this route redirects users appropriately:
 * - Authenticated users → /dashboard
 * - Unauthenticated users → https://example.com (landing page)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated by looking for session cookie
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user) {
          // User is authenticated, go to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated, redirect to landing page
          window.location.href = 'https://example.com';
        }
      } catch (error) {
        // On error, redirect to landing page
        window.location.href = 'https://example.com';
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while redirecting
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      color: '#00d4ff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0, 212, 255, 0.3)',
          borderTop: '3px solid #00d4ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          Redirecting...
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
