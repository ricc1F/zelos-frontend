"use client";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar"; 
import { SearchProvider } from "../../app/context/SearchContet";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('usuario'));
      
        if (storedUser && storedUser.funcao === 'admin') {
            setUser(storedUser);
            setIsAuthenticated(true);
        } else {
            router.push('/login');
        }
    }, [router]);
    
    
    if (!isAuthenticated) {
        return null;
    }
    
    return (
        <SearchProvider>
            <div className="flex flex-col h-screen bg-black text-gray-200 font-sans">
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