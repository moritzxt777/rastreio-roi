import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shipment } from '../../types';
import { 
  Printer, 
  FileText, 
  QrCode, 
  Barcode, 
  Package, 
  CheckCircle2,
  Download,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

const sampleFallbackShipment: Shipment = {
  id: 'sample_label_01',
  userId: 'default',
  code: 'NL192837465BR',
  customerName: 'Lucas Silveira de Oliveira',
  customerPhone: '11999998888',
  orderNumber: '10842',
  orderValue: 189.90,
  productName: 'Smartwatch Ultra 9 Titanium Edition',
  carrier: 'Correios',
  originCity: 'Curitiba',
  originState: 'PR',
  destinationCity: 'São Paulo',
  destinationState: 'SP',
  destinationZip: '01310-100',
  status: 'POSTED',
  createdAt: new Date().toISOString(),
  events: [],
  timelineHours: 24,
  whatsappNotified: true
};

export const ShippingToolsView: React.FC = () => {
  const { shipments } = useApp();
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id || 'sample');
  const [activeTab, setActiveTab] = useState<'label' | 'nfe'>('label');
  const [overrideCarrier, setOverrideCarrier] = useState<'Correios' | 'Loggi' | 'Jadlog' | null>(null);

  const selected: Shipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0] || sampleFallbackShipment;
  const carrierName = overrideCarrier || selected.carrier || 'Correios';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-document, #printable-document * {
            visibility: visible;
          }
          #printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-400" />
            Etiquetas de Postagem & Espelho de NFe
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gere e imprima etiquetas térmicas padrão Correios/Transportadoras (100x150mm) e espelho de conferência fiscal.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="rounded-xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Documento</span>
        </button>
      </div>

      {/* Controls Bar (Hidden on print) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-300 whitespace-nowrap">Selecionar Pedido:</label>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-brand-500 focus:outline-none min-w-[220px]"
            >
              {shipments.length === 0 && (
                <option value="sample">
                  {sampleFallbackShipment.code} - {sampleFallbackShipment.customerName} (#{sampleFallbackShipment.orderNumber}) [Exemplo]
                </option>
              )}
              {shipments.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.customerName} (#{s.orderNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Carrier Style Override */}
          <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Padrão:</span>
            {(['Correios', 'Loggi', 'Jadlog'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setOverrideCarrier(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  carrierName === c ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('label')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'label' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Etiqueta Térmica (100x150)</span>
          </button>
          <button
            onClick={() => setActiveTab('nfe')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'nfe' ? 'bg-brand-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Espelho DANFE / NFe</span>
          </button>
        </div>
      </div>

      {/* Document Canvas Preview Container */}
      <div className="flex justify-center p-2 sm:p-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
        <div id="printable-document">
          {activeTab === 'label' && (
            <div className="w-[360px] sm:w-[390px] bg-white text-black p-5 rounded-md shadow-2xl border-2 border-black font-sans space-y-3.5 text-xs select-none">
              
              {/* Header: Carrier Title & Contract */}
              <div className="border-b-2 border-black pb-2.5 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black tracking-tight uppercase">
                    {carrierName === 'Loggi' ? 'LOGGI EXPRESS' : carrierName === 'Jadlog' ? 'JADLOG .PACKAGE' : 'CORREIOS SEDEX'}
                  </h2>
                  <p className="text-[10px] font-bold tracking-wider text-gray-800">CONTRATO / ETIQUETA OFICIAL DE POSTAGEM</p>
                  <p className="text-[11px] font-mono mt-0.5 font-bold">PLP: 849302198 • CONTRATO: 9912384910</p>
                </div>
                
                {/* Simulated 2D Matrix / QR Code */}
                <div className="w-16 h-16 border-2 border-black p-1 flex flex-col items-center justify-center bg-gray-50 text-[8px] font-mono font-black text-center shrink-0">
                  <QrCode className="w-8 h-8 text-black" />
                  <span>DATA MATRIX</span>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 border-b-2 border-black space-y-1">
                <div className="h-12 flex items-center justify-center space-x-[2px] bg-white py-1">
                  {[4,2,3,1,5,2,4,1,3,5,2,1,4,3,2,5,1,4,2,3,1,5,3,2,4,1,2,5,3,1,4,2,5,1,3,4,2,1,5,3,2].map((w, idx) => (
                    <div 
                      key={idx} 
                      className="bg-black h-full" 
                      style={{ width: `${w}px` }} 
                    />
                  ))}
                </div>
                <p className="font-mono font-black text-base tracking-widest text-black">{selected.code}</p>
                <p className="text-[9px] font-bold text-gray-600 uppercase">Recebedor: Assinar e datar no ato da entrega</p>
              </div>

              {/* Destinatário */}
              <div className="border-b-2 border-black pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5 tracking-wider">
                    DESTINATÁRIO
                  </span>
                  <span className="text-[10px] font-bold font-mono text-gray-700">ORD: #{selected.orderNumber}</span>
                </div>
                <p className="font-black text-sm text-black pt-1">{selected.customerName}</p>
                <p className="text-xs font-semibold text-gray-900">Rua das Acácias, nº 450 - Bloco B, Apto 102</p>
                <p className="text-xs font-semibold text-gray-900">Bairro: Centro</p>
                <div className="flex items-center justify-between pt-1 font-bold text-xs">
                  <span>{selected.destinationCity} / {selected.destinationState}</span>
                  <span className="font-mono bg-gray-200 px-2 py-0.5 border border-black text-xs font-black">
                    CEP: {selected.destinationZip || '01310-100'}
                  </span>
                </div>
              </div>

              {/* Remetente */}
              <div className="space-y-1 text-[10px] text-gray-800 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-black">REMETENTE:</span>
                  <span className="font-mono text-[9px] text-gray-600 font-bold">DOC: DECLARAÇÃO DE CONTEÚDO</span>
                </div>
                <p className="font-bold text-black text-[11px]">CENTRAL DE OPERAÇÕES LOGÍSTICAS BRASIL</p>
                <p className="text-[10px]">{selected.originCity} - {selected.originState} • CEP: 80010-000</p>
                <p className="text-[10px] font-medium text-gray-700 border-t border-gray-300 pt-1">
                  <strong>Item:</strong> {selected.productName} • <strong>Qtd:</strong> 1 un • <strong>Valor:</strong> R$ {selected.orderValue.toFixed(2)}
                </p>
              </div>

            </div>
          )}

          {activeTab === 'nfe' && (
            <div className="w-[360px] sm:w-[480px] md:w-[540px] bg-white text-black p-6 rounded-md shadow-2xl border-2 border-black font-sans space-y-4 text-xs select-none">
              <div className="border-b-2 border-black pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black tracking-tight">DANFE SIMPLIFICADA</h2>
                  <p className="text-[10px] text-gray-600 font-semibold">Documento Auxiliar de Nota Fiscal Eletrônica</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-black">Nº 000.084.192</p>
                  <p className="text-[10px] font-bold text-gray-700">SÉRIE 001</p>
                </div>
              </div>

              <div className="border border-black p-2.5 space-y-1 text-[11px] bg-gray-50">
                <p className="font-mono text-[10px]"><strong>Chave de Acesso:</strong> 3526 0914 8291 0482 9102 5500 1000 0841 9210 9283 7461</p>
                <p className="font-mono text-[10px]"><strong>Protocolo de Autorização:</strong> 135260192837465 - 12/09/2026 às 08:30:00</p>
              </div>

              <div className="border border-black p-3 space-y-1.5">
                <p className="font-black text-xs border-b border-gray-300 pb-1">DESTINATÁRIO / REMETENTE</p>
                <p>Nome/Razão Social: <strong>{selected.customerName}</strong></p>
                <p>Endereço: Rua das Acácias, 450 - {selected.destinationCity}/{selected.destinationState}</p>
                <p>CEP: {selected.destinationZip || '01310-100'} • Telefone: {selected.customerPhone || '(11) 99999-8888'}</p>
                <p>Pedido de Referência: <strong>#{selected.orderNumber}</strong> • Código: <strong>{selected.code}</strong></p>
              </div>

              <div className="border border-black p-3 space-y-2">
                <p className="font-black text-xs border-b border-gray-300 pb-1">DADOS DOS PRODUTOS / SERVIÇOS</p>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-black text-left text-[10px] uppercase font-bold text-gray-700">
                      <th className="pb-1">Descrição do Produto</th>
                      <th className="pb-1 text-center">Qtd</th>
                      <th className="pb-1 text-right">Valor Unit.</th>
                      <th className="pb-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-1.5 font-medium">{selected.productName}</td>
                      <td className="py-1.5 text-center font-bold">1</td>
                      <td className="py-1.5 text-right font-mono">R$ {selected.orderValue.toFixed(2)}</td>
                      <td className="py-1.5 text-right font-mono font-black">R$ {selected.orderValue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t-2 border-black pt-2 flex justify-between text-[10px] text-gray-700 font-semibold">
                <span>Emitido via Sistema Rastreio Express</span>
                <span>Consulta de Autenticidade: sefaz.rs.gov.br/nfe</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

