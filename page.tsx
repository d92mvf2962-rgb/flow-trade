"use client";
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function Home() {
  const [preco, setPreco] = useState(0);
  const [saldo, setSaldo] = useState(1000);
  const [btc, setBtc] = useState(0);

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btceur@ticker");
    ws.onmessage = (event) => {
      const dados = JSON.parse(event.data);
      setPreco(parseFloat(dados.c));
    };
    return () => ws.close();
  }, []);

  const comprarBTC = async () => {
    if (saldo >= 100 && preco > 0) {
      const valorCompra = 100;
      const qtdBtc = valorCompra / preco;
      
      setSaldo(prev => prev - valorCompra);
      setBtc(prev => prev + qtdBtc);

      const { error } = await supabase
        .from('transacoes')
        .insert([{ tipo: 'compra', valor: valorCompra, btc_qtd: qtdBtc }]);

      if (error) console.error("Erro Supabase:", error.message);
    } else {
      alert("Saldo insuficiente ou preço inválido!");
    }
  };

  const venderBTC = async () => {
    if (btc > 0 && preco > 0) {
      const valorVenda = btc * preco;
      
      setSaldo(prev => prev + valorVenda);
      setBtc(0);

      const { error } = await supabase
        .from('transacoes')
        .insert([{ tipo: 'venda', valor: valorVenda, btc_qtd: 0 }]);

      if (error) console.error("Erro Supabase:", error.message);
      else alert("Venda realizada com sucesso!");
    } else {
      alert("Não tens BTC para vender!");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 font-sans">
      <div className="w-full max-w-md p-8 rounded-[2.5rem] bg-[#141414] border border-white/5 shadow-2xl text-center">
        
        {/* LOGO E NOME */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-green-500/20">
             <span className="text-black text-4xl font-black">F</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">
            FLOW <span className="text-green-500">TRADE</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-bold mt-1">
            Crypto Simulator
          </p>
        </div>

        {/* CARTEIRA */}
        <div className="flex justify-between text-[10px] text-gray-400 mb-6 uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="flex flex-col items-start">
            <span>Saldo EUR</span>
            <span className="text-white font-bold text-sm">{saldo.toFixed(2)}€</span>
          </div>
          <div className="flex flex-col items-end">
            <span>Saldo BTC</span>
            <span className="text-green-400 font-bold text-sm">{btc.toFixed(6)}</span>
          </div>
        </div>

        {/* PREÇO LIVE */}
        <div className="py-10 mb-8 rounded-3xl bg-black/40 border border-green-500/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
          <span className="text-sm text-gray-500 block mb-2 uppercase font-medium">BTC / EUR</span>
          <span className="text-5xl font-mono font-black text-green-400 tracking-tighter">
            {preco > 0 ? preco.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) : "0.00"}€
          </span>
        </div>

        {/* BOTÕES */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={comprarBTC}
            className="bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/20 text-sm"
          >
            COMPRAR 100€
          </button>
          
          <button 
            onClick={venderBTC}
            className="bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 transition-all active:scale-95 text-sm"
          >
            VENDER TUDO
          </button>
        </div>

      </div>
    </main>
  );
}