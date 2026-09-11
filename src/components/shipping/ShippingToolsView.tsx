import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  FileText, 
  QrCode, 
  Barcode, 
  Package, 
  CheckCircle2 
} from 'lucide-react';

export const ShippingToolsView: React.FC = () => {
  const { shipments } = useApp();
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'label' | 'nfe'>('label');

  const selected = shipments.find(s => s.id === selectedShipmentId) || shipments[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-brand-400" />
            Etiquetas de Postagem & Espelho de NFe
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gere e imprima etiquetas térmicas padrão Correios/Transportadoras e espelho de conferência fiscal.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-brand-400 transition flex items-center gap-1.5 shadow"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Documento</span>
        </button>
      </div>

      {/* Select Order */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-300">Selecionar Pedido:</label>
          <select
            value={selectedShipmentId}
            onChange={(e) => setSelectedShipmentId(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
          >
            {shipments.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.customerName} (#{s.orderNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('label')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'label' ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Etiqueta de Envio (Térmica 100x150)
          </button>
          <button
            onClick={() => setActiveTab('nfe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'nfe' ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Espelho DANFE / NFe
          </button>
        </div>
      </div>

      {/* Document Canvas Preview */}
      <div className="flex justify-center p-4">
        {activeTab === 'label' && selected && (
          <div className="w-[380px] bg-white text-black p-5 rounded-lg shadow-2xl border border-gray-300 font-sans space-y-4 text-xs">
            {/* Header / Carrier & QR */}
            <div className="border-b-2 border-black pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black tracking-wider uppercase">{selected.carrier} EXPRESS</h2>
                <p className="text-[10px] font-bold">CONTRATO / ETIQUETA OFICIAL</p>
                <p className="text-[11px] font-mono mt-1 font-bold">PLP: 849302198</p>
              </div>
              <div className="w-14 h-14 border border-black flex items-center justify-center font-mono text-[9px] text-center p-1 font-bold">
                QR CODE RASTREIO
              </div>
            </div>

            {/* Barcode Mock */}
            <div className="text-center py-2 border-b-2 border-black">
              <div className="h-10 bg-gradient-to-r from-black via-black to-black flex items-center justify-center text-white font-mono text-[10px] font-bold tracking-widest">
                |||| | |||||| || ||||| ||||||| | ||| ||
              </div>
              <p className="font-mono font-black text-sm tracking-wider mt-1">{selected.code}</p>
            </div>

            {/* Destinatário */}
            <div className="border-b-2 border-black pb-3 space-y-1">
              <span className="text-[10px] font-black uppercase bg-black text-white px-1 py-0.5">DESTINATÁRIO</span>
              <p className="font-bold text-sm mt-1">{selected.customerName}</p>
              <p className="text-[11px]">Rua das Flores, nº 450 - Centro</p>
              <p className="text-[11px] font-bold">{selected.destinationCity} - {selected.destinationState}</p>
              <p className="text-[11px] font-mono font-bold">CEP: {selected.destinationZip || '01001-000'}</p>
            </div>

            {/* Remetente */}
            <div className="space-y-0.5 text-[10px] text-gray-700">
              <span className="font-black uppercase">REMETENTE:</span>
              <p className="font-bold text-black">Centro de Distribuição Express Brasil</p>
              <p>{selected.originCity} - {selected.originState}</p>
              <p>Pedido: #{selected.orderNumber} • {selected.productName}</p>
            </div>
          </div>
        )}

        {activeTab === 'nfe' && selected && (
          <div className="w-[500px] bg-white text-black p-6 rounded-lg shadow-2xl border border-gray-300 font-sans space-y-4 text-xs">
            <div className="border-b-2 border-black pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black">DANFE SIMPLIFICADA</h2>
                <p className="text-[10px] text-gray-600">Documento Auxiliar de Nota Fiscal Eletrônica</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-bold">Nº 000.084.192</p>
                <p className="text-[10px] text-gray-600">Série 1</p>
              </div>
            </div>

            <div className="border border-black p-2 space-y-1 text-[11px]">
              <p><strong>Chave de Acesso:</strong> 3526 0914 8291 0482 9102 5500 1000 0841 9210 9283 7461</p>
              <p><strong>Protocolo de Autorização:</strong> 135260192837465 - 11/09/2026</p>
            </div>

            <div className="border border-black p-2 space-y-1">
              <p className="font-bold">DESTINATÁRIO / REMETENTE</p>
              <p>Nome/Razão Social: <strong>{selected.customerName}</strong></p>
              <p>Endereço: Centro, {selected.destinationCity}/{selected.destinationState}</p>
              <p>Pedido Referência: #{selected.orderNumber}</p>
            </div>

            <div className="border border-black p-2 space-y-1">
              <p className="font-bold">DADOS DOS PRODUTOS / SERVIÇOS</p>
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="border-b border-black text-left">
                    <th>Descrição</th>
                    <th>Qtd</th>
                    <th>Valor Unit.</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{selected.productName}</td>
                    <td>1</td>
                    <td>R$ {selected.orderValue.toFixed(2)}</td>
                    <td className="text-right font-bold">R$ {selected.orderValue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
