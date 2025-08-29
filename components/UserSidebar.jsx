// frontend/components/UserSidebar.jsx
"use client";

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

// ÍCONES 
const IconClipboardList = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconClock = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const IconChevronUp = ({ className }) => <svg className={`w-5 h-5 transition-transform ${className}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>;
const IconBriefcase = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconBookOpen = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const IconPencilAlt = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const IconYouTube = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.615 3.184a.75.75 0 00-.563-.424C17.522 2.5 12 2.5 12 2.5s-5.522 0-7.052.26a.75.75 0 00-.563.424C3.125 4.888 2.5 8.125 2.5 12s.625 7.112 1.885 8.816a.75.75 0 00.563.424C6.478 21.5 12 21.5 12 21.5s5.522 0 7.052-.26a.75.75 0 00.563-.424C20.875 19.112 21.5 15.875 21.5 12s-.625-7.112-1.885-8.816zM9.5 15.584V8.416a.5.5 0 01.77-.42l5.576 3.583a.5.5 0 010 .84l-5.576 3.584a.5.5 0 01-.77-.42z" clipRule="evenodd"></path></svg>;
const IconInstagram = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.5-8.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd"></path></svg>;
const IconFacebook = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>;
const IconTwitter = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>

export default function UserSidebar() {
    const [isDropUpOpen, setDropUpOpen] = useState(false);
    const dropUpRef = useRef(null);
    const pathname = usePathname();

    const navItems = [
        { name: "Meus Chamados", href: "/user", icon: <IconClipboardList /> },
        { name: "Apontamentos", href: "/user/apontamento", icon: <IconClock /> },
        { name: "Chat", href: "/user/chat", icon: <IconChat /> },
    ];
    
    const portalLinks = [
        { name: "Secretaria Digital", href: "#", icon: <IconPencilAlt /> },
        { name: "Biblioteca", href: "#", icon: <IconBookOpen /> },
        { name: "Portal de Vagas", href: "#", icon: <IconBriefcase /> },
    ];

    useEffect(() => {
        function handleClickOutside(event) { if (dropUpRef.current && !dropUpRef.current.contains(event.target)) setDropUpOpen(false); }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <aside className="w-64 bg-gray-50 text-gray-700 flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-gray-200">
            <div>
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <a key={item.name} href={item.href}
                               className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 
                                ${isActive ? 'bg-red-100 text-red-700 font-semibold border-l-4 border-red-600' : 'border-l-4 border-transparent text-gray-500 hover:bg-gray-200'}`}>
                               {item.icon}
                               <span>{item.name}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>
            
            <div className='flex flex-col'>
                <div className="p-1 border-t border-gray-200">
                    <div ref={dropUpRef} className="relative">
                         {isDropUpOpen && (
                             <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200">
                                 <ul className="p-2 space-y-1">
                                     {portalLinks.map(link => (
                                         <li key={link.name}>
                                            <a href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-2 text-sm rounded-md text-gray-600 hover:bg-gray-100">{link.icon}{link.name}</a>
                                        </li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                         <button onClick={() => setDropUpOpen(!isDropUpOpen)} className="w-full flex items-center justify-between p-3 text-left rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                            <span>Outros Portais</span><IconChevronUp className={`transition-transform duration-300 text-gray-500 ${isDropUpOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div>
                        <h4 className="font-semibold text-sm text-gray-500">Escola SENAI</h4>
                        <p className="text-xs text-gray-500">"Armando de Arruda Pereira"</p>
                    </div>
                    <div className="pt-1 mt-2 space-y-1 text-xs">
                        <p className="text-gray-600">
                            <strong className="text-gray-500 font-medium">Telefone:</strong> (11) 4227-7450
                        </p>
                        <p className="text-gray-600">
                            <strong className="text-gray-500 font-medium">Email:</strong> senai.scs@sp.senai.br
                        </p>
                    </div>
                    <div className="pt-4 mt-4 flex justify-center items-center gap-4 border-t border-gray-200">
                        <a href="https://youtu.be/xvFZjo5PgG0?si=vbf1lNNazWvn-6Pr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors" title="YouTube"><IconYouTube/></a>
                        <a href="" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" title="Instagram"><IconInstagram/></a>
                        <a href="" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" title="Facebook"><IconFacebook/></a>
                        <a href="" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors" title="Twitter (X)"><IconTwitter/></a>
                    </div>
                     <div className="mt-4 pt-2 text-center">
                         <p className="text-xs text-gray-500">© {new Date().getFullYear()} Zelos</p>
                     </div>
                </div>
            </div>
        </aside>
    );
}