"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  Upload, MessageSquare, FileText, Send, 
  Bot, User, Loader2, Plus, ChevronDown, ChevronUp, Sparkles 
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOcrText, setShowOcrText] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth`, { email });
      setUser(res.data);
      loadDocuments(res.data.id);
    } catch (error) {
      alert("Erro ao logar.");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (userId: string) => {
    try {
      const res = await axios.get(`${API_URL}/documents?userId=${userId}`);
      setDocuments(res.data);
    } catch (error) { console.error("Erro ao carregar"); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !user) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", user.id);
    try {
      await axios.post(`${API_URL}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" }});
      await loadDocuments(user.id);
      alert("Documento processado!");
    } catch (error) { alert("Erro no upload"); } finally { setLoading(false); setFile(null); }
  };

  const handleChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedDocId || !chatMsg.trim()) return;
    const msg = chatMsg;
    setChatMsg("");
    const newHistory = [...chatHistory, { role: "user", text: msg }];
    setChatHistory(newHistory);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/chat`, { documentId: selectedDocId, question: msg });
      setChatHistory(prev => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Erro de conexão." }]);
    } finally { setLoading(false); }
  };

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setChatHistory([]);
    setShowOcrText(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl text-center">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo</h1>
          <p className="text-gray-500 mb-8">Digite seu e-mail para acessar seus documentos inteligentes.</p>
          
          <div className="space-y-4">
            <input
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button 
              onClick={handleLogin} 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex h-screen font-sans bg-[#f0f4f9]">
      
      {/* SIDEBAR (Escura e minimalista) */}
      <aside className="w-[280px] bg-[#1e1f20] text-gray-300 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3">
          <Sparkles className="text-blue-400 w-6 h-6" />
          <h1 className="font-semibold text-white text-lg">FinChat</h1>
        </div>

        <div className="px-3 mb-4">
          <label className="flex items-center justify-center gap-2 w-full bg-[#2d2e30] hover:bg-[#3c3d40] text-white py-3 rounded-full cursor-pointer transition-all font-medium text-sm group border border-gray-700/50">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={18} />}
            <span>Novo Chat / Upload</span>
            <input type="file" className="hidden" onChange={handleUpload} disabled={loading} accept="image/*" />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 dark-scrollbar">
          <h2 className="px-3 text-xs font-bold text-gray-500 uppercase mb-2">Recentes</h2>
          {documents.map((doc) => (
            <button 
              key={doc.id} 
              onClick={() => handleSelectDoc(doc.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                selectedDocId === doc.id 
                  ? 'bg-[#004a77] text-white'
                  : 'hover:bg-[#2d2e30] text-gray-300'
              }`}
            >
              <MessageSquare size={18} />
              <p className="truncate text-sm font-medium flex-1">{doc.filename.split('.')[0]}</p>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-white truncate flex-1">{user.email}</p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL CENTRALIZADA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {!selectedDocId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Como posso ajudar hoje?</h2>
            <p className="text-gray-500 max-w-md">Selecione um documento recente ao lado ou faça o upload de uma nova imagem para começar.</p>
          </div>
        ) : (
          <>
            {/* Header do Chat */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                {currentDoc?.filename}
              </h3>
              <button 
                onClick={() => setShowOcrText(!showOcrText)}
                className="text-sm flex items-center gap-1 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all"
              >
                {showOcrText ? 'Ocultar texto' : 'Ver texto extraído'} 
                {showOcrText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </header>

             {/* Texto OCR Expansível */}
            {showOcrText && (
              <div className="bg-gray-50 border-b border-gray-200 p-6 max-h-[30vh] overflow-y-auto text-sm font-mono text-gray-600 shadow-inner custom-scrollbar">
                <div className="max-w-3xl mx-auto whitespace-pre-wrap bg-white p-4 rounded-lg border">{currentDoc?.extractedText}</div>
              </div>
            )}

            {/* ÁREA DE MENSAGENS (O segredo da centralização está aqui) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative bg-[#f0f4f9]">
              <div className="max-w-[800px] mx-auto space-y-8 pb-32"> {/* pb-32 para dar espaço pro input flutuante */}
                
                {/* Mensagem Inicial */}
                <div className="flex gap-4">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                     <Sparkles size={16} className="text-white" />
                   </div>
                   <div className="bg-white p-5 rounded-2xl rounded-tl-sm shadow-sm text-gray-700 text-[15px] leading-relaxed border border-gray-100">
                     Olá! Analisei o documento <strong>{currentDoc?.filename}</strong>. Estou pronto para responder suas perguntas sobre ele.
                   </div>
                </div>

                {/* Histórico */}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1">
                        <Sparkles size={16} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-[#dbeafe] text-blue-900 rounded-tr-sm ml-auto'
                        : 'bg-white text-gray-700 rounded-tl-sm border border-gray-100' 
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                     {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1 text-gray-600">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                       <Sparkles size={16} className="text-white" />
                     </div>
                     <div className="flex gap-1 bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full typing-dot"></div>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* ÁREA DE INPUT FLUTUANTE (O toque final do Gemini) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#f0f4f9] via-[#f0f4f9] to-transparent pt-10 pb-6 px-4 pointer-events-none flex justify-center">
              <form onSubmit={handleChat} className="w-full max-w-[800px] pointer-events-auto relative flex items-center">
                <input 
                  className="w-full bg-white border border-gray-300 focus:border-blue-500 rounded-full pl-6 pr-16 py-4 text-gray-700 placeholder-gray-400 shadow-lg transition-all outline-none text-[15px]"
                  placeholder="Faça uma pergunta sobre o documento..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={loading || !chatMsg.trim()} 
                  className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all disabled:opacity-50 disabled:scale-90 hover:scale-105 active:scale-95"
                >
                  <Send size={20} className={loading ? 'animate-pulse' : ''} />
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}