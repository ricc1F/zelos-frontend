"use client";

import Sidebar from "../../components/TecnicoSidebar";
import Navbar from "../../components/LightNavbar"; 
import { SearchProvider } from "../../app/context/SearchContet";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TecnicoLayout({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();
    
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('usuario'));
        if (storedUser && (storedUser.funcao === 'tecnico' || storedUser.funcao === 'admin')) {
            setUser(storedUser);
        } else {
            router.push('/login');
        }
    }, [router]);
    
    if (!user) {
        return null; 
    }

    return (
        <SearchProvider>
            <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
                <Navbar user={user} />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {children} 
                    </div>
                </div>
            </div>
        </SearchProvider>
    );
}
