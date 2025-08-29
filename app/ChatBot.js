"use client";
import { useState, useRef, useEffect } from "react";

// URL da logo do SENAI
const SENAI_LOGO_URL = "/senai-logo.png";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá! 👋" },
    { role: "assistant", content: "Sou o assistente virtual SENAI, pronto para te ajudar." },
    { role: "assistant", content: "Por favor, escolha uma opção:\n1. Suporte Técnico\n2. Financeiro\n3. Vendas" }
  ]);
  
  const [input, setInput] = useState("");
  
  // Ref para a área de mensagens para fazer o scroll automático
  const messagesEndRef = useRef(null);

  // Função para rolar para a última mensagem sempre que o chat for atualizado
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ocorreu um erro no servidor.");
      
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: `Desculpe, ocorreu um erro: ${err.message}` }]);
    }
  };

  // Função para baixar a conversa em um arquivo de texto
  const downloadConversation = () => {
    const formattedText = messages
      .map(msg => {
        const prefix = msg.role === 'user' ? 'Você' : 'Assistente SENAI';
        return `${prefix}:\n${msg.content}`;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conversa-assistente-senai.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // Botão circular para abrir o chat
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-[#b91d32] text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-[#e30914] transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#e30914]/50"
        aria-label="Abrir chat"
      >
        💬
      </button>
    );
  }

  // Janela principal do chat
  return (
    // BORDA REMOVIDA DA JANELA PRINCIPAL (apenas sombra)
    <div className="fixed bottom-5 right-5 w-80 bg-[#f1f1f1] shadow-2xl rounded-2xl flex flex-col h-[500px] transition-all">
      {/* CABEÇALHO */}
      <div className="bg-[#b91d32] text-white p-4 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-lg font-bold">Assistente ZELOS</h2>
        <div className="flex items-center gap-4">
          <button onClick={downloadConversation} className="text-xl font-bold hover:opacity-75" aria-label="Baixar conversa">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          </button>
          <button onClick={() => setIsOpen(false)} className="text-2xl font-bold hover:opacity-75" aria-label="Fechar chat">&times;</button>
        </div>
      </div>
      
      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <img src={SENAI_LOGO_URL} alt="Logo SENAI" className="w-8 h-8 rounded-full self-start"/>
            )}
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#35007c] text-white rounded-br-none' : 'bg-[#e6e6e6] text-[#000000] rounded-bl-none'}`}>
              <p className="whitespace-pre-line text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ÁREA DE INPUT MELHORADA */}
      <div className="p-3 bg-[#f1f1f1] border-t border-gray-200 rounded-b-2xl">
        <div className="relative flex items-center">
          {/* INPUT SEM BORDA, COM BACKGROUND E FOCO MELHORADO */}
          <input
            className="w-full bg-[#e6e6e6] rounded-full pl-4 pr-12 py-2 text-sm text-[#000000] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b91d32]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua opção..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#e30914] text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold hover:bg-[#b91d32] transition-colors"
            onClick={sendMessage}
            aria-label="Enviar mensagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#FFFFFF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}