import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

export const RequireMerchant: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data }) => {
        setAuthenticated(Boolean(data.session?.user));
        setChecking(false);
      });
    } else {
      // Fallback check
      const sess = localStorage.getItem('rastreio_merchant_session');
      setAuthenticated(Boolean(sess));
      setChecking(false);
    }
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
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!data.session?.user) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');
        setChecking(false);
      });
    } else {
      // Local fallback
      const rawSession = localStorage.getItem('rastreio_admin_session');
      try {
        const sess = JSON.parse(rawSession || '{}');
        setIsAdmin(Boolean(sess.authenticated && sess.role === 'admin'));
      } catch {
        setIsAdmin(false);
      }
      setChecking(false);
    }
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
