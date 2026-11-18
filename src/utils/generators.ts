import { CarrierType, TrackingEvent, TrackingStatus } from '../types';

export function generateTrackingCode(carrier: CarrierType): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  
  if (carrier === 'correios') {
    // Standard Correios: NM123456789BR
    const prefix = 'NL';
    let digits = '';
    for (let i = 0; i < 9; i++) {
      digits += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    return `${prefix}${digits}BR`;
  }
  
  if (carrier === 'loggi') {
    // Loggi format: LG1234567890BR
    let digits = '';
    for (let i = 0; i < 10; i++) {
      digits += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    return `LG${digits}BR`;
  }

  if (carrier === 'jadlog') {
    // Jadlog format: 10082349012398
    let digits = '1008';
    for (let i = 0; i < 10; i++) {
      digits += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    return digits;
  }

  if (carrier === 'total_express') {
    let digits = 'TEX';
    for (let i = 0; i < 9; i++) {
      digits += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    return digits;
  }

  if (carrier === 'cainiao') {
    let digits = '';
    for (let i = 0; i < 9; i++) {
      digits += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    return `LP${digits}BR`;
  }

  if (carrier === 'dhl') {
    let digits = '4';
    for (let i = 0; i < 9; i++) {
      digits += nums.charAt(Math.floor(Math.random() * nums.length));
    }
    return digits;
  }

  // Generic/Kangu
  let randStr = '';
  for (let i = 0; i < 12; i++) {
    randStr += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return `KG${randStr}`;
}

export function generateRealisticTimeline(
  carrier: CarrierType,
  originCity: string,
  originState: string,
  destCity: string,
  destState: string,
  currentStatus: TrackingStatus = 'in_transit'
): TrackingEvent[] {
  const now = new Date();
  
  const formatDate = (daysAgo: number, hoursOffset: number = 0) => {
    const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 + hoursOffset * 60 * 60 * 1000);
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (carrier === 'cainiao') {
    const cainiaoEvents: TrackingEvent[] = [
      {
        id: 'cai-1',
        status: 'posted',
        title: 'Recebido pelo operador logístico internacional',
        description: 'Pacote recebido no Centro de Triagem Internacional de Shenzhen (China).',
        location: 'Shenzhen - China',
        ...formatDate(6, 2)
      },
      {
        id: 'cai-2',
        status: 'in_transit',
        title: 'Partida em voo internacional para o país de destino',
        description: 'Voo comercial de carga decolou com destino ao Aeroporto Internacional de Curitiba/PR.',
        location: 'Aeroporto Internacional de Shenzhen',
        ...formatDate(4, 5)
      },
      {
        id: 'cai-3',
        status: 'in_transit',
        title: 'Chegada ao Brasil - Desembaraço aduaneiro concluído',
        description: 'Importação autorizada pelos órgãos aduaneiros (Receita Federal) sem pendências ou taxas.',
        location: 'Curitiba - PR',
        ...formatDate(2, 4)
      },
      {
        id: 'cai-4',
        status: 'out_for_delivery',
        title: 'Objeto saiu para entrega ao destinatário',
        description: 'O entregador local da malha parceira está a caminho do seu endereço.',
        location: `${destCity} - ${destState}`,
        ...formatDate(0, 2)
      },
      {
        id: 'cai-5',
        status: 'delivered',
        title: 'Pacote internacional entregue com sucesso',
        description: 'Entrega finalizada com sucesso no endereço cadastrado.',
        location: `${destCity} - ${destState}`,
        ...formatDate(0, 5)
      }
    ];

    if (currentStatus === 'posted') return cainiaoEvents.slice(0, 1);
    if (currentStatus === 'in_transit') return cainiaoEvents.slice(0, 3);
    if (currentStatus === 'out_for_delivery') return cainiaoEvents.slice(0, 4);
    if (currentStatus === 'delivered') return cainiaoEvents.slice(0, 5);
    return cainiaoEvents.slice(0, 3);
  }

  if (carrier === 'dhl') {
    const dhlEvents: TrackingEvent[] = [
      {
        id: 'dhl-1',
        status: 'posted',
        title: 'Remessa coletada pela DHL Express',
        description: 'Envio recebido na central de operações expressas.',
        location: `${originCity} - ${originState}`,
        ...formatDate(4, 1)
      },
      {
        id: 'dhl-2',
        status: 'in_transit',
        title: 'Processado no Hub Aéreo DHL Express',
        description: 'Carga aérea consolidada e em rota de transferência prioritária.',
        location: 'Hub Gateway Viracopos - SP',
        ...formatDate(2, 6)
      },
      {
        id: 'dhl-3',
        status: 'in_transit',
        title: 'Chegada à estação de entrega local',
        description: `Remessa expressa disponível na filial DHL de ${destCity}/${destState}.`,
        location: `${destCity} - ${destState}`,
        ...formatDate(1, 3)
      },
      {
        id: 'dhl-4',
        status: 'out_for_delivery',
        title: 'Com o courier DHL para entrega',
        description: 'Motorista em rota final de entrega ao destinatário.',
        location: `${destCity} - ${destState}`,
        ...formatDate(0, 1)
      },
      {
        id: 'dhl-5',
        status: 'delivered',
        title: 'Remessa entregue e assinada',
        description: 'Entrega finalizada com comprovante digitalizado.',
        location: `${destCity} - ${destState}`,
        ...formatDate(0, 4)
      }
    ];

    if (currentStatus === 'posted') return dhlEvents.slice(0, 1);
    if (currentStatus === 'in_transit') return dhlEvents.slice(0, 3);
    if (currentStatus === 'out_for_delivery') return dhlEvents.slice(0, 4);
    if (currentStatus === 'delivered') return dhlEvents.slice(0, 5);
    return dhlEvents.slice(0, 3);
  }

  const carrierName = carrier === 'correios' ? 'Correios' : carrier === 'loggi' ? 'Loggi Express' : carrier === 'jadlog' ? 'Jadlog' : carrier === 'total_express' ? 'Total Express' : 'Transportadora';

  const allEvents: TrackingEvent[] = [
    {
      id: 'evt-1',
      status: 'posted',
      title: 'Objeto postado',
      description: `Objeto recebido na agência dos ${carrierName}. Aguardando triagem para envio.`,
      location: `${originCity} - ${originState}`,
      ...formatDate(3, 2)
    },
    {
      id: 'evt-2',
      status: 'in_transit',
      title: 'Objeto em transferência',
      description: `Objeto em trânsito de Unidade de Tratamento em ${originCity}/${originState} para Unidade de Distribuição em ${destCity}/${destState}.`,
      location: `Centro de Distribuição - ${originState}`,
      ...formatDate(2, 6)
    },
    {
      id: 'evt-3',
      status: 'in_transit',
      title: 'Objeto recebido na unidade de destino',
      description: `Objeto chegou à central de distribuição local em ${destCity}/${destState}. Preparando para entrega.`,
      location: `${destCity} - ${destState}`,
      ...formatDate(1, 4)
    },
    {
      id: 'evt-4',
      status: 'out_for_delivery',
      title: 'Objeto saiu para entrega ao destinatário',
      description: 'O entregador está a caminho do endereço indicado. Certifique-se de que haverá alguém para receber.',
      location: `${destCity} - ${destState}`,
      ...formatDate(0, 1)
    },
    {
      id: 'evt-5',
      status: 'delivered',
      title: 'Objeto entregue ao destinatário',
      description: 'Entrega finalizada com sucesso. Agradecemos pela preferência!',
      location: `${destCity} - ${destState}`,
      ...formatDate(0, 5)
    }
  ];

  // Return events up to the target status
  const statusOrder: TrackingStatus[] = ['posted', 'in_transit', 'out_for_delivery', 'delivered'];
  const targetIndex = statusOrder.indexOf(currentStatus);
  
  if (targetIndex === -1) {
    return allEvents.slice(0, 3);
  }

  if (currentStatus === 'posted') return allEvents.slice(0, 1);
  if (currentStatus === 'in_transit') return allEvents.slice(0, 3);
  if (currentStatus === 'out_for_delivery') return allEvents.slice(0, 4);
  if (currentStatus === 'delivered') return allEvents.slice(0, 5);
  
  return allEvents.slice(0, 3);
}

export function getStatusDetails(status: TrackingStatus) {
  switch (status) {
    case 'posted':
      return { label: 'Objeto Postado', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', step: 1 };
    case 'in_transit':
      return { label: 'Em Trânsito', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', step: 2 };
    case 'out_for_delivery':
      return { label: 'Saiu para Entrega', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', step: 3 };
    case 'waiting_pickup':
      return { label: 'Aguardando Retirada', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', step: 3 };
    case 'delivery_attempt':
      return { label: 'Tentativa de Entrega', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', step: 3 };
    case 'delivered':
      return { label: 'Entregue', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', step: 4 };
    case 'returned':
      return { label: 'Devolvido', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', step: 4 };
    default:
      return { label: 'Pendente', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', step: 0 };
  }
}

export function detectCarrierFromCode(code: string): CarrierType {
  const clean = (code || '').trim().toUpperCase().replace(/\s+/g, '');
  if (clean.startsWith('LP') || clean.startsWith('CN') || clean.includes('CAI')) return 'cainiao';
  if (/^\d{10}$/.test(clean) || clean.startsWith('DHL')) return 'dhl';
  if (clean.startsWith('1008') || clean.startsWith('JAD') || /^\d{12,14}$/.test(clean)) return 'jadlog';
  if (clean.startsWith('TEX') || clean.startsWith('TOTAL')) return 'total_express';
  if ((clean.length === 13 && clean.endsWith('BR') && !clean.startsWith('LG')) || clean.startsWith('CORREIO')) return 'correios';
  return 'loggi';
}

export function generateDynamicShipment(code: string): import('../types').Shipment {
  const clean = (code || '').trim().toUpperCase().replace(/\s+/g, '');
  const carrier = detectCarrierFromCode(clean);
  const events = generateRealisticTimeline(carrier, 'Cajamar', 'SP', 'São Paulo', 'SP', 'in_transit');
  
  return {
    id: `dyn_${clean}_${Date.now()}`,
    code: clean,
    carrier,
    customerName: 'Destinatário',
    customerPhone: '',
    orderNumber: clean.startsWith('ORD-') || clean.startsWith('BATCH-') ? clean : `#${clean.slice(-6) || '1042'}`,
    orderValue: 149.90,
    productName: 'Pacote Express Nacional',
    originCity: 'Cajamar',
    originState: 'SP',
    destinationCity: 'São Paulo',
    destinationState: 'SP',
    destinationZip: '01000-000',
    status: 'in_transit',
    events,
    estimatedDeliveryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    whatsappNotified: false,
    emailNotified: false,
    upsellClicks: 0,
    upsellConversions: 0
  };
}

