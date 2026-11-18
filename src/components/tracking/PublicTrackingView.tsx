import React from 'react';
import { useParams } from 'react-router-dom';
import { LoggiPortalView } from '../portals/LoggiPortalView';
import { JadlogPortalView } from '../portals/JadlogPortalView';

export const PublicTrackingView: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const clean = (code || '').trim().toUpperCase().replace(/\s+/g, '');

  // Se o código for numérico (padrão Jadlog como 1008...) ou começar com JAD: renderiza o portal oficial Jadlog
  if (clean.startsWith('1008') || clean.startsWith('JAD') || /^\d{9,}$/.test(clean)) {
    return <JadlogPortalView />;
  }

  // Padrão Loggi Logística (LG...BR ou código geral padrão)
  return <LoggiPortalView />;
};
