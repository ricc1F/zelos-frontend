"use client";

import UserSidebar from "../../components/UserSidebar";
import Navbar from "../../components/LightNavbar";
import { SearchProvider } from "../../app/context/SearchContet";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('usuario'));
        if (storedUser) {
            setUser(storedUser);
        } else {

            router.push('/login');
        }
    }, [router]);


    if (!user) {
        return <div className="h-screen w-full bg-white flex items-center justify-center">Carregando...</div>;
    }

    return (
        <SearchProvider>

            <div className="flex flex-col h-screen bg-gray-100 text-gray-800 font-sans">

                <Navbar user={user} />

                <div className="flex flex-1 overflow-hidden">

                    <UserSidebar />


                    <div className="flex-1 flex flex-col overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </SearchProvider>
    );
}