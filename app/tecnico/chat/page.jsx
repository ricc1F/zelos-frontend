"use client";

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { Menu, Transition } from '@headlessui/react';

// --- Ícones ---
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z"/></svg>;
const IconSpinner = () => <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const IconCheck = ({ color = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill={color}><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const IconDoubleCheck = ({ color = 'currentColor' }) => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill={color}><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>;
const IconChatBubble = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.206-3.618A4.41 4.41 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.417 11.583A2.417 2.417 0 004 10c0-2.209 2.686-4 6-4s6 1.791 6 4-2.686 4-6 4a6.417 6.417 0 01-1.417-.167L4.417 11.583z" clipRule="evenodd" /></svg>;
const IconDotsVertical = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>;

// --- Componentes de UI ---
const Avatar = React.memo(({ initial, size = 'w-11 h-11' }) => {
    const colors = ['bg-[#b91d32]', 'bg-gray-600', 'bg-blue-600', 'bg-orange-500', 'bg-purple-600'];
    const colorIndex = (initial?.charCodeAt(0) || 0) % colors.length;
    return <div className={`relative ${size} ${colors[colorIndex]} rounded-full flex items-center justify-center font-bold text-white text-xl flex-shrink-0`}>{initial}</div>;
});
Avatar.displayName = 'Avatar';

const ConversationButton = React.memo(({ convo, isSelected, isOnline, onClick, currentUserId }) => (
    <button onClick={() => onClick(convo)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${isSelected ? 'bg-red-100' : 'hover:bg-gray-100'}`}>
        <div className="relative">
            <Avatar initial={convo.avatarInitial} />
            {isOnline && <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>}
        </div>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 truncate">{convo.nome}</p>
                {convo.lastMessageTimestamp && <p className="text-xs text-gray-400 flex-shrink-0">{new Date(convo.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
            <div className="flex justify-between items-start mt-1">
                <p className={`text-sm truncate ${convo.unreadCount > 0 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>
                    {convo.lastMessageSenderId === currentUserId ? `Você: ${convo.lastMessage}` : convo.lastMessage}
                </p>
                {convo.unreadCount > 0 && <span className="bg-[#b91d32] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{convo.unreadCount}</span>}
            </div>
        </div>
    </button>
));
ConversationButton.displayName = 'ConversationButton';

const MessageBubble = React.memo(({ msg, isCurrentUser, onReply, onEdit }) => {
    const isDeleted = msg.text === "[Mensagem apagada]";
    return (
        <div className={`group flex items-end gap-2.5 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
             <Avatar initial={msg.senderAvatar} size="w-8 h-8" />
            <div className="relative">
                <div className={`p-3 rounded-lg max-w-lg shadow-sm ${isCurrentUser ? 'bg-[#b91d32] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'} ${isDeleted ? 'bg-gray-200 !text-gray-500 italic' : ''}`}>
                    <p className="font-bold text-sm mb-1">{msg.senderName}</p>
                    {msg.replyingToText && (<div className="mb-2 p-2 bg-black/10 rounded-lg border-l-2 border-red-400"><p className="font-bold text-xs">{msg.replyingToSender}</p><p className="text-sm opacity-80 truncate">{msg.replyingToText}</p></div>)}
                    <p className="text-base break-words leading-snug whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                        {!!msg.foi_editada && <p className="text-xs italic opacity-75">(editado)</p>}
                        <p className={`text-xs ${isCurrentUser ? 'text-red-100' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        {isCurrentUser && !isDeleted && (msg.lida ? <IconDoubleCheck color="#3b82f6" /> : <IconCheck color={'#fecaca'} />)}
                    </div>
                </div>
            </div>
        </div>
    );
});
MessageBubble.displayName = 'MessageBubble';

const UnreadSeparator = () => ( <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-red-300"></div></div><div className="relative flex justify-center"><span className="bg-gray-100 px-2 text-xs font-semibold text-red-500">Mensagens não lidas</span></div></div>);

// --- Componente Principal ---
export default function ChatPage() {
    const router = useRouter();
    const socketRef = useRef(null);
    const messageContainerRef = useRef(null);
    const inputRef = useRef(null);
    
    const [currentUser, setCurrentUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [typingInfo, setTypingInfo] = useState({ isTyping: false, user: null });
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [firstUnreadIndex, setFirstUnreadIndex] = useState(-1);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    // --- FUNÇÕES MEMOIZADAS (useCallback) ---
    // A ordem é importante: defina-as ANTES dos useEffects que as usam.

    const fetchConversations = useCallback(async () => {
        if (!currentUser) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to fetch conversations");
            const data = await res.json();
            setConversations(data.map(convo => ({ ...convo, unreadCount: Number(convo.unreadCount), currentUserId: currentUser.id })));
        } catch (error) { console.error(error); }
    }, [currentUser]);

    const showNotification = useCallback((title, body) => {
        if (!("Notification" in window) || !document.hidden) return;
        if (Notification.permission === "granted") new Notification(title, { body, icon: '/senai-logo.png' });
        else if (Notification.permission !== "denied") Notification.requestPermission();
    }, []);

    const updateConversationList = useCallback((newMessage, isCurrentChat, newText) => {
        setConversations(prev => {
            if (!currentUser) return prev;
            const otherUserId = newMessage.senderId === currentUser.id ? newMessage.recipientId : newMessage.senderId;
            const otherUserName = newMessage.senderId === currentUser.id ? selectedConversation?.nome : newMessage.senderName;
            const existingConvoIndex = prev.findIndex(c => c.id === otherUserId);
            if (existingConvoIndex === -1 && newText) return prev;
            let updatedConvo;
            if (existingConvoIndex > -1) {
                const convo = { ...prev[existingConvoIndex] };
                convo.lastMessage = newText || newMessage.text;
                convo.lastMessageTimestamp = newMessage.timestamp;
                convo.lastMessageSenderId = newMessage.senderId;
                if (!isCurrentChat && newMessage.senderId !== currentUser.id && !newText) {
                    convo.unreadCount = (convo.unreadCount || 0) + 1;
                }
                updatedConvo = convo;
                const newConversations = [...prev];
                newConversations.splice(existingConvoIndex, 1);
                return [updatedConvo, ...newConversations];
            } else if (!newText) {
                updatedConvo = { id: otherUserId, nome: otherUserName, avatarInitial: otherUserName ? otherUserName.charAt(0).toUpperCase() : '?', lastMessage: newMessage.text, lastMessageTimestamp: newMessage.timestamp, lastMessageSenderId: newMessage.senderId, unreadCount: 1, currentUserId: currentUser.id };
                return [updatedConvo, ...prev];
            }
            return prev;
        });
    }, [currentUser, selectedConversation]);

    // --- HOOKS DE EFEITO (useEffect) ---

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('usuario');
        if (!token || !userDataString) { router.push('/login'); return; }
        try {
            setCurrentUser(JSON.parse(userDataString));
            socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, { auth: { token }, transports: ['websocket'] });
        } catch { localStorage.clear(); router.push('/login'); }
        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, [router]);
    
    useEffect(() => { if (currentUser) fetchConversations(); }, [currentUser, fetchConversations]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !currentUser) return;

        const handleReceiveMessage = (newMessage) => {
            const isForCurrentChat = (newMessage.senderId === selectedConversation?.id && newMessage.recipientId === currentUser.id) || 
                                     (newMessage.senderId === currentUser.id && newMessage.recipientId === selectedConversation?.id);
            if (isForCurrentChat) { 
                setMessages((prev) => [...prev, newMessage]); 
                if (document.hasFocus()) socket.emit('messagesRead', { readerId: currentUser.id, chatPartnerId: selectedConversation.id });
            }
            updateConversationList(newMessage, isForCurrentChat);
            if (newMessage.senderId !== currentUser.id) showNotification(newMessage.senderName, newMessage.text);
        };
        const handleConversationRead = ({ byUser }) => {
            if (byUser === selectedConversation?.id) setMessages(prev => prev.map(msg => (msg.senderId === currentUser.id ? { ...msg, lida: true } : msg)));
            fetchConversations();
        };
        const handleMessageEdited = (updatedData) => {
            setMessages(prev => prev.map(m => m.id === updatedData.id ? { ...m, ...updatedData } : m));
            fetchConversations();
        };
        
        const handleUpdateUserList = (users) => setOnlineUsers(users);
        const handleUserTyping = ({ userId, userName }) => { if (userId === selectedConversation?.id) setTypingInfo({ isTyping: true, user: userName }); };
        const handleUserStopTyping = ({ userId }) => { if (userId === selectedConversation?.id) setTypingInfo({ isTyping: false, user: null }); };
        const handleConnect = () => setIsLoading(false);
        const handleConnectError = (err) => { console.error("Socket error:", err.message); if (err.message.includes('Authentication error')) { localStorage.clear(); router.push('/login'); }};

        socket.on('connect', handleConnect);
        socket.on('updateUserList', handleUpdateUserList);
        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('conversationRead', handleConversationRead);
        socket.on('messageEdited', handleMessageEdited);
        socket.on('userTyping', handleUserTyping);
        socket.on('userStopTyping', handleUserStopTyping);
        socket.on('connect_error', handleConnectError);

        return () => { Object.keys(socket._callbacks).forEach(event => socket.off(event.slice(1))); };
    }, [currentUser, selectedConversation, updateConversationList, fetchConversations, showNotification]);

    useEffect(() => {
        if (!searchTerm.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/users?search=${searchTerm}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok) throw new Error('API returned an error');
                const users = await res.json();
                if (Array.isArray(users)) { const existingConvoIds = new Set(conversations.map(c => c.id)); setSearchResults(users.filter(u => !existingConvoIds.has(u.id))); }
                else { setSearchResults([]); }
            } catch (error) { console.error("Failed to search users:", error); setSearchResults([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, conversations]);

    useEffect(() => { if (messages.length > 0) messageContainerRef.current?.scrollTo({ top: messageContainerRef.current.scrollHeight, behavior: 'auto' }); }, [messages]);
    useEffect(() => { if (editingMessage || replyingTo) inputRef.current?.focus(); }, [editingMessage, replyingTo]);
    
    const handleSelectConversation = useCallback(async (convo) => {
        handleCancelAction();
        setSelectedConversation(convo);
        setMessages([]);
        setFirstUnreadIndex(-1);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/history/${convo.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch history');
            const history = await res.json();
            setMessages(history);

            const convoInState = conversations.find(c => c.id === convo.id);
            const unreadCountOnLoad = convoInState?.unreadCount || 0;
            if (unreadCountOnLoad > 0) {
                const firstUnread = history.findIndex(m => !m.lida && m.senderId === convo.id);
                setFirstUnreadIndex(firstUnread);
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/messages/mark-as-read/${convo.id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                if (socketRef.current) socketRef.current.emit('messagesRead', { readerId: currentUser.id, chatPartnerId: convo.id });
                fetchConversations();
            }
        } catch (error) { console.error(error); }
    }, [conversations, currentUser, fetchConversations]);

    const handleNewConversation = (user) => {
        handleCancelAction();
        const existingConvo = conversations.find(c => c.id === user.id);
        if (existingConvo) { handleSelectConversation(existingConvo); }
        else {
            const newConvo = { id: user.id, nome: user.nome, avatarInitial: user.avatarInitial, funcao: user.funcao };
            setSelectedConversation(newConvo);
            setMessages([]);
            setConversations(prev => [newConvo, ...prev.filter(c => c.id !== user.id)]);
        }
        setSearchTerm('');
        setSearchResults([]);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedConversation || !socketRef.current) return;
        if (editingMessage) {
            socketRef.current.emit('editMessage', { messageId: editingMessage.id, newText: inputValue });
        } else {
            socketRef.current.emit('sendMessage', { recipientId: selectedConversation.id, text: inputValue, replyingTo });
        }
        handleCancelAction();
    };

    const handleReply = (message) => { setReplyingTo(message); setEditingMessage(null); };
    const handleStartEdit = (message) => { setEditingMessage(message); setInputValue(message.text); setReplyingTo(null); };
    const handleCancelAction = () => { setReplyingTo(null); setEditingMessage(null); setInputValue(''); };
    
    if (isLoading || !currentUser) {
        return <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-600"><IconSpinner /><p className="mt-4 font-semibold">Carregando Chat...</p></div>;
    }

    const selectedUserIsOnline = onlineUsers.some(u => u.id === selectedConversation?.id);
    
    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
            <aside className="w-[380px] bg-white p-4 flex flex-col border-r border-gray-200">
                <div className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4 p-2">
                        <Avatar initial={currentUser.nome.charAt(0).toUpperCase()} size="w-12 h-12" />
                        <div><h2 className="text-lg font-bold text-gray-900">{currentUser.nome}</h2><p className="text-sm text-green-600 font-semibold">Online</p></div>
                    </div>
                    <div className="mb-4">
                        <input type="text" placeholder="Buscar ou iniciar conversa" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 rounded-lg bg-gray-100 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b91d32]" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 ? (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Resultados da Busca</h3>
                            <ul className="space-y-1">{searchResults.map(user => (<li key={user.id}><ConversationButton convo={user} isSelected={selectedConversation?.id === user.id} onClick={() => handleNewConversation(user)} currentUserId={currentUser.id} /></li>))}</ul>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Conversas</h3>
                            <ul className="space-y-1">{conversations.map(convo => (<li key={convo.id}><ConversationButton convo={convo} isSelected={selectedConversation?.id === convo.id} isOnline={onlineUsers.some(u => u.id === convo.id)} onClick={() => handleSelectConversation(convo)} currentUserId={currentUser.id}/></li>))}</ul>
                        </div>
                    )}
                </div>
            </aside>
            <main className="flex-1 flex flex-col bg-gray-100 max-h-screen">
                {!selectedConversation ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8"><IconChatBubble /><h2 className="mt-4 text-2xl font-semibold text-gray-700">Bem-vindo ao Chat Zelos</h2><p className="max-w-md">Selecione uma conversa para visualizar o histórico ou inicie uma nova buscando pelo nome de um usuário.</p></div>
                ) : (
                    <>
                        <header className="p-4 bg-white border-b border-gray-200 flex items-center gap-4 shadow-sm flex-shrink-0">
                            <Avatar initial={selectedConversation.avatarInitial} />
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{selectedConversation.nome}</h3>
                                <p className={`text-sm font-semibold capitalize ${selectedUserIsOnline ? 'text-green-600' : 'text-gray-500'}`}>
                                    {selectedUserIsOnline ? "Online" : "Offline"}
                                    {selectedConversation.funcao && ` - ${selectedConversation.funcao}`}
                                </p>
                            </div>
                        </header>
                        <div ref={messageContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                            {messages.map((msg, idx) => (
                                <Fragment key={msg.id || idx}>
                                    {idx === firstUnreadIndex && <UnreadSeparator />}
                                    <MessageBubble msg={msg} isCurrentUser={msg.senderId === currentUser.id} onReply={handleReply} onEdit={handleStartEdit} />
                                </Fragment>
                            ))}
                        </div>
                        <footer className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                           {replyingTo && (
                               <div className="bg-gray-200 p-2 rounded-t-lg text-sm flex justify-between items-center mb-2">
                                   <div className="border-l-2 border-red-500 pl-2">
                                       <p className="font-bold text-gray-700">Respondendo a {replyingTo.senderName}</p>
                                       <p className="text-gray-500 truncate">{replyingTo.text}</p>
                                   </div>
                                   <button onClick={handleCancelAction} className="font-bold text-xl p-1 text-gray-500 hover:text-gray-800">&times;</button>
                               </div>
                           )}
                           {editingMessage && (
                                <div className="bg-blue-100 p-2 rounded-t-lg text-sm flex justify-between items-center mb-2">
                                   <div className="border-l-2 border-blue-500 pl-2"><p className="font-bold text-blue-700">Editando mensagem...</p></div>
                               </div>
                           )}
                           <div className="h-6 text-sm text-gray-500 italic">
                             {typingInfo.isTyping && typingInfo.user === selectedConversation.nome && `${typingInfo.user} está digitando...`}
                           </div>
                           <form onSubmit={handleSubmit} className="relative flex items-center">
                                <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Escreva uma mensagem...`}
                                    className={`w-full p-3 pr-24 rounded-full bg-gray-200 border-transparent focus:outline-none focus:ring-2 focus:ring-[#b91d32] transition-shadow ${editingMessage ? 'ring-2 ring-blue-500' : ''}`} />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                    {editingMessage && <button type="button" onClick={handleCancelAction} className="text-sm text-gray-600 font-semibold mr-3 hover:text-blue-600">Cancelar</button>}
                                    <button type="submit" className="p-2 bg-[#b91d32] rounded-full text-white hover:bg-[#e30914] transition-colors disabled:opacity-50" disabled={!inputValue.trim()}>
                                        {editingMessage ? "Salvar" : <IconSend />}
                                    </button>
                                </div>
                           </form>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
}