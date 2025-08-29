"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";

//  Ícones
const IconExclamacao = () => <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-600 rounded-full"><svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>;
const Iconolho = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const Iconolhofechado = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.67.111 2.458.312M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" /></svg>;
const IconBack = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const IconInfo = () => <svg className="w-12 h-12 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


export default function LoginPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [versenha, setversenha] = useState(false);
  const [esqueci, setesqueci] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const particlesInit = useCallback(async (engine) => await loadSlim(engine), []);
  const particlesOptions = {
    fpsLimit: 120, interactivity: { events: { onHover: { enable: false, mode: "repulse" }, resize: true }, modes: { repulse: { distance: 80, duration: 0.4 } } },
    particles: {
      color: { value: "#e60000" }, links: { color: "#ff4d4d", distance: 150, enable: true, opacity: 0.2, width: 1 },
      move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 3, straight: false },
      number: { density: { enable: true, area: 800 }, value: 80 }, opacity: { value: 0.4 }, shape: { type: "circle" }, size: { value: { min: 1, max: 2 } },
    }, detectRetina: true,
  };

  const handleProximo = (e) => { e.preventDefault(); if (!email) { setError('Por favor, insira seu usuário (RA ou E-mail).'); return; } setError(null); setStep('password'); };
  const handleVoltar = () => { setError(null); setStep('email'); };
  const handleEsqueci = (e) => { e.preventDefault(); setesqueci(true); };

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    if (!senha) { setError('Por favor, insira sua senha.'); return; }
    setIsLoading(true); 
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: email, senha: senha }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao fazer login.');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      const userRole = data.usuario.funcao;
      let redirectPath = '/login'; 
      switch (userRole) {
        case 'admin': redirectPath = '/admin'; break;
        case 'tecnico': redirectPath = '/tecnico'; break;
        case 'usuario': redirectPath = '/user'; break;
        default:
          setError('Função de usuário desconhecida. Contate o administrador.');
          localStorage.clear();
          break;
      }
      if (redirectPath !== '/login') {
        router.push(redirectPath);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Zelos - SENAI-SP</title>
        <link rel="icon" href="/senai-logo.png" />
      </Head>

      <div className="relative flex items-center justify-center w-full h-screen bg-black bg-cover bg-center" style={{ backgroundImage: "url('/fundologin.png')" }}>
        <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="absolute inset-0 z-10" />

        <div className="relative z-20 w-full max-w-md p-12 bg-[#212121]/50 rounded-xl shadow-2xl backdrop-blur-sm">
          <form onSubmit={step === 'email' ? handleProximo : handleSubmit}>
            {step === 'email' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-left"><h1 className="text-3xl font-bold text-white">Login</h1><p className="mt-2 text-gray-300">Bem-vindo(a) ao Portal Zelos - SENAI</p></div>
                {error && (<div className="flex items-center gap-3 p-3 mt-4 text-sm bg-[#ffd3d8] text-black rounded-lg"><IconExclamacao /><span>{error}</span></div>)}
                <div>
                  <label htmlFor="user-input" className="block mb-2 text-sm font-medium text-gray-200">Usuário</label>
                  <input id="user-input" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Insira seu RA ou e-mail" className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3b3b3b] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-200" />
                </div>
                <button type="submit" className="w-full py-3 font-semibold text-white bg-[#e20814] rounded-md shadow-md transition-colors duration-300 hover:bg-red-700">Avançar</button>
              </div>
            )}
            {step === 'password' && (
              <div className="space-y-6 animate-fade-in">
                <button type="button" onClick={handleVoltar} className="flex items-center justify-center w-10 h-10 mb-4 bg-red-600 rounded-full hover:bg-red-700 transition-colors"><IconBack /></button>
                <div className="text-left"><h1 className="text-2xl font-bold text-white">Digite sua senha</h1><p className="mt-1 text-gray-400 break-words">{email}</p></div>
                {error && (<div className="flex items-center gap-3 p-3 text-sm bg-[#ffd3d8] text-black rounded-lg"><IconExclamacao /><span>{error}</span></div>)}
                <div><label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-200">Senha</label><div className="relative"><input id="senha" type={versenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Digite sua senha" className="password-input w-full pr-12 pl-4 py-3 bg-[#2a2a2a] border border-[#3b3b3b] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors duration-200" /><button type="button" onClick={() => setversenha(!versenha)} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white">{versenha ? <Iconolhofechado /> : <Iconolho />}</button></div></div>
                <button type="submit" disabled={isLoading} className="w-full py-3 font-semibold text-white bg-[#e20814] rounded-md shadow-md transition-colors duration-300 hover:bg-red-700 disabled:bg-red-900">{isLoading ? 'Entrando...' : 'Acessar'}</button>
                <div className="text-center pt-2"><a href="#" onClick={handleEsqueci} className="text-base text-gray-400 hover:text-white transition-colors">Esqueceu a sua senha?</a></div>
              </div>
            )}
          </form>
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 text-center text-white text-md z-20">
            © SENAI-SP - 2025
        </div>
      </div>
      
      {esqueci && (
         
          <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start pt-20 p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center animate-fade-in-down border border-gray-700">
              <IconInfo />
              <h3 className="text-xl font-bold text-white mt-4 mb-2">Recuperação de Senha</h3>
              <p className="text-gray-300 text-sm">
                Para redefinir sua senha, por favor, entre em contato com a secretaria ou um administrador do sistema.
              </p>
              <button
                onClick={() => setesqueci(false)}
                className="mt-6 w-full px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
        <style jsx global>{`
          .password-input::-ms-reveal,
          .password-input::-ms-clear {
            display: none;
          }
          .password-input::-webkit-credentials-auto-fill-button {
            visibility: hidden;
            display: none !important;
            pointer-events: none;
          }
        `}</style>
    </>
  );
}