"use client";

import { useState, useEffect, useCallback, useMemo, Fragment, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { useSearch } from '../../context/SearchContet';
import ChatBot from "../../ChatBot";

//  Ícones 
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconClipboardCheck = () => <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconUserCheck = () => <svg className="w-12 h-12 text-yellow-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


//  Componentes  
function Toast({ show, message, type, onclose }) {
    if (!show) return null;
    return (
        <div className={`fixed bottom-5 right-5 z-[100] w-auto max-w-sm flex items-center gap-3 p-4 rounded-lg shadow-2xl border ${type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} text-white animate-slide-in-up`}>
            <IconCheckCircle />
            <span className="flex-grow">{message}</span>
            <button onClick={onclose} className="p-1 rounded-full hover:bg-black/20 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

const StatusBadge = ({ status }) => (<span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-600/20 text-purple-300 border border-purple-500">{status.replace(/_/g, ' ')}</span>);
const CompetencyBadge = ({ competencia }) => (<span className="px-2 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md">{competencia.replace(/_/g, ' ')}</span>);


export default function AprovacoesPage() {
    const { searchTerm } = useSearch();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [chamadosAprovacao, setChamadosAprovacao] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [chamadosAtribuidos, setChamadosAtribuidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChamado, setSelectedChamado] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimerRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        clearTimeout(toastTimerRef.current);
        setToast({ show: true, message, type });
        toastTimerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const [aprovacoesRes, tecnicosRes, atribuidosRes] = await Promise.all([
                fetch(`${apiUrl}/chamados?status=Aguardando aprovação`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/usuarios?funcao=tecnico`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/chamados?status=Em andamento`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!aprovacoesRes.ok || !tecnicosRes.ok || !atribuidosRes.ok) {
                throw new Error('Falha ao buscar dados do painel de aprovações.');
            }

            const [aprovacoesData, tecnicosData, atribuidosData] = await Promise.all([
                aprovacoesRes.json(),
                tecnicosRes.json(),
                atribuidosRes.json()
            ]);

            setChamadosAprovacao(aprovacoesData);
            setTecnicos(tecnicosData);
            setChamadosAtribuidos(atribuidosData);

        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, router, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (chamado) => setSelectedChamado(chamado);
    const handleCloseModal = () => setSelectedChamado(null);

    const handleConcluir = async (chamadoId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/chamados/${chamadoId}/concluir`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error((await res.json()).message);
            showToast('Chamado aprovado e concluído!');
            handleCloseModal();
            fetchData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const filteredAprovacoes = useMemo(() =>
        chamadosAprovacao.filter(c => !searchTerm ||
            c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nome_equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.nome_tecnico?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [chamadosAprovacao, searchTerm]);

    const technicianStats = useMemo(() => {
        const assignedCounts = chamadosAtribuidos.reduce((acc, chamado) => {
            if (chamado.tecnico_id) {
                acc[chamado.tecnico_id] = (acc[chamado.tecnico_id] || 0) + 1;
            }
            return acc;
        }, {});
        return tecnicos.map(tec => ({ ...tec, assignedCount: assignedCounts[tec.id] || 0 })).sort((a, b) => a.nome.localeCompare(b.nome));
    }, [tecnicos, chamadosAtribuidos]);

    return (
        <>
            <Toast show={toast.show} message={toast.message} type={toast.type} onclose={() => setToast({ show: false })} />

            <main className="flex-1 flex flex-col bg-gray-900/50 h-full overflow-hidden">
                <div className="p-6 bg-[#1f1f1f] border-b border-gray-800 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Painel de Aprovações</h2>
                    <p className="text-sm text-gray-400 mt-1">Revise as soluções propostas e acompanhe a carga de trabalho dos técnicos.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1 bg-[#1a1a1a] border border-gray-700/50 p-6 rounded-lg text-center flex flex-col justify-center">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Aprovações Pendentes</h3>
                                <p className="text-5xl font-bold text-yellow-400 mt-2">{isLoading ? '-' : chamadosAprovacao.length}</p>
                            </div>
                            <div className="lg:col-span-3 bg-[#1a1a1a] border border-gray-700/50 p-6 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Status da Equipe Técnica</h4>
                                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                    {isLoading ? <p className="text-xs text-gray-500">Carregando...</p> :
                                        technicianStats.map(tec => (
                                            <div key={tec.id} className="flex-shrink-0 w-64 bg-[#2a2a2a] rounded-lg border border-gray-700 p-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-white truncate">{tec.nome}</p>
                                                    <div className="text-center flex-shrink-0 ml-2">
                                                        <p className="text-2xl font-bold text-blue-400">{tec.assignedCount}</p>
                                                        <p className="text-xs text-gray-500 -mt-1">Ativos</p>
                                                    </div>
                                                </div>
                                                {tec.competencias.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                                                        <div className="flex flex-wrap gap-1">
                                                            {tec.competencias.map(c => <CompetencyBadge key={c} competencia={c} />)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='px-6'>
                        <hr className="border-gray-800" />
                    </div>

                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">Chamados Aguardando Sua Aprovação</h3>
                        {isLoading ? (<p className="text-center text-gray-400">Carregando...</p>) : filteredAprovacoes.length > 0 ? (

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                                {filteredAprovacoes.map(c => (

                                    <div key={c.id} onClick={() => handleOpenModal(c)} className="bg-[#1a1a1a] border border-gray-700/50 p-5 rounded-lg flex flex-col justify-between space-y-4 cursor-pointer transition-all hover:border-red-600 hover:-translate-y-1 min-h-[230px]">
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-3">
                                                <StatusBadge status={c.status} />
                                                <span className="font-mono text-xs text-gray-500">#{c.id}</span>
                                            </div>
                                            <p className="font-semibold text-white break-words">{c.nome_equipamento || 'Serviço Geral'}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {c.nome_equipamento ? `Pat: ${c.patrimonio_numero}` : 'Sem equipamento'}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                                <strong className='font-medium text-gray-300'>Problema:</strong> {c.descricao}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-3 mt-auto space-y-1">
                                            <p><strong>Técnico:</strong> {c.nome_tecnico || 'N/A'}</p>
                                            <p><strong>Enviado em:</strong> {new Date(c.atualizado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-16">
                            <IconClipboardCheck />
                            <p className="mt-4 text-lg font-semibold text-gray-400">Nenhuma aprovação pendente</p>
                            <p className="text-sm mt-1">Todos os chamados estão em dia.</p>
                        </div>
                        )}
                    </div>
                </div>
            </main>

            {selectedChamado && <AprovacaoModal chamado={selectedChamado} isOpen={!!selectedChamado} onClose={handleCloseModal} onConcluir={handleConcluir} apiUrl={apiUrl} />}
            <ChatBot />
        </>
    );
}

function AprovacaoModal({ isOpen, onClose, chamado, onConcluir, apiUrl }) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" }}><div className="fixed inset-0 bg-black/70 backdrop-blur-sm" /></Transition.Child>
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95" }}>
                        <Dialog.Panel className="bg-[#1c1c1c] p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700">
                            <div className="text-center mb-4">
                                <IconUserCheck />
                                <Dialog.Title className="text-2xl font-bold mt-2 text-white">Analisar Chamado <span className="font-mono text-gray-400">#{chamado.id}</span></Dialog.Title>
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-4 text-gray-300 space-y-4">
                                <div><strong className="text-gray-400 text-sm">Problema Reportado:</strong><p className="p-3 bg-black/20 rounded-md text-sm mt-1">{chamado.descricao}</p></div>
                                <div>
                                    <strong className="text-yellow-400 text-sm">Solução Proposta por {chamado.nome_tecnico}:</strong>
                                    <div className="p-3 bg-yellow-900/20 text-yellow-200 rounded-md text-sm mt-1">{chamado.solucao}</div>
                                </div>
                                {chamado.anexos_solucao && JSON.parse(chamado.anexos_solucao).length > 0 && (
                                    <div>
                                        <strong className="text-gray-400 text-sm">Anexos da Solução:</strong>
                                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {JSON.parse(chamado.anexos_solucao).map(anexo => (
                                                <a key={anexo} href={`${apiUrl}/uploads/${anexo}`} target="_blank" rel="noopener noreferrer" className="relative aspect-square block group transition-transform hover:scale-105">
                                                    <Image src={`${apiUrl}/uploads/${anexo}`} alt="Anexo da solução" fill className="object-cover rounded-md" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 flex items-center justify-end gap-4 pt-6 mt-4 border-t border-gray-700">
                                <button type="button" onClick={onClose} className="btn-secondary">Voltar</button>
                                <button type="button" onClick={() => onConcluir(chamado.id)} className="btn-primary-green">Aprovar e Concluir</button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}