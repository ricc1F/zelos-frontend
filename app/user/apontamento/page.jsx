// frontend/app/user/apontamentos/page.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../context/SearchContet';
import ChatBot from "../../ChatBot";

// Ícones 
const IconChevronDown = ({ className }) => <svg className={`w-5 h-5 transition-transform duration-300 text-gray-500 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const IconClipboardSearch = () => <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m5 13l-4-4m0 0a6 6 0 10-8.485-8.485 6 6 0 008.485 8.485z" /></svg>;
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const IconArrowRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;
const IconClipboardCheck = () => <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

//  Componentes 
const StatusBadge = ({ status }) => { const styles = { 'Aberto': 'bg-blue-100 text-blue-700 border-blue-300', 'Em andamento': 'bg-yellow-100 text-yellow-700 border-yellow-300', 'Concluido': 'bg-green-100 text-green-700 border-green-300'}; return <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{status}</span>; };

export default function UserApontamentosPage() {
    const { searchTerm } = useSearch();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [chamados, setChamados] = useState([]);
    const [apontamentos, setApontamentos] = useState({});
    const [openChamados, setOpenChamados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ status: '', dataInicio: '', dataFim: '' });

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
        } catch (err) { console.error(err.message); } 
        finally { setIsLoading(false); }
    }, [apiUrl, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const processedChamados = useMemo(() => {
        let filtered = chamados
            .map(c => ({...c, apontamentos: apontamentos[c.id] || [] }))
            .filter(c => c.apontamentos.length > 0); 

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.descricao?.toLowerCase().includes(lowerCaseSearch) ||
                c.nome_equipamento?.toLowerCase().includes(lowerCaseSearch) ||
                String(c.id).includes(lowerCaseSearch)
            );
        }
        
        if(filters.status) filtered = filtered.filter(c => c.status === filters.status);
        if(filters.dataInicio) filtered = filtered.filter(c => new Date(c.criado_em) >= new Date(filters.dataInicio));
        if(filters.dataFim) filtered = filtered.filter(c => { const d = new Date(c.criado_em); d.setHours(23, 59, 59); return d <= new Date(filters.dataFim); });

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
    
    const handlePageChange = (chamadoId, newPage) => setPagination(prev => ({...prev, [chamadoId]: newPage}));

    return (
        <main className="flex-1 flex flex-col bg-gray-100 h-full overflow-hidden">
             <div className="p-4 sm:p-6 bg-white border-b border-gray-200 space-y-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">Andamento dos Meus Chamados</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs text-gray-500">Status</label>
                        <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className="input-style mt-1">
                            <option value="">Todos</option>
                            <option value="Em andamento">Em Andamento</option>
                            <option value="Concluido">Concluído</option>
                        </select>
                    </div>
                    <div><label className="text-xs text-gray-500">Abertos desde</label><input type="date" value={filters.dataInicio} onChange={(e) => setFilters(p => ({ ...p, dataInicio: e.target.value }))} className="input-style mt-1" /></div>
                    <div><label className="text-xs text-gray-500">Abertos até</label><input type="date" value={filters.dataFim} onChange={(e) => setFilters(p => ({ ...p, dataFim: e.target.value }))} className="input-style mt-1" /></div>
                    <div><button onClick={() => setFilters({ status: '', dataInicio: '', dataFim: '' })} className="btn-secondary w-full">Limpar Filtros</button></div>
                </div>
            </div>

             <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                {isLoading ? <p className="text-center text-gray-500 py-10">Carregando atividades...</p> : 
                processedChamados.length > 0 ? (
                    <div className='space-y-6'>
                        {chamadosAtivos.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-600 mb-3">Em Andamento</h3>
                                <div className="space-y-3">{chamadosAtivos.map(chamado => <ChamadoCard key={chamado.id} chamado={chamado} pagination={pagination} onToggle={handleToggleApontamentos} onPageChange={handlePageChange} openChamados={openChamados} />)}</div>
                            </div>
                        )}
                         {chamadosConcluidos.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-green-600 mb-3 pt-4 border-t border-gray-200">Concluídos</h3>
                                <div className="space-y-3">{chamadosConcluidos.map(chamado => <ChamadoCard key={chamado.id} chamado={chamado} pagination={pagination} onToggle={handleToggleApontamentos} onPageChange={handlePageChange} openChamados={openChamados} />)}</div>
                            </div>
                        )}
                    </div>
                ) : <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><IconClipboardCheck /><p className="mt-4 font-semibold text-gray-700">Nenhuma Atividade Encontrada</p><p className="text-sm">Ainda não foram registradas atividades nos seus chamados ou não correspondem aos filtros.</p></div>}
            </div>
            <ChatBot />
        </main>
    );
}

function ChamadoCard({ chamado, pagination, onToggle, onPageChange, openChamados }) {
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
                        <strong className="block text-gray-500 text-xs mb-1">Técnico</strong>
                        <span className='text-gray-700'>{chamado.nome_tecnico || 'Aguardando'}</span>
                    </div>
                    <div>
                        <strong className="block text-gray-500 text-xs mb-1">Status</strong>
                        <StatusBadge status={chamado.status} />
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0"><IconChevronDown className={isOpen ? 'rotate-180' : ''} /></div>
            </div>

            {isOpen && (
                <div className="border-t border-gray-200 p-4 bg-gray-50/50 animate-fade-in">
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
                </div>
            )}
        </div>
    );
}