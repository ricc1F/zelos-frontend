// frontend/app/tecnico/apontamentos/page.jsx
"use client";

import { useState, useEffect, useCallback, useMemo, Fragment, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContet';
import { Dialog, Transition } from '@headlessui/react';
import ChatBot from "../../ChatBot";

// Ícones 
const IconPlus = () => <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconChevronDown = ({ className }) => <svg className={`w-5 h-5 transition-transform duration-300 text-gray-500 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const IconClipboardCheck = () => <svg className="w-16 h-16 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const IconArrowRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;


// Componentes 
function Toast({ show, message, type, onclose }) {
    if (!show) return null;
    return (
        <div className={`fixed bottom-5 right-5 z-[100] w-auto max-w-sm flex items-center gap-3 p-4 rounded-lg shadow-2xl border ${type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} text-white animate-slide-in-up`}>
            <IconCheckCircle />
            <span className="flex-grow">{message}</span>
            <button onClick={onclose} className="p-1 rounded-full hover:bg-black/20 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
    );
}

const StatusBadge = ({ status }) => { const styles = { 'Aberto': 'bg-blue-100 text-blue-700 border-blue-300', 'Em andamento': 'bg-yellow-100 text-yellow-700 border-yellow-300', 'Concluido': 'bg-green-100 text-green-700 border-green-300' }; return <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{status}</span>; };


export default function TecnicoApontamentosPage() {
    const { searchTerm } = useSearch();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [chamados, setChamados] = useState([]);
    const [apontamentos, setApontamentos] = useState({});
    const [openChamados, setOpenChamados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ status: '', dataInicio: '', dataFim: '' });

    const [selectedChamado, setSelectedChamado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimerRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => {
        clearTimeout(toastTimerRef.current);
        setToast({ show: true, message, type });
        toastTimerRef.current = setTimeout(() => setToast({ show: false, message: '', type }), 5000);
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        try {
            const chamadosRes = await fetch(`${apiUrl}/chamados`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!chamadosRes.ok) throw new Error('Falha ao buscar seus chamados.');
            const chamadosData = await chamadosRes.json();
            setChamados(chamadosData);

            if (chamadosData.length > 0) {
                const apontamentosPromises = chamadosData.map(c =>
                    fetch(`${apiUrl}/chamados/${c.id}/apontamentos`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : [])
                );
                const apontamentosArrays = await Promise.all(apontamentosPromises);

                const apontamentosMap = {};
                chamadosData.forEach((chamado, index) => {
                    apontamentosMap[chamado.id] = apontamentosArrays[index];
                });
                setApontamentos(apontamentosMap);
            }
        } catch (err) { console.error(err.message); showToast(err.message, 'error'); }
        finally { setIsLoading(false); }
    }, [apiUrl, router, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSuccess = (message) => {
        showToast(message);
        setIsModalOpen(false);
        fetchData();
    };

    const processedChamados = useMemo(() => {
        let filtered = chamados
            .map(c => ({ ...c, apontamentos: apontamentos[c.id] || [] }))
            .filter(c => c.status === 'Em andamento' || c.apontamentos.length > 0);

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.nome_equipamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(c.id).includes(searchTerm)
            );
        }

        if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
        if (filters.dataInicio) filtered = filtered.filter(c => new Date(c.criado_em) >= new Date(`${filters.dataInicio}T00:00:00`));
        if (filters.dataFim) filtered = filtered.filter(c => new Date(c.criado_em) <= new Date(`${filters.dataFim}T23:59:59`));

        const statusOrder = { 'Em andamento': 1, 'Concluido': 2 };
        filtered.sort((a, b) => (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3) || new Date(b.criado_em) - new Date(a.criado_em));

        return filtered;
    }, [chamados, apontamentos, searchTerm, filters]);

    const chamadosAtivos = processedChamados.filter(c => c.status === 'Em andamento');
    const chamadosConcluidos = processedChamados.filter(c => c.status === 'Concluido');

    const handleToggleApontamentos = (chamadoId) => {
        setOpenChamados(prev => prev.includes(chamadoId) ? prev.filter(id => id !== chamadoId) : [...prev, chamadoId]);
        if (!pagination[chamadoId]) setPagination(prev => ({ ...prev, [chamadoId]: 1 }));
    };

    const handlePageChange = (chamadoId, newPage) => setPagination(prev => ({ ...prev, [chamadoId]: newPage }));

    const handleOpenModal = (chamado) => {
        setSelectedChamado(chamado);
        setIsModalOpen(true);
    };

    return (
        <>
            <Toast show={toast.show} message={toast.message} type={toast.type} onclose={() => setToast({ show: false })} />
            <main className="flex-1 flex flex-col bg-gray-100 h-full overflow-hidden">
                <div className="p-4 sm:p-6 bg-white border-b border-gray-200 space-y-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciar Atividades dos Chamados</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-xs text-gray-500">Status</label>
                            <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="input-style h-11 mt-1">
                                <option value="">Todos os Status</option>
                                <option value="Em andamento">Em Andamento</option>
                                <option value="Concluido">Concluído</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Criados desde</label>
                            <input type="date" value={filters.dataInicio} onChange={e => setFilters(p => ({ ...p, dataInicio: e.target.value }))} className="input-style h-11 mt-1" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Criados até</label>
                            <input type="date" value={filters.dataFim} onChange={e => setFilters(p => ({ ...p, dataFim: e.target.value }))} className="input-style h-11 mt-1" />
                        </div>
                        <div>
                            <button onClick={() => setFilters({ status: '', dataInicio: '', dataFim: '' })} className="btn-secondary w-full h-11">Limpar Filtros</button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    {isLoading ? <p className="text-center text-gray-500 py-10">Carregando...</p> :
                        processedChamados.length > 0 ? (
                            <div className='space-y-6'>
                                {chamadosAtivos.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-yellow-600 mb-3">Em Andamento</h3>
                                        <div className="space-y-3">{chamadosAtivos.map(c => <ChamadoCard key={c.id} chamado={c} pagination={pagination} onToggle={handleToggleApontamentos} onPageChange={handlePageChange} openChamados={openChamados} onOpenModal={handleOpenModal} />)}</div>
                                    </div>
                                )}
                                {chamadosConcluidos.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-600 mb-3 pt-4 border-t border-gray-200">Concluídos</h3>
                                        <div className="space-y-3">{chamadosConcluidos.map(c => <ChamadoCard key={c.id} chamado={c} pagination={pagination} onToggle={handleToggleApontamentos} onPageChange={handlePageChange} openChamados={openChamados} onOpenModal={handleOpenModal} />)}</div>
                                    </div>
                                )}
                            </div>
                        ) : <div className="flex items-center justify-center h-full"><div className="text-center text-gray-500"><IconClipboardCheck /><p className="mt-4 font-semibold text-gray-700">Nenhum Chamado Encontrado</p><p className="text-sm">Tente ajustar seus filtros ou aguarde novos chamados.</p></div></div>}
                </div>
            </main>

            <AddApontamentoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} chamado={selectedChamado} onSuccess={handleSuccess} showToast={showToast} apiUrl={apiUrl} />
        
            <ChatBot />
        </>
    );
}


function ChamadoCard({ chamado, pagination, onToggle, onPageChange, openChamados, onOpenModal }) {
    const ITEMS_PER_PAGE = 5;
    const currentPage = pagination[chamado.id] || 1;
    const totalPages = Math.ceil(chamado.apontamentos.length / ITEMS_PER_PAGE);
    const paginatedApontamentos = [...chamado.apontamentos].reverse().slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const isOpen = openChamados.includes(chamado.id);

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 shadow-sm">
            <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => onToggle(chamado.id)}>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-gray-800">{chamado.nome_equipamento || chamado.descricao}</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">#{chamado.id}</p>
                    </div>
                    <div>
                        <strong className="block text-gray-500 text-xs mb-1">Solicitante</strong>
                        <span className='text-gray-700'>{chamado.nome_solicitante || 'N/D'}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500 text-xs mb-1">Status</strong>
                        <StatusBadge status={chamado.status} />
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center gap-4">
                    {chamado.status === 'Em andamento' && (
                        <button onClick={(e) => { e.stopPropagation(); onOpenModal(chamado); }} className="btn-primary flex items-center px-3 py-1 text-sm">
                            <IconPlus /> Adicionar
                        </button>
                    )}
                    <IconChevronDown className={isOpen ? 'rotate-180' : ''} />
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-gray-200 p-4 bg-gray-50/50 animate-fade-in">
                    {chamado.apontamentos.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-4 py-2">Atividade Realizada</th>
                                            <th scope="col" className="px-4 py-2">Autor</th>
                                            <th scope="col" className="px-4 py-2 text-center">Duração (min)</th>
                                            <th scope="col" className="px-4 py-2">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedApontamentos.map(ap => (
                                            <tr key={ap.id} className="border-b last:border-0 border-gray-200">
                                                <td className="px-4 py-3 text-gray-600">{ap.descricao}</td>
                                                <td className="px-4 py-3 text-gray-800">{ap.nome_tecnico}</td>
                                                <td className="px-4 py-3 text-gray-600 text-center">{ap.duracao || '-'}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{new Date(ap.comeco).toLocaleString('pt-BR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 mt-2">
                                    <button onClick={() => onPageChange(chamado.id, currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"><IconArrowLeft /></button>
                                    <span className="text-sm font-semibold text-gray-600">Página {currentPage} de {totalPages}</span>
                                    <button onClick={() => onPageChange(chamado.id, currentPage + 1)} disabled={currentPage >= totalPages} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"><IconArrowRight /></button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-center text-xs text-gray-500 py-4">Nenhum apontamento registrado para este chamado ainda.</p>
                    )}
                </div>
            )}
        </div>
    );
}


function AddApontamentoModal({ isOpen, onClose, chamado, onSuccess, showToast, apiUrl }) {
    const [apontamentoData, setApontamentoData] = useState({ descricao: '', comeco: '', fim: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setApontamentoData({ descricao: '', comeco: '', fim: '' });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApontamentoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!apontamentoData.descricao || !apontamentoData.comeco || !apontamentoData.fim) {
            showToast("Todos os campos são obrigatórios.", 'error'); return;
        }
        if (new Date(apontamentoData.fim) < new Date(apontamentoData.comeco)) {
            showToast("A data final não pode ser anterior à data de início.", 'error'); return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/chamados/${chamado.id}/apontamentos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...apontamentoData })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao salvar.");
            }
            onSuccess('Apontamento adicionado com sucesso!');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" }}>
                    <div className="fixed inset-0 bg-black/70" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95" }}>
                        <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-xl transition-all">
                            <form onSubmit={handleSubmit}>
                                <Dialog.Title className="text-xl font-bold leading-6 text-gray-900">Adicionar Apontamento</Dialog.Title>
                                <p className="text-sm text-gray-500 mt-1">Para o chamado #{chamado?.id}</p>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-600">Descrição da Atividade</label>
                                        <textarea required name="descricao" value={apontamentoData.descricao} onChange={handleChange} className="input-style h-24" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium mb-1 text-gray-600">Início</label><input required type="datetime-local" name="comeco" value={apontamentoData.comeco} onChange={handleChange} className="input-style" /></div>
                                        <div><label className="block text-sm font-medium mb-1 text-gray-600">Fim</label><input required type="datetime-local" name="fim" value={apontamentoData.fim} onChange={handleChange} className="input-style" /></div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-4">
                                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar Apontamento'}</button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
}