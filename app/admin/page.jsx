"use client";

import { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSearch } from '../context/SearchContet';
import { Menu, Transition, Dialog } from '@headlessui/react';
import ChatBot from "../ChatBot";

// Ícones
const IconPlus = () => <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconExclamationCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconChevronDown = () => <svg className="w-5 h-5 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const IconPencil = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const IconPaperClip = () => <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const IconClipboardCheck = () => <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const IconArrowLeft = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const IconArrowRight = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>;

function Toast({ message, type, onclose }) {
    return (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg shadow-2xl border text-white ${type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} animate-fade-in`}>
            {type === 'success' ? <IconCheckCircle /> : <IconExclamationCircle />}
            <span>{message}</span>
            <button onClick={onclose} className="ml-4">&times;</button>
        </div>
    );
}

export default function AdminDashboardPage() {
    const { searchTerm } = useSearch();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Estados
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chamados, setChamados] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [pools, setPools] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [filters, setFilters] = useState({ status: '', tecnicoId: '', dataInicio: '', dataFim: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimerRef = useRef(null);
    const [selectedChamado, setSelectedChamado] = useState(null);
    const [modalState, setModalState] = useState({ detail: false, conclude: false, create: false, edit: false, createApontamento: false });
    const [newChamadoData, setNewChamadoData] = useState({ equipamento_id: '', descricao: '', tipo_id: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editData, setEditData] = useState({});
    const [equipamentoSearch, setEquipamentoSearch] = useState('');
    const [solucaoData, setSolucaoData] = useState('');
    const [newApontamentoData, setNewApontamentoData] = useState({ descricao: '', comeco: '', fim: '' });
    const [apontamentos, setApontamentos] = useState([]);
    const [isApontamentosLoading, setIsApontamentosLoading] = useState(false);
    const [apontamentosPage, setApontamentosPage] = useState(1);
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const inputStyles = "w-full bg-[#2a2a2a] p-2 rounded text-sm text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200";
    const createEquipamentoRef = useRef(null);
    const editDescricaoRef = useRef(null);
    const solucaoTextareaRef = useRef(null);

    const showToast = (message, type = 'success') => { clearTimeout(toastTimerRef.current); setToast({ show: true, message, type }); toastTimerRef.current = setTimeout(() => setToast({ show: false, message: '', type }), 5000); };
    const fetchChamados = useCallback(async (token) => { if (!token) return; setIsDataLoading(true); try { const params = new URLSearchParams(); if (searchTerm) params.append('q', searchTerm); if (filters.status) params.append('status', filters.status); if (filters.tecnicoId) params.append('tecnico_id', filters.tecnicoId); if (filters.dataInicio) params.append('data_inicio', filters.dataInicio); if (filters.dataFim) params.append('data_fim', filters.dataFim); const response = await fetch(`${apiUrl}/chamados?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error('Falha ao buscar chamados.'); const data = await response.json(); setChamados(data); } catch (err) { setError(err.message); } finally { setIsDataLoading(false); } }, [apiUrl, searchTerm, filters]);
    useEffect(() => { const token = localStorage.getItem('token'); const userSession = JSON.parse(localStorage.getItem('usuario')); if (!token || !userSession || userSession.funcao !== 'admin') { router.push('/login'); return; } setUsuario(userSession); const debounceTimer = setTimeout(() => { fetchChamados(token); }, 300); return () => clearTimeout(debounceTimer); }, [searchTerm, filters, fetchChamados, router]);
    useEffect(() => { const token = localStorage.getItem('token'); if (!token) return; const fetchInitialData = async () => { try { const [usersRes, poolsRes, equipamentosRes] = await Promise.all([ fetch(`${apiUrl}/usuarios`, { headers: { 'Authorization': `Bearer ${token}` } }), fetch(`${apiUrl}/pools/admin`, { headers: { 'Authorization': `Bearer ${token}` } }), fetch(`${apiUrl}/equipamentos`, { headers: { 'Authorization': `Bearer ${token}` } }) ]); const [usersData, poolsData, equipamentosData] = await Promise.all([usersRes.json(), poolsRes.json(), equipamentosRes.json()]); setAllUsers(usersData); setPools(poolsData); setEquipamentos(equipamentosData); setTecnicos(usersData.filter(u => u.funcao === 'tecnico')); } catch (err) { setError(err.message); } }; fetchInitialData(); }, [apiUrl]);
    useEffect(() => { const token = localStorage.getItem('token'); const chamadoIdFromUrl = searchParams.get('chamadoId'); if (chamadoIdFromUrl && token) { const fetchAndOpenChamado = async (id) => { try { const res = await fetch(`${apiUrl}/chamados/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!res.ok) { throw new Error("Chamado não encontrado ou sem permissão."); } const chamadoData = await res.json(); handleOpenModal('detail', chamadoData); } catch (e) { showToast(e.message, 'error'); } finally { router.replace('/admin', { scroll: false }); } }; fetchAndOpenChamado(chamadoIdFromUrl); } }, [searchParams, apiUrl, router]);
    useEffect(() => { const focusWithTimeout = (ref) => { setTimeout(() => { ref.current?.focus(); }, 100); }; if (modalState.create) focusWithTimeout(createEquipamentoRef); if (modalState.edit) focusWithTimeout(editDescricaoRef); if (modalState.conclude) focusWithTimeout(solucaoTextareaRef); }, [modalState]);
    
    const fetchApontamentos = async (chamadoId) => { const token = localStorage.getItem('token'); if (!token) return; setIsApontamentosLoading(true); setApontamentos([]); try { const response = await fetch(`${apiUrl}/chamados/${chamadoId}/apontamentos`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error('Falha ao buscar apontamentos.'); const data = await response.json(); setApontamentos(data); } catch (err) { showToast(err.message, 'error'); } finally { setIsApontamentosLoading(false); } };
    
    const handleOpenModal = (modal, chamado = null) => { setSelectedChamado(chamado); if (chamado) { if (modal === 'edit') { setEditData({ descricao: chamado.descricao || '', tipo_id: chamado.tipo_id || '', status: chamado.status || '', solucao: chamado.solucao || '', tecnico_id: chamado.tecnico_id || '', }); } if (modal === 'detail') { fetchApontamentos(chamado.id); setApontamentosPage(1); } } if (modal === 'create') { setNewChamadoData({ equipamento_id: '', descricao: '', tipo_id: '' }); setSelectedFiles([]); } if (modal === 'createApontamento') { setNewApontamentoData({ descricao: '', comeco: '', fim: '' }); } setModalState(prev => ({ ...prev, [modal]: true })); };
    const handleCloseModals = () => { setModalState({ detail: false, conclude: false, create: false, edit: false, createApontamento: false }); setEquipamentoSearch(''); setSolucaoData(''); setSelectedFiles([]); setApontamentos([]); };
    
    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prevFiles => {
                const combined = [...prevFiles, ...newFiles];
                const uniqueFiles = Array.from(new Map(combined.map(file => [file.name, file])).values());
                return uniqueFiles.slice(0, 4);
            });
        }
    };
    const handleClearFiles = () => { setSelectedFiles([]); };
    
    const handleApiJsonAction = async (method, endpoint, body, successMessage) => { const token = localStorage.getItem('token'); setIsLoading(true); try { const response = await fetch(`${apiUrl}${endpoint}`, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) }); const resData = await response.json(); if (!response.ok) throw new Error(resData.message); showToast(successMessage, 'success'); fetchChamados(token); handleCloseModals(); } catch (err) { showToast(err.message, 'error'); } finally { setIsLoading(false); } };

    
    const handleCreateChamado = async (e) => { e.preventDefault(); const token = localStorage.getItem('token'); if (!token || !usuario) { showToast('Sessão inválida. Faça login novamente.', 'error'); return; } setIsLoading(true); const formData = new FormData(); formData.append('descricao', newChamadoData.descricao); formData.append('tipo_id', newChamadoData.tipo_id); if (newChamadoData.equipamento_id) { formData.append('equipamento_id', newChamadoData.equipamento_id); } else { formData.append('equipamento_id', '000000'); } formData.append('usuario_id', usuario.id); selectedFiles.forEach(file => formData.append('anexos', file)); try { const response = await fetch(`${apiUrl}/chamados`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }); const resData = await response.json(); if (!response.ok) throw new Error(resData.message || 'Erro ao criar chamado'); showToast('Chamado criado com sucesso!', 'success'); fetchChamados(token); handleCloseModals(); } catch (err) { showToast(err.message, 'error'); } finally { setIsLoading(false); } };
    
    const handleUpdateChamado = (e) => { e.preventDefault(); handleApiJsonAction('PUT', `/chamados/${selectedChamado.id}/admin-update`, editData, 'Chamado atualizado com sucesso!'); };
    const handleAssignChamado = (tecnicoId) => { handleApiJsonAction('PUT', `/chamados/${selectedChamado.id}/admin-assign`, { tecnico_id: tecnicoId }, 'Técnico atribuído com sucesso!'); };
    const handleConcludeChamado = (e) => { e.preventDefault(); handleApiJsonAction('PUT', `/chamados/${selectedChamado.id}/concluir`, { solucao: solucaoData }, 'Chamado concluído com sucesso!'); };
    const handleCreateApontamento = async (e) => { e.preventDefault(); if (!selectedChamado) return showToast("Nenhum chamado selecionado.", "error"); if (new Date(newApontamentoData.fim) < new Date(newApontamentoData.comeco)) { return showToast("A data final não pode ser anterior à data de início.", "error"); } const payload = { ...newApontamentoData, comeco: new Date(newApontamentoData.comeco).toISOString().slice(0, 19).replace('T', ' '), fim: new Date(newApontamentoData.fim).toISOString().slice(0, 19).replace('T', ' ') }; await handleApiJsonAction('POST', `/chamados/${selectedChamado.id}/apontamentos`, payload, 'Apontamento adicionado com sucesso!'); };
    const StatusBadge = ({ status }) => { const styles = { 'Pendente': 'bg-blue-600/20 text-blue-300 border-blue-500', 'Aberto': 'bg-blue-600/20 text-blue-300 border-blue-500', 'Em andamento': 'bg-yellow-600/20 text-yellow-300 border-yellow-500', 'Concluido': 'bg-green-600/20 text-green-300 border-green-500' }; return <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[status] || 'bg-gray-600/20'}`}>{status}</span>; };
    const handlePrevPage = () => setApontamentosPage(p => Math.max(p - 1, 1));
    const handleNextPage = () => { const totalPages = Math.ceil(apontamentos.length / 3); setApontamentosPage(p => Math.min(p + 1, totalPages));};
    
    return (
        <>
            {toast.show && <Toast message={toast.message} type={toast.type} onclose={() => setToast(prev => ({ ...prev, show: false }))} />}
            <main className="flex-1 flex flex-col bg-gray-900/50 overflow-hidden">
                 <div className="p-4 sm:p-6 bg-[#1f1f1f] border-b border-gray-800 flex-shrink-0 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-white">Dashboard de Chamados</h2>
                        <button onClick={() => handleOpenModal('create')} className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors w-full sm:w-auto"><IconPlus /> Criar Chamado</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                        <div className='w-full'><label className="text-xs text-gray-400">Status</label><select name="status" value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className={`${inputStyles} mt-1`}><option value="">Todos</option><option value="Aberto">Aberto</option><option value="Em andamento">Em Andamento</option><option value="Aguardando Aprovação">Aguardando Aprovação</option><option value="Concluido">Concluído</option></select></div>
                        <div className='w-full'><label className="text-xs text-gray-400">Técnico</label><select name="tecnicoId" value={filters.tecnicoId} onChange={(e) => setFilters(prev => ({ ...prev, tecnicoId: e.target.value }))} className={`${inputStyles} mt-1`}><option value="">Todos</option>{tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
                        <div className='w-full'><label className="text-xs text-gray-400">Data Início</label><input type="date" name="dataInicio" value={filters.dataInicio} onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))} className={`${inputStyles} mt-1`} /></div>
                        <div className='w-full'><label className="text-xs text-gray-400">Data Fim</label><input type="date" name="dataFim" value={filters.dataFim} onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))} className={`${inputStyles} mt-1`} /></div>
                        <div className='w-full'><button onClick={() => setFilters({ status: '', tecnicoId: '', dataInicio: '', dataFim: '' })} className="w-full p-2 bg-gray-600 text-sm rounded hover:bg-gray-500">Limpar Filtros</button></div>
                    </div>
                </div>
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    {isDataLoading ? (<p className="text-center">Carregando chamados...</p>) : error ? (<p className="text-center text-red-400">{error}</p>) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {chamados.length > 0 ? chamados.map(c => (
                                <div key={c.id} onClick={() => handleOpenModal('detail', c)} className="bg-[#1a1a1a] border border-gray-700/50 p-5 rounded-lg flex flex-col justify-between space-y-4 cursor-pointer transition-all hover:border-red-600 hover:-translate-y-1 min-h-[230px]">
                                    <div className="flex flex-col flex-grow"><div className="flex justify-between items-center mb-3"><StatusBadge status={c.status} /><span className="font-mono text-xs text-gray-500">#{c.id}</span></div><p className="font-semibold text-white break-words flex-grow">{c.nome_equipamento || c.descricao}</p><p className="text-xs text-gray-400 mt-1">{c.nome_equipamento ? `Pat: ${c.patrimonio_numero}` : "Serviço Geral"}</p></div>
                                    <div className="text-xs text-gray-400 border-t border-gray-700/50 pt-3 mt-auto space-y-1"><p><strong>Solicitante:</strong> {c.nome_solicitante || 'N/A'}</p><p><strong>Técnico:</strong> {c.nome_tecnico || 'Não atribuído'}</p><p><strong>Criado:</strong> {new Date(c.criado_em).toLocaleDateString()}</p></div>
                                </div>
                            )) : (
                                <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 py-10 min-h-[calc(100vh-350px)]">
                                    <IconClipboardCheck />
                                    <p className="mt-4 font-semibold text-lg text-gray-400">Nenhum chamado encontrado</p>
                                    <p className="text-sm">Tente ajustar sua pesquisa ou filtros.</p>
                                </div>
                            )}
                        </div>)}
                </div>
            </main>
            
            <Dialog open={modalState.create} onClose={handleCloseModals} className="relative z-50">
                 <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <Dialog.Panel as="form" onSubmit={handleCreateChamado} className="bg-[#1c1c1c] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <Dialog.Title className="text-xl font-bold flex-shrink-0">Criar Novo Chamado</Dialog.Title>
                        <div className="space-y-4 mt-4 flex-grow overflow-y-auto px-4 -mx-4 custom-scrollbar">
                            <div className="relative px-4"><label className="block text-sm font-medium mb-1">Equipamento (Opcional)</label><input ref={createEquipamentoRef} type="text" placeholder="Digite para buscar..." value={equipamentoSearch} onChange={e => setEquipamentoSearch(e.target.value)} onFocus={() => setNewChamadoData(p => ({ ...p, equipamento_id: '' }))} className={inputStyles} />{equipamentoSearch && (<ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto custom-scrollbar">{equipamentos.filter(e => e.EQUIPAMENTO.toLowerCase().includes(equipamentoSearch.toLowerCase()) || String(e.PATRIMONIO).includes(equipamentoSearch)).slice(0, 5).map(e => <li key={e.PATRIMONIO} onClick={() => { setNewChamadoData(prev => ({ ...prev, equipamento_id: e.PATRIMONIO })); setEquipamentoSearch(`${e.EQUIPAMENTO} (Pat: ${e.PATRIMONIO})`); }} className="p-2 hover:bg-red-600 cursor-pointer">{e.EQUIPAMENTO} (Pat: {e.PATRIMONIO})</li>)}</ul>)}</div>
                            <div className="px-4"><select name="tipo_id" required value={newChamadoData.tipo_id} onChange={e => setNewChamadoData(p => ({ ...p, tipo_id: e.target.value }))} className={inputStyles}><option value="">Selecione o Tipo*</option>{pools.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}</select></div>
                            <div className="px-4"><textarea name="descricao" required placeholder="Descrição detalhada..." value={newChamadoData.descricao} onChange={e => setNewChamadoData(p => ({ ...p, descricao: e.target.value }))} className={`${inputStyles} h-24`} /></div>
                            <div className="px-4">
                                <label className="block text-sm font-medium mb-2">Anexar Imagens (até 4)</label>
                                <div className='flex items-center gap-4'>
                                    <label htmlFor="file-upload" className="flex-grow flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-md cursor-pointer hover:bg-gray-800/50 hover:border-gray-500 transition-colors">
                                        <IconPaperClip /><span className="text-gray-400 text-center text-sm">{selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s) selecionado(s)` : "Clique para selecionar os arquivos"}</span>
                                    </label>
                                    {selectedFiles.length > 0 && (<button type="button" onClick={handleClearFiles} className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500">Limpar</button>)}
                                </div>
                                <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                {selectedFiles.length > 0 && (<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">{selectedFiles.map((file, index) => (<div key={index} className="relative aspect-square"><Image src={URL.createObjectURL(file)} alt={`Preview ${index}`} fill className="object-cover rounded-md" /></div>))}</div>)}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700 flex-shrink-0"><button type="button" onClick={handleCloseModals} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancelar</button><button type="submit" disabled={isLoading} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 disabled:bg-red-800">{isLoading ? 'Salvando...' : 'Criar'}</button></div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            <Dialog open={modalState.detail} onClose={handleCloseModals} className="relative z-50">
                 <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
                 <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <Dialog.Panel className="bg-transparent w-full max-w-7xl max-h-[90vh] flex gap-4">
                        <div className="bg-[#1c1c1c] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden">
                             <Dialog.Title className="text-2xl font-bold flex-shrink-0 text-white">Detalhes do Chamado <span className="font-mono text-gray-400">#{selectedChamado?.id}</span></Dialog.Title>
                            <div className='flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-4 text-gray-300 mt-4'>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    <div><strong className="block text-gray-500">Equipamento</strong>{selectedChamado?.nome_equipamento || 'N/A'}</div>
                                    <div><strong className="block text-gray-500">Patrimônio</strong>{selectedChamado?.patrimonio_numero || 'N/A'}</div>
                                    <div><strong className="block text-gray-500">Solicitante</strong>{selectedChamado?.nome_solicitante}</div>
                                    <div><strong className="block text-gray-500">Técnico</strong>{selectedChamado?.nome_tecnico || 'Não atribuído'}</div>
                                    <div><strong className="block text-gray-500">Status</strong><StatusBadge status={selectedChamado?.status} /></div>
                                    <div><strong className="block text-gray-500">Tipo</strong>{selectedChamado?.tipo_chamado}</div>
                                </div>
                                <div className="mt-4"><strong className="block text-gray-500 mb-1 text-sm">Descrição</strong><p className="p-3 bg-black/20 rounded-md text-sm">{selectedChamado?.descricao}</p></div>
                                {selectedChamado?.solucao && (<div className="mt-4"><strong className="block text-gray-500 mb-1 text-sm">Solução</strong><p className="p-3 bg-green-900/20 text-green-200 rounded-md text-sm">{selectedChamado.solucao}</p></div>)}
                                {selectedChamado?.anexos && JSON.parse(selectedChamado.anexos).length > 0 && (<div className="mt-4"><strong className="block text-gray-500 mb-2 text-sm">Anexos</strong><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{JSON.parse(selectedChamado.anexos).map(anexo => (<a key={anexo} href={`${apiUrl}/uploads/${anexo}`} target="_blank" rel="noopener noreferrer" className="relative aspect-square block group"><Image src={`${apiUrl}/uploads/${anexo}`} alt={`Anexo do chamado ${selectedChamado.id}`} fill className="object-cover rounded-md" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white text-xs text-center">Ver imagem</span></div></a>))}</div></div>)}
                            </div>
                            <div className="flex-shrink-0 flex flex-nowrap justify-end items-center gap-4 pt-6 mt-4 border-t border-gray-700">
                                <button onClick={() => { handleCloseModals(); handleOpenModal('createApontamento', selectedChamado); }} disabled={selectedChamado?.status !== 'Em andamento'} className="px-4 py-2 flex items-center gap-2 bg-red-600 rounded-md hover:bg-red-700 text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"><IconPlus /> <span className="hidden sm:inline">Apontamento</span></button>
                                <button onClick={() => { handleCloseModals(); handleOpenModal('edit', selectedChamado); }} className="px-4 py-2 flex items-center gap-2 bg-gray-600 rounded-md hover:bg-gray-500 text-sm"><IconPencil /> <span className="hidden sm:inline">Editar</span></button>
                                <div className="flex-grow"></div>
                                <button onClick={handleCloseModals} className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-sm">Fechar</button>
                                <Menu as="div" className="relative inline-block text-left"><Menu.Button disabled={!['Aberto', 'Pendente'].includes(selectedChamado?.status)} className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed">Atribuir<IconChevronDown /></Menu.Button><Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"><Menu.Items className="absolute right-0 bottom-full mb-2 w-56 origin-bottom-right bg-gray-800 rounded-md shadow-lg custom-scrollbar"><div className="p-1 max-h-48 overflow-y-auto">{tecnicos.length > 0 ? tecnicos.map(t => (<Menu.Item key={t.id}>{({ active }) => (<button onClick={(e) => { e.stopPropagation(); handleAssignChamado(t.id); }} className={`${active ? 'bg-blue-500' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm`}>{t.nome}</button>)}</Menu.Item>)) : <div className="px-2 py-2 text-sm text-gray-400">Nenhum técnico</div>}</div></Menu.Items></Transition></Menu>
                                <button onClick={() => setModalState({ ...modalState, conclude: true, detail: false })} disabled={selectedChamado?.status !== 'Em andamento'} className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm">Concluir</button>
                            </div>
                        </div>

                        <div className="bg-[#1c1c1c] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md flex flex-col">
                            <h4 className="font-bold text-lg text-white mb-4 flex-shrink-0">Últimos Apontamentos</h4>
                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3">
                                {isApontamentosLoading ? (<p className="text-sm text-gray-400 text-center pt-4">Carregando...</p>) : 
                                apontamentos.length > 0 ? (
                                    (() => {
                                        const ITEMS_PER_PAGE = 3;
                                        const reversedApontamentos = [...apontamentos].reverse();
                                        const paginatedApontamentos = reversedApontamentos.slice((apontamentosPage - 1) * ITEMS_PER_PAGE, apontamentosPage * ITEMS_PER_PAGE);
                                        return paginatedApontamentos.map(ap => (
                                            <div key={ap.id} className="bg-[#2a2a2a] p-3 rounded-md animate-fade-in">
                                                <p className="text-sm text-gray-200 mb-2">{ap.descricao}</p>
                                                <div className="text-xs text-gray-400 border-t border-gray-700 pt-2 space-y-1">
                                                    <p><strong>Técnico:</strong> {ap.nome_tecnico}</p><p><strong>Duração:</strong> {ap.duracao} min</p>
                                                    <p className="font-mono text-gray-500">{new Date(ap.comeco).toLocaleString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        ))
                                    })()
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                                        <IconClipboardCheck /><p className="mt-4 font-semibold text-gray-500">Nenhuma Atividade</p><p className="text-xs">Ainda não há apontamentos.</p>
                                    </div>
                                )}
                            </div>
                            {apontamentos.length > 3 && (
                                <div className="flex-shrink-0 flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
                                    <button onClick={handlePrevPage} disabled={apontamentosPage === 1} className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><IconArrowLeft /></button>
                                    <span className="text-sm font-semibold text-gray-400">Página {apontamentosPage} de {Math.ceil(apontamentos.length / 3)}</span>
                                    <button onClick={handleNextPage} disabled={apontamentosPage >= Math.ceil(apontamentos.length / 3)} className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><IconArrowRight /></button>
                                </div>
                            )}
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>

            <Dialog open={modalState.edit} onClose={handleCloseModals} className="relative z-50"><div className="fixed inset-0 bg-black/70" aria-hidden="true" /><div className="fixed inset-0 flex w-screen items-center justify-center p-4"><Dialog.Panel as="form" onSubmit={handleUpdateChamado} className="bg-[#1c1c1c] p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"><Dialog.Title className="text-xl font-bold flex-shrink-0">Editando Chamado #{selectedChamado?.id}</Dialog.Title><div className="space-y-4 mt-4 flex-grow overflow-y-auto px-4 -mx-4 custom-scrollbar"><div className="px-4"><label className="block text-sm font-medium mb-1">Descrição</label><textarea ref={editDescricaoRef} required value={editData.descricao} onChange={e => setEditData(p => ({ ...p, descricao: e.target.value }))} className={`${inputStyles} h-24`} /></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4"><div><label className="block text-sm font-medium mb-1">Tipo</label><select required value={editData.tipo_id} onChange={e => setEditData(p => ({ ...p, tipo_id: e.target.value }))} className={inputStyles}><option value="">Selecione...</option>{pools.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}</select></div><div><label className="block text-sm font-medium mb-1">Status</label><select required value={editData.status} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))} className={inputStyles}><option value="Aberto">Aberto</option><option value="Em andamento">Em Andamento</option><option value="Concluido">Concluído</option></select></div></div><div className="px-4"><label className="block text-sm font-medium mb-1">Técnico Responsável</label><select value={editData.tecnico_id || ''} onChange={e => setEditData(p => ({ ...p, tecnico_id: e.target.value }))} className={inputStyles}><option value="">Nenhum (em aberto)</option>{tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></div><div className="px-4"><label className="block text-sm font-medium mb-1">Solução Aplicada</label><textarea value={editData.solucao || ''} onChange={e => setEditData(p => ({ ...p, solucao: e.target.value }))} className={`${inputStyles} h-20`} /></div></div><div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700 flex-shrink-0"><button type="button" onClick={handleCloseModals} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancelar</button><button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:bg-blue-800">{isLoading ? 'Salvando...' : 'Salvar Alterações'}</button></div></Dialog.Panel></div></Dialog>
            <Dialog open={modalState.conclude} onClose={handleCloseModals} className="relative z-50"><div className="fixed inset-0 bg-black/70" aria-hidden="true" /><div className="fixed inset-0 flex w-screen items-center justify-center p-4"><Dialog.Panel as="form" onSubmit={handleConcludeChamado} className="bg-[#1c1c1c] p-8 rounded-lg w-full max-w-lg"><Dialog.Title className="font-bold text-lg mb-4">Concluir Chamado #{selectedChamado?.id}</Dialog.Title><textarea ref={solucaoTextareaRef} required value={solucaoData} onChange={e => setSolucaoData(e.target.value)} placeholder="Descreva a solução aplicada..." className={`${inputStyles} h-28`} /><div className="flex justify-end gap-4 pt-4 mt-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 rounded bg-gray-600">Cancelar</button><button type="submit" disabled={isLoading} className="bg-green-600 px-4 py-2 rounded disabled:bg-green-800">{isLoading ? 'Salvando...' : 'Confirmar Conclusão'}</button></div></Dialog.Panel></div></Dialog>
            <Dialog open={modalState.createApontamento} onClose={handleCloseModals} className="relative z-50"><div className="fixed inset-0 bg-black/70" aria-hidden="true" /><div className="fixed inset-0 flex w-screen items-center justify-center p-4"><Dialog.Panel as="form" onSubmit={handleCreateApontamento} className="bg-[#1c1c1c] p-6 sm:p-8 rounded-lg w-full max-w-lg"><Dialog.Title className="font-bold text-lg mb-2">Adicionar Apontamento</Dialog.Title><p className="text-sm text-gray-400 mb-4">Para o chamado #{selectedChamado?.id}</p><div className="space-y-4"><div><label className="text-sm">Descrição da Atividade</label><textarea required value={newApontamentoData.descricao} onChange={e => setNewApontamentoData(p => ({...p, descricao: e.target.value}))} className={`${inputStyles} h-24 mt-1`}></textarea></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="text-sm">Início</label><input required type="datetime-local" value={newApontamentoData.comeco} onChange={e => setNewApontamentoData(p => ({...p, comeco: e.target.value}))} className={`${inputStyles} mt-1`} /></div><div><label className="text-sm">Fim</label><input required type="datetime-local" value={newApontamentoData.fim} onChange={e => setNewApontamentoData(p => ({...p, fim: e.target.value}))} className={`${inputStyles} mt-1`} /></div></div></div><div className="flex justify-end gap-4 pt-4 mt-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">Cancelar</button><button type="submit" disabled={isLoading} className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 disabled:bg-red-800">{isLoading ? 'Salvando...' : 'Salvar Apontamento'}</button></div></Dialog.Panel></div></Dialog>

            <ChatBot />

        </>
    );
}