import React from 'react';
import { useParams } from 'react-router-dom';
import { LoggiPortalView } from '../portals/LoggiPortalView';
import { JadlogPortalView } from '../portals/JadlogPortalView';
import { CorreiosPortalView } from '../portals/CorreiosPortalView';
import { CainiaoPortalView } from '../portals/CainiaoPortalView';
import { DhlPortalView } from '../portals/DhlPortalView';
import { TotalExpressPortalView } from '../portals/TotalExpressPortalView';

export const PublicTrackingView: React.FC = () => {
  const { code } = useParams<{ code?: string }>();
  const clean = (code || '').trim().toUpperCase().replace(/\s+/g, '');

  // 1. Cainiao Global (AliExpress / Shein / Importação)
  if (clean.startsWith('LP') || clean.startsWith('CN') || clean.includes('CAI')) {
    return <CainiaoPortalView />;
  }

  // 2. DHL Express Worldwide (Conhecimento aéreo de 10 dígitos ou prefixo DHL)
  if (/^\d{10}$/.test(clean) || clean.startsWith('DHL')) {
    return <DhlPortalView />;
  }

  // 3. JAD Logística (Jadlog - numérico 1008... ou JAD...)
  if (clean.startsWith('1008') || clean.startsWith('JAD') || /^\d{12,14}$/.test(clean)) {
    return <JadlogPortalView />;
  }

  // 4. Total Express (TEX... ou AWB)
  if (clean.startsWith('TEX') || clean.startsWith('TOTAL')) {
    return <TotalExpressPortalView />;
  }

  // 5. Correios Brasil (NL...BR, QC...BR, AA...BR)
  if ((clean.length === 13 && clean.endsWith('BR') && !clean.startsWith('LG')) || clean.startsWith('CORREIO')) {
    return <CorreiosPortalView />;
  }

  // 6. Loggi Logística (Padrão LG...BR ou padrão geral)
  return <LoggiPortalView />;
};
