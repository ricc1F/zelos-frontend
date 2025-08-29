"use client";

import { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSearch } from '../context/SearchContet';
import { Dialog, Transition } from '@headlessui/react';
import ChatBot from "../ChatBot";

//  Ícones 
const IconPlus = () => <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconPaperClip = () => <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const IconClipboardCheck = () => <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;

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

const StatusBadge = ({ status }) => {
    const styles = {
        'Aberto': 'bg-blue-100 text-blue-700 border-blue-300',
        'Em andamento': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'Concluido': 'bg-green-100 text-green-700 border-green-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>{status}</span>;
};

export default function UserDashboardPage() {
    const { searchTerm } = useSearch();
    const router = useRouter();

    const [chamados, setChamados] = useState([]);
    const [pools, setPools] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [filters, setFilters] = useState({ status: '', dataInicio: '', dataFim: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChamado, setSelectedChamado] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [apontamentos, setApontamentos] = useState([]);
    const [isApontamentosLoading, setIsApontamentosLoading] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const toastTimerRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => { clearTimeout(toastTimerRef.current); setToast({ show: true, message, type }); toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000); }, []);

    const fetchChamados = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('q', searchTerm);
            Object.entries(filters).forEach(([key, value]) => { if (value) params.append(key, value); });
            const response = await fetch(`${apiUrl}/chamados?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar chamados.');
            setChamados(await response.json());
        } catch (err) { console.error(err.message); showToast(err.message, 'error'); }
        finally { setIsLoading(false); }
    }, [apiUrl, searchTerm, filters, router, showToast]);

    useEffect(() => { const timer = setTimeout(() => fetchChamados(), 300); return () => clearTimeout(timer); }, [fetchChamados]);
    useEffect(() => {
        const token = localStorage.getItem('token'); if (!token) return;
        const fetchInitialData = async () => {
            try {
                const [poolsRes, equipamentosRes] = await Promise.all([fetch(`${apiUrl}/pools`, { headers: { 'Authorization': `Bearer ${token}` } }), fetch(`${apiUrl}/equipamentos`, { headers: { 'Authorization': `Bearer ${token}` } })]);
                setPools(await poolsRes.json()); setEquipamentos(await equipamentosRes.json());
            } catch (err) { console.error(err.message); }
        };
        fetchInitialData();
    }, [apiUrl]);

    const fetchApontamentos = async (chamadoId) => {
        const token = localStorage.getItem('token'); if (!token) return;
        setIsApontamentosLoading(true);
        try {
            const response = await fetch(`${apiUrl}/chamados/${chamadoId}/apontamentos`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar apontamentos.');
            setApontamentos(await response.json());
        } catch (err) { showToast(err.message, 'error'); }
        finally { setIsApontamentosLoading(false); }
    };

    const handleOpenModal = (type, chamado = null) => {
        setSelectedChamado(chamado); setModalType(type);
        if (type === 'detail' && chamado) { fetchApontamentos(chamado.id); }
    };
    const handleCloseModals = () => { setModalType(null); setApontamentos([]); };
    const handleSuccess = (message) => {
        showToast(message);
        fetchChamados();
        handleCloseModals();
    };

    return (
        <>
            <Toast show={toast.show} message={toast.message} type={toast.type} onclose={() => setToast({ show: false })} />
            <main className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 bg-white border-b border-gray-200 flex-shrink-0 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">Meus Chamados</h2>
                        <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center justify-center px-4 py-2"><IconPlus /> Novo Chamado</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                        <div className='w-full'>
                            <label className="text-xs text-gray-500">Status</label>
                            <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} className="input-style mt-1 h-11">
                                <option value="">Todos</option>
                                <option value="Aberto">Aberto</option>
                                <option value="Em andamento">Em Andamento</option>
                                <option value="Concluido">Concluído</option>
                            </select>
                        </div>
                        <div className='w-full'>
                            <label className="text-xs text-gray-500">Data Início</label>
                            <input type="date" value={filters.dataInicio} onChange={e => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))} className="input-style mt-1 h-11" />
                        </div>
                        <div className='w-full'>
                            <label className="text-xs text-gray-500">Data Fim</label>
                            <input type="date" value={filters.dataFim} onChange={e => setFilters(prev => ({ ...prev, dataFim: e.target.value }))} className="input-style mt-1 h-11" />
                        </div>
                        <div className='w-full lg:col-start-5'>
                            <button onClick={() => setFilters({ status: '', dataInicio: '', dataFim: '' })} className="btn-secondary w-full h-11">Limpar Filtros</button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                    {isLoading ? <p className="text-center text-gray-500">Carregando...</p> : chamados.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {chamados.map(c => (<div key={c.id} onClick={() => handleOpenModal('detail', c)} className="bg-white border border-gray-200 p-5 rounded-lg flex flex-col justify-between space-y-4 cursor-pointer transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 min-h-[230px]"><div><div className="flex justify-between items-start mb-3"><StatusBadge status={c.status} /><span className="font-mono text-xs text-gray-400">#{c.id}</span></div><p className="font-semibold text-gray-800 break-words">{c.nome_equipamento || c.descricao}</p><p className="text-xs text-gray-500 mt-1">{c.nome_equipamento ? `Pat: ${c.patrimonio_numero}` : "Serviço Geral"}</p></div><div className="text-xs text-gray-500 border-t border-gray-200 pt-3 mt-auto space-y-1"><p><strong>Técnico:</strong> {c.nome_tecnico || 'Aguardando'}</p><p><strong>Criado em:</strong> {new Date(c.criado_em).toLocaleDateString()}</p></div></div>))}
                        </div>
                    ) : (<div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><IconClipboardCheck /><p className="mt-4 font-semibold text-gray-700">Nenhum chamado encontrado</p><p className="text-sm">Você ainda não abriu um chamado.</p></div>)}
                </div>
            </main>

            <ChamadoModal isOpen={!!modalType} onClose={handleCloseModals} type={modalType} chamado={selectedChamado} onSuccess={handleSuccess} showToast={showToast} pools={pools} equipamentos={equipamentos} apiUrl={apiUrl} apontamentos={apontamentos} isApontamentosLoading={isApontamentosLoading} onOpenModal={handleOpenModal} />
       
            <ChatBot />
        </>
    );
}


function ChamadoModal({ isOpen, onClose, type, chamado, onSuccess, onOpenModal, ...props }) {
    if (!isOpen) return null;

    const getModalMaxWidth = (modalType) => {
        switch (modalType) {
            case 'detail':
                return 'max-w-7xl';
            case 'createApontamento':
                return 'max-w-lg';
            case 'create':
            default:
                return 'max-w-2xl';
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/70" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className={`w-full transform text-left align-middle transition-all ${getModalMaxWidth(type)} ${type === 'detail' ? 'bg-transparent' : 'bg-white rounded-2xl shadow-xl'}`}>
                            {type === 'create' && <CreateChamadoForm onSuccess={onSuccess} onClose={onClose} {...props} />}
                            {type === 'createApontamento' && <AddApontamentoForm onSuccess={onSuccess} onClose={onClose} chamado={chamado} {...props} />}
                            {type === 'detail' && <ChamadoDetailView chamado={chamado} onAddApontamento={() => { onOpenModal('createApontamento', chamado); }} onClose={onClose} {...props} />}
                        </Dialog.Panel>
                    </Transition.Child>
                </div></div>
            </Dialog>
        </Transition>
    );
}

function CreateChamadoForm({ onSuccess, showToast, onClose, pools, equipamentos, apiUrl }) {

    const [newData, setNewData] = useState({ equipamento_id: '', descricao: '', tipo_id: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [equipamentoSearch, setEquipamentoSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => { if (e.target.files) setSelectedFiles(Array.from(e.target.files).slice(0, 4)); };
    const handleSubmit = async (e) => {
        e.preventDefault(); if (!newData.descricao || !newData.tipo_id) { showToast("Descrição e tipo são obrigatórios.", 'error'); return; }
        setIsSubmitting(true); const formData = new FormData();
        formData.append('descricao', newData.descricao); formData.append('tipo_id', newData.tipo_id);
        formData.append('equipamento_id', newData.equipamento_id || '000000');
        selectedFiles.forEach(file => formData.append('anexos', file));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/chamados`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
            if (!response.ok) throw new Error((await response.json()).message || "Erro ao criar chamado.");
            onSuccess('Chamado criado com sucesso!');
        } catch (err) { showToast(err.message, 'error'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <Dialog.Title className="text-xl font-bold leading-6 text-gray-900">Criar Novo Chamado</Dialog.Title>
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                <div className="relative"><label className="block text-sm font-medium mb-1 text-gray-600">Equipamento (Opcional)</label><input type="text" placeholder="Digite para buscar..." value={equipamentoSearch} onChange={e => setEquipamentoSearch(e.target.value)} onFocus={() => setNewData(p => ({ ...p, equipamento_id: '' }))} className="input-style" />{equipamentoSearch && (<ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">{equipamentos.filter(e => e.EQUIPAMENTO.toLowerCase().includes(equipamentoSearch.toLowerCase()) || String(e.PATRIMONIO).includes(equipamentoSearch)).slice(0, 10).map(e => <li key={e.PATRIMONIO} onClick={() => { setNewData(prev => ({ ...prev, equipamento_id: e.PATRIMONIO })); setEquipamentoSearch(`${e.EQUIPAMENTO} (Pat: ${e.PATRIMONIO})`); }} className="p-2 text-gray-800 hover:bg-red-500 hover:text-white cursor-pointer">{e.EQUIPAMENTO} (Pat: {e.PATRIMONIO})</li>)}</ul>)}</div>
                <div><label className="block text-sm font-medium mb-1 text-gray-600">Tipo de Serviço*</label><select required value={newData.tipo_id} onChange={e => setNewData(p => ({ ...p, tipo_id: e.target.value }))} className="input-style"><option value="">Selecione...</option>{pools.map(p => <option key={p.id} value={p.id}>{p.titulo.replace(/_/g, " ")}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1 text-gray-600">Descrição*</label><textarea required placeholder="Descreva o problema detalhadamente..." value={newData.descricao} onChange={e => setNewData(p => ({ ...p, descricao: e.target.value }))} className="input-style h-28" /></div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Anexos (até 4)</label>
                    <label htmlFor="file-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 hover:border-red-500"><IconPaperClip /><span className="text-gray-500 text-sm">{selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s) selecionado(s)` : "Clique para selecionar"}</span></label>
                    <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    {selectedFiles.length > 0 && <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">{selectedFiles.map((file, i) => <div key={i} className="relative aspect-square"><Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover rounded-md" /></div>)}</div>}
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Enviando...' : 'Enviar Chamado'}</button></div>
        </form>
    );
}

function AddApontamentoForm({ onSuccess, showToast, onClose, chamado, apiUrl }) {

    const [apontamentoData, setApontamentoData] = useState({ descricao: '', comeco: '', fim: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApontamentoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!apontamentoData.descricao || !apontamentoData.comeco || !apontamentoData.fim) {
            showToast("Todos os campos são obrigatórios.", 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/chamados/${chamado.id}/apontamentos`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descricao: apontamentoData.descricao,
                    comeco: new Date(apontamentoData.comeco).toISOString(),
                    fim: new Date(apontamentoData.fim).toISOString()
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao adicionar apontamento.");
            }
            onSuccess('Apontamento adicionado com sucesso!');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <Dialog.Title className="text-xl font-bold leading-6 text-gray-900">Adicionar Apontamento</Dialog.Title>
            <p className="text-sm text-gray-500 mt-1">Para o chamado #{chamado?.id}</p>
            <div className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Descrição da Atividade</label>
                    <textarea
                        required
                        name="descricao"
                        placeholder="Forneça mais detalhes ou uma atualização sobre o problema..."
                        value={apontamentoData.descricao}
                        onChange={handleChange}
                        className="input-style h-24"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Início</label>
                        <input
                            required
                            type="datetime-local"
                            name="comeco"
                            value={apontamentoData.comeco}
                            onChange={handleChange}
                            className="input-style"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-600">Fim</label>
                        <input
                            required
                            type="datetime-local"
                            name="fim"
                            value={apontamentoData.fim}
                            onChange={handleChange}
                            className="input-style"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Enviando...' : 'Salvar Apontamento'}</button>
            </div>
        </form>
    );
}

function ChamadoDetailView({ chamado, apiUrl, apontamentos, isApontamentosLoading, onClose, onAddApontamento }) {

    return (
        <div className="flex flex-col lg:flex-row w-full max-h-[90vh] gap-4">

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full lg:w-2/3 flex flex-col">
                <Dialog.Title className="text-xl font-bold text-gray-900 flex-shrink-0">Detalhes do Chamado <span className="font-mono text-gray-400">#{chamado?.id}</span></Dialog.Title>
                <div className='mt-4 flex-grow overflow-y-auto custom-scrollbar pr-4 text-gray-700 space-y-4'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong className="block text-gray-500">Equipamento</strong>{chamado?.nome_equipamento || 'N/A'}</div>
                        <div><strong className="block text-gray-500">Patrimônio</strong>{chamado?.patrimonio_numero === '0' ? 'N/A' : chamado?.patrimonio_numero}</div>
                        <div><strong className="block text-gray-500">Status</strong><StatusBadge status={chamado?.status} /></div>
                        <div><strong className="block text-gray-500">Tipo</strong>{chamado?.tipo_chamado.replace(/_/g, " ")}</div>
                        <div><strong className="block text-gray-500">Técnico</strong>{chamado?.nome_tecnico || 'Aguardando'}</div>
                        <div><strong className="block text-gray-500">Abertura</strong>{new Date(chamado.criado_em).toLocaleString('pt-BR')}</div>
                    </div>
                    <div><strong className="block text-gray-500 mb-1 text-sm">Descrição do Problema</strong><p className="p-3 bg-gray-50 rounded-md text-sm">{chamado?.descricao}</p></div>
                    {chamado?.solucao && (<div><strong className="block text-gray-500 mb-1 text-sm">Solução Aplicada</strong><p className="p-3 bg-green-50 text-green-800 rounded-md text-sm">{chamado.solucao}</p></div>)}
                    {chamado?.anexos && JSON.parse(chamado.anexos).length > 0 && (<div><strong className="block text-gray-500 mb-2 text-sm">Anexos</strong><div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{JSON.parse(chamado.anexos).map(anexo => (<a key={anexo} href={`${apiUrl}/uploads/${anexo}`} target="_blank" rel="noopener noreferrer" className="relative aspect-square block group"><Image src={`${apiUrl}/uploads/${anexo}`} alt="Anexo" fill className="object-cover rounded-md" /></a>))}</div></div>)}
                </div>
                <div className="flex-shrink-0 flex justify-end items-center gap-4 pt-6 mt-auto border-t border-gray-200">
                    <button type="button" onClick={onAddApontamento} className="btn-primary flex items-center" disabled={chamado?.status !== 'Em andamento'}>
                        <IconPlus />
                        Adicionar Apontamento
                    </button>
                    <button type="button" onClick={onClose} className="btn-secondary">Fechar</button>
                </div>
            </div>

            <div className="w-full lg:w-1/3 p-6 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col">
                <h4 className="font-bold text-lg text-gray-800 mb-4 flex-shrink-0">Últimos Apontamentos</h4>
                <div className="flex-grow overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-3">
                    {isApontamentosLoading ? <p className="text-sm text-gray-500 text-center pt-4">Carregando...</p> :
                        apontamentos.length > 0 ? (
                            [...apontamentos].reverse().map(ap => (
                                <div key={ap.id} className="bg-gray-50 border p-3 rounded-md animate-fade-in">
                                    <p className="text-sm text-gray-700 mb-2">{ap.descricao}</p>
                                    <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
                                        <p><strong>Autor:</strong> {ap.nome_tecnico || 'Usuário'}</p>
                                        <p className="font-mono">{new Date(ap.comeco).toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (<div className="flex flex-col items-center justify-center h-full text-center"><IconClipboardCheck /><p className="mt-2 font-semibold text-gray-600">Nenhuma Atividade</p><p className="text-xs text-gray-500">Sem apontamentos para este chamado.</p></div>)}
                </div>
            </div>
        </div>
    );
}