
"use client"; 
import { useRouter } from 'next/navigation'; 
export default function LogoutButton() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

  const handleLogout = async () => {
    try {
    
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', }
      });
      

      localStorage.removeItem('token');
      localStorage.removeItem('usuario'); 

      console.log('Logout realizado com sucesso. Token e dados do usuário removidos.');

      router.push('/');
    } catch (error) {
      console.error('Erro ao tentar logout (mas deslogando localmente):', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
    >
      Sair
    </button>
  );
}