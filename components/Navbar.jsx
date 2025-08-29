// frontend/components/Navbar.jsx
"use client";
import { Fragment, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../app/context/SearchContet';

//  Ícones 
const IconSearch = () => <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
const IconBell = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const IconChevronDown = () => <svg className="w-5 h-5 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const IconBellOff = () => ( <div   className="w-10 h-10 mx-auto bg-contain bg-no-repeat bg-center"   style={{ backgroundImage: "url('/icons/bell-off.png')" }} ></div>);

export default function Navbar({ user }) {
    const { searchTerm, setSearchTerm } = useSearch();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const unreadCount = notifications.filter(n => !n.lida).length;

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token || !apiUrl) return;
        try {
            const res = await fetch(`${apiUrl}/notificacao`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setNotifications(await res.json());
        } catch (error) { console.error("Erro ao buscar notificações:", error); }
    }, [apiUrl]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNotificationClick = async () => {
        const currentlyOpen = isNotificationsOpen;
        setNotificationsOpen(!currentlyOpen);

        if (!currentlyOpen && unreadCount > 0) {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                await fetch(`${apiUrl}/notificacao/lida`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                setNotifications(notifications.map(n => ({...n, lida: true})));
            } catch (error) { console.error("Erro ao marcar notificações como lidas:", error); }
        }
    };
    
    const handleItemClick = (link) => {
        if(link) {
            router.push(link);
            setNotificationsOpen(false); 
        }
    };

    const getInitials = (name = '') => (name.split(' ').map(n => n[0]).join('')).substring(0, 2).toUpperCase();

    return (
        <header className="flex-shrink-0 bg-[#1f1f1f] shadow-lg shadow-black/20 z-20">
            <div className="flex items-center justify-between h-20 px-6">
                
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Image src="/senai-logo-branca.png" alt="Logo SENAI" width={100} height={40} priority />
                    <span className="border-l border-gray-600 h-6"></span>
                    <h1 className="text-xl font-bold text-gray-200">ZELOS</h1>
                </div>

                <div className="flex-1 flex justify-center px-4 lg:px-6">
                     <div className="relative w-full max-w-lg">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><IconSearch /></div>
                        <input type="text" placeholder="Pesquisar por patrimônio, descrição, status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white" />
                    </div>
                </div>

                <div className="flex items-center gap-8 flex-shrink-0">
                    <div className="relative">
                        <button onClick={handleNotificationClick} className="relative text-gray-400 hover:text-white transition-colors">
                            <IconBell />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white ring-2 ring-[#1f1f1f]">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <Transition
                            show={isNotificationsOpen}
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute right-0 mt-3 w-96 origin-top-right bg-[#1f1f1f] rounded-lg shadow-xl border border-gray-700">
                                <div className="p-4 font-bold border-b border-gray-700 text-white">Notificações</div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} onClick={() => handleItemClick(notif.link)} className={`flex items-start gap-3 p-4 border-b border-gray-700/50 last:border-b-0 transition-colors ${notif.link ? 'cursor-pointer hover:bg-gray-700/50' : 'cursor-default'}`}>
                                                <div className="flex-shrink-0 w-2.5 h-2.5 mt-1.5">
                                                  {!notif.lida && (<div className="w-full h-full rounded-full bg-red-500"></div>)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-200 leading-tight">{notif.mensagem}</p>
                                                    <span className="text-xs text-gray-500 mt-1 block">{new Date(notif.criado_em).toLocaleString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <IconBellOff/>
                                            <p className="mt-4 text-sm font-semibold text-gray-300">Caixa de entrada vazia</p>
                                            <p className="mt-1 text-xs text-gray-500">Você não tem novas notificações.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Transition>
                    </div>
                    
                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center text-left">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-800 flex items-center justify-center font-bold text-white">{getInitials(user?.nome)}</div>
                            <div className="ml-3 hidden md:block">
                                <p className="text-sm font-semibold text-white">{user?.nome}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.funcao}</p>
                            </div>
                            <IconChevronDown />
                        </Menu.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-[#1f1f1f] rounded-md shadow-lg border border-gray-700">
                                <div className="p-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                          <button onClick={() => { localStorage.clear(); router.push('/login');}} className={`${active ? 'bg-red-600 text-white' : 'text-gray-300'} group flex rounded-md items-center w-full px-2 py-2 text-sm transition-colors`}>Sair</button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>
        </header>
    );
}