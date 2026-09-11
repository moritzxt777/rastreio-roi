import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const RequireMerchant: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check both Supabase Session and Local Session for seamless access
    const checkAuth = async () => {
      const localSess = localStorage.getItem('rastreio_merchant_session');
      if (localSess) {
        try {
          const parsed = JSON.parse(localSess);
          if (parsed.authenticated) {
            setAuthenticated(true);
            setChecking(false);
            return;
          }
        } catch {}
      }

      if (isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setAuthenticated(true);
          setChecking(false);
          return;
        }
      }

      setAuthenticated(false);
      setChecking(false);
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (profile?.role === 'admin') {
            setIsAdmin(true);
            setChecking(false);
            return;
          }
        }
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // If Supabase not configured in local environment
      const rawSession = localStorage.getItem('rastreio_admin_session');
      if (rawSession) {
        try {
          const sess = JSON.parse(rawSession);
          if (sess.authenticated && sess.role === 'admin') {
            setIsAdmin(true);
            setChecking(false);
            return;
          }
        } catch {}
      }

      setIsAdmin(false);
      setChecking(false);
    };

    checkAdmin();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};
