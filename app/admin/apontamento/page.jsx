"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContet';
import ChatBot from "../../ChatBot";

//  Ícones 
const IconChevronDown = ({ className }) => <svg className={`w-5 h-5 transition-transform duration-300 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const IconPlus = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const IconArrowRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const IconClipboardCheck = () => <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconExclamationCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

//  Componentes 
const StatusBadge = ({ status }) => { const styles = { 'Pendente': 'bg-blue-600/20 text-blue-300 border-blue-500', 'Aberto': 'bg-blue-600/20 text-blue-300 border-blue-500', 'Em andamento': 'bg-yellow-600/20 text-yellow-300 border-yellow-500', 'Concluido': 'bg-green-600/20 text-green-300 border-green-500' }; return <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[status] || 'bg-gray-600/20'}`}>{status}</span>; };

function Toast({ message, type, onclose }) {
    return (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg shadow-2xl border text-white ${type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} animate-fade-in`}>
            {type === 'success' ? <IconCheckCircle /> : <IconExclamationCircle />}
            <span>{message}</span>
            <button onClick={onclose} className="ml-4">&times;</button>
        </div>
    );
}

export default function ApontamentosPage() {
    //  Estados 
    const { searchTerm } = useSearch();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [enrichedChamados, setEnrichedChamados] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [openChamados, setOpenChamados] = useState([]); 
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedChamado, setSelectedChamado] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [newApontamento, setNewApontamento] = useState({ descricao: '', comeco: '', fim: '' });
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ status: '', tecnicoId: '', dataInicio: '', dataFim: '' });

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimerRef = useRef(null);
    const showToast = (message, type = 'success') => { clearTimeout(toastTimerRef.current); setToast({ show: true, message, type }); toastTimerRef.current = setTimeout(() => setToast({ show: false, message: '', type }), 4000); };
    
    const inputStyles = "w-full bg-[#2a2a2a] p-2 rounded text-sm text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200";

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        setIsLoading(true);
        try {
            const [apontamentosRes, chamadosRes, tecnicosRes] = await Promise.all([
                fetch(`${apiUrl}/apontamentos`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/chamados`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (apontamentosRes.status === 403) throw new Error('Acesso Proibido.');
            if (!apontamentosRes.ok || !chamadosRes.ok || !tecnicosRes.ok) throw new Error('Falha ao buscar dados.');

            const apontamentosData = await apontamentosRes.json();
            const chamadosData = await chamadosRes.json();
            const tecnicosData = await tecnicosRes.json();
            setTecnicos(tecnicosData.filter(u => u.funcao === 'tecnico'));

            const grouped = apontamentosData.reduce((acc, ap) => {
                const { chamado_id, tecnico_id } = ap; 
                if (!acc[chamado_id]) { acc[chamado_id] = { chamado_id, apontamentos: [], tecnicosEnvolvidos: new Set() }; }
                acc[chamado_id].apontamentos.push(ap);
                if(tecnico_id) acc[chamado_id].tecnicosEnvolvidos.add(tecnico_id);
                return acc;
            }, {});

            const enriched = Object.values(grouped).map(group => {
                const detalhes = chamadosData.find(c => c.id === group.chamado_id);
                const tecnicos_ids = Array.from(group.tecnicosEnvolvidos);
                return { ...group, ...detalhes, tecnicos_ids };
            }).filter(item => item.id);

            setEnrichedChamados(enriched);
            setError(null);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    }, [apiUrl, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const processedChamados = useMemo(() => {
        let filtered = enrichedChamados.filter(c => c.status === 'Em andamento' || c.status === 'Concluido');
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(chamado =>
                chamado.descricao?.toLowerCase().includes(lowerCaseSearch) ||
                chamado.nome_equipamento?.toLowerCase().includes(lowerCaseSearch) ||
                String(chamado.id).includes(lowerCaseSearch) ||
                String(chamado.patrimonio_numero).toLowerCase().includes(lowerCaseSearch) ||
                chamado.apontamentos.some(ap => ap.descricao.toLowerCase().includes(lowerCaseSearch) || ap.nome_tecnico.toLowerCase().includes(lowerCaseSearch))
            );
        }
        if(filters.status) filtered = filtered.filter(c => c.status === filters.status);
        if(filters.tecnicoId) filtered = filtered.filter(c => c.tecnicos_ids && c.tecnicos_ids.includes(parseInt(filters.tecnicoId)));
        if(filters.dataInicio) filtered = filtered.filter(c => new Date(c.criado_em) >= new Date(filters.dataInicio));
        if(filters.dataFim) filtered = filtered.filter(c => new Date(c.criado_em) <= new Date(filters.dataFim));

        const statusOrder = { 'Em andamento': 1, 'Concluido': 2 };
        filtered.sort((a, b) => (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3) || b.id - a.id);
        
        return filtered;
    }, [enrichedChamados, searchTerm, filters]);

    const handleToggleApontamentos = (chamadoId) => {
        setOpenChamados(prevOpen => prevOpen.includes(chamadoId) ? prevOpen.filter(id => id !== chamadoId) : [...prevOpen, chamadoId]);
        if (!pagination[chamadoId]) setPagination(prev => ({ ...prev, [chamadoId]: 1 }));
    };
    
    const handleOpenCreateModal = (chamado) => { setSelectedChamado(chamado); setNewApontamento({ descricao: '', comeco: '', fim: ''}); setCreateModalOpen(true); };

    const handleCreateApontamento = async (e) => {
        e.preventDefault();
        if (!selectedChamado) return;
        const token = localStorage.getItem('token');
        const { comeco, fim, descricao } = newApontamento;
        if (!comeco || !fim || !descricao) return showToast("Todos os campos são obrigatórios.", 'error');
        if (new Date(fim) < new Date(comeco)) return showToast("A data final não pode ser anterior à data de início.", 'error');

        const payload = { ...newApontamento, comeco: new Date(comeco).toISOString().slice(0, 19).replace('T', ' '), fim: new Date(fim).toISOString().slice(0, 19).replace('T', ' ') };
        
        setIsSubmitting(true);
        try {
            const response = await fetch(`${apiUrl}/chamados/${selectedChamado.id}/apontamentos`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Falha ao criar apontamento.');
            showToast('Apontamento criado com sucesso!');
            setCreateModalOpen(false);
            fetchData();
        } catch (err) { showToast(`Erro ao salvar: ${err.message}`, 'error');
        } finally { setIsSubmitting(false); }
    };
    
    const handlePageChange = (chamadoId, newPage) => setPagination(prev => ({...prev, [chamadoId]: newPage}));
    
    const chamadosAtivos = processedChamados.filter(c => c.status !== 'Concluido');
    const chamadosConcluidos = processedChamados.filter(c => c.status === 'Concluido');

    return (
        <>
            {toast.show && <Toast message={toast.message} type={toast.type} onclose={() => setToast({ show: false })} />}
            <main className="flex-1 flex flex-col bg-gray-900/50 h-full overflow-hidden">
                 <div className="p-4 sm:p-6 bg-[#1f1f1f] border-b border-gray-800 space-y-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Gerenciamento de Atividades</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                        <div className='w-full'>
                            <label className="text-xs text-gray-400">Status</label>
                            <select name="status" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className={`${inputStyles} mt-1`}>
                                <option value="">Todos</option>
                                <option value="Em andamento">Em Andamento</option>
                                <option value="Concluido">Concluído</option>
                            </select>
                        </div>
                        <div className='w-full'><label className="text-xs text-gray-400">Técnico</label><select name="tecnicoId" value={filters.tecnicoId} onChange={(e) => setFilters(prev => ({ ...prev, tecnicoId: e.target.value }))} className={`${inputStyles} mt-1`}><option value="">Todos</option>{tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
                        <div className='w-full'><label className="text-xs text-gray-400">Data Início</label><input type="date" name="dataInicio" value={filters.dataInicio} onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))} className={`${inputStyles} mt-1`} /></div>
                        <div className='w-full'><label className="text-xs text-gray-400">Data Fim</label><input type="date" name="dataFim" value={filters.dataFim} onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))} className={`${inputStyles} mt-1`} /></div>
                        <div className='w-full'><button onClick={() => setFilters({ status: '', tecnicoId: '', dataInicio: '', dataFim: '' })} className="w-full p-2 bg-gray-600 text-sm rounded hover:bg-gray-500">Limpar Filtros</button></div>
                    </div>
                </div>
                
                 <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    {isLoading ? <p className="text-center text-gray-400">Carregando...</p> : 
                    error ? <p className="text-center text-red-400 text-lg font-semibold mt-10">{error}</p> : 
                    processedChamados.length > 0 ? (
                        <div className='space-y-6'>
                            {chamadosAtivos.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">Em Andamento</h3>
                                    <div className="space-y-3">
                                        {chamadosAtivos.map(chamado => <ChamadoCard key={chamado.id} chamado={chamado} pagination={pagination} onToggle={handleToggleApontamentos} onPageChange={handlePageChange} onOpenModal={handleOpenCreateModal} openChamados={openChamados} />)}
                                    </div>
                                </div>
                            )}
                             {chamadosConcluidos.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400 mb-3 pt-4 border-t border-gray-700">Concluídos</h3>
                                    <div className="space-y-3">
                                        {chamadosConcluidos.map(chamado => <ChamadoCard key={chamado.id} chamado={chamado} pagination={pagination} onToggle={handleToggleApontamentos} onPageChange={handlePageChange} onOpenModal={handleOpenCreateModal} openChamados={openChamados} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                            <IconClipboardCheck />
                            <p className="mt-4 font-semibold text-lg text-gray-400">Nenhuma Atividade Encontrada</p>
                            <p className="text-sm">Não há chamados com apontamentos para os filtros selecionados.</p>
                        </div>
                    )}
                </div>

                {isCreateModalOpen && (
                     <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                        <div className="bg-[#1c1c1c] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in">
                            <h3 className="text-xl font-bold mb-1 text-white">Adicionar Apontamento</h3>
                            <p className="text-sm text-gray-400 mb-4">Para: #{selectedChamado.id} - {selectedChamado.descricao}</p>
                            <form onSubmit={handleCreateApontamento} className="space-y-4">
                                <div>
                                    <label htmlFor="descricao" className="block text-sm font-medium mb-1">Descrição da Atividade</label>
                                    <textarea id="descricao" value={newApontamento.descricao} onChange={(e) => setNewApontamento({...newApontamento, descricao: e.target.value})} rows="4" required className={`${inputStyles} h-28`}/>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label htmlFor="comeco" className="block text-sm font-medium mb-1">Início</label><input type="datetime-local" id="comeco" value={newApontamento.comeco} onChange={(e) => setNewApontamento({...newApontamento, comeco: e.target.value})} required className={inputStyles}/></div>
                                    <div><label htmlFor="fim" className="block text-sm font-medium mb-1">Fim</label><input type="datetime-local" id="fim" value={newApontamento.fim} onChange={(e) => setNewApontamento({...newApontamento, fim: e.target.value})} required className={inputStyles}/></div>
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancelar</button>
                                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-800">{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
                                </div>
                            </form>
                        </div>
                     </div>
                )}
            </main>
            <ChatBot />
        </>
    );
}


function ChamadoCard({ chamado, pagination, onToggle, onPageChange, onOpenModal, openChamados }) {
    const ITEMS_PER_PAGE = 5;
    const currentPage = pagination[chamado.id] || 1;
    const totalPages = Math.ceil(chamado.apontamentos.length / ITEMS_PER_PAGE);
    const paginatedApontamentos = [...chamado.apontamentos].reverse().slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const isOpen = openChamados.includes(chamado.id);

    return (
        <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg overflow-hidden transition-all duration-300">
            <div className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-800/40" onClick={() => onToggle(chamado.id)}>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-white">{chamado.nome_equipamento || chamado.descricao}</h3>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 font-mono mt-1">
                            {chamado.patrimonio_numero && chamado.patrimonio_numero !== '000000' && (
                                <><span>Pat: {chamado.patrimonio_numero}</span><span className="text-gray-600 hidden sm:inline">|</span></>
                            )}
                            <span>#{chamado.id}</span>
                        </div>
                    </div>
                    <div>
                        <strong className="block text-gray-500 text-xs mb-1">Solicitante</strong>
                        <span className='text-gray-300'>{chamado.nome_solicitante}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500 text-xs mb-1">Status</strong>
                        <StatusBadge status={chamado.status} />
                    </div>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                     <button onClick={(e) => { e.stopPropagation(); onOpenModal(chamado); }} className="flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        <IconPlus /> Adicionar
                    </button>
                    <IconChevronDown className={isOpen ? 'rotate-180' : ''} />
                </div>
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="border-t border-gray-700/50 p-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Descrição</th><th scope="col" className="px-4 py-2">Técnico</th>
                                    <th scope="col" className="px-4 py-2 text-center">Duração</th><th scope="col" className="px-4 py-2">Período</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedApontamentos.map(ap => (
                                <tr key={ap.id} className="border-b border-gray-700/50">
                                    <td className="px-4 py-3 text-gray-200">{ap.descricao}</td>
                                    <td className="px-4 py-3">{ap.nome_tecnico}</td>
                                    <td className="px-4 py-3 text-center">{ap.duracao} min</td>
                                    <td className="px-4 py-3 font-mono text-xs">{new Date(ap.comeco).toLocaleString('pt-BR')} - {new Date(ap.fim).toLocaleTimeString('pt-BR')}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-2">
                            <button onClick={() => onPageChange(chamado.id, currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><IconArrowLeft /></button>
                            <span className="text-sm font-semibold text-gray-400">Página {currentPage} de {totalPages}</span>
                            <button onClick={() => onPageChange(chamado.id, currentPage + 1)} disabled={currentPage >= totalPages} className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><IconArrowRight /></button>
                        </div>
                    )}
                </div>
            </div>
        
        </div>


    );
}