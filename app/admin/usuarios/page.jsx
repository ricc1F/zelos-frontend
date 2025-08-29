"use client";

import { useState, useEffect, useCallback, useMemo, Fragment, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../../../app/context/SearchContet';
import { Dialog, Transition } from '@headlessui/react';
import ChatBot from "../../ChatBot";

// Ícones
const IconPlus = () => <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg>;
const IconPencil = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const IconUserCircle = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg>;
const IconToggleOn = () => <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const IconToggleOff = () => <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const IconX = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// Constantes de Estilo
const inputStyles = "w-full bg-[#2a2a2a] p-2 rounded text-sm text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 appearance-none pr-8 bg-no-repeat bg-right-2 bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]";

// Componentes

const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'Ativo' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-400'
        }`}>
        {status}
    </span>
);
const CompetencyBadge = ({ competencia }) => (<span className="px-2 py-1 text-xs font-semibold bg-gray-700 text-gray-300 rounded-md">{competencia.replace(/_/g, ' ')}</span>);
function Toast({ show, message, type, onclose }) {
    if (!show) return null;

    return (
        <div
            className={`fixed bottom-5 right-5 z-[100] w-auto max-w-sm flex items-center gap-4 p-4 rounded-lg shadow-2xl border ${type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} text-white animate-slide-in-up`}
        >
            <IconCheckCircle />
            <span className="flex-grow">{message}</span>
            <button
                onClick={onclose}
                className="ml-4 p-1 rounded-full hover:bg-black/20 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

export default function UsuariosPage() {
    const { searchTerm } = useSearch();
    const [users, setUsers] = useState([]);
    const [allPools, setAllPools] = useState([]);
    const [modalType, setModalType] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({ funcao: '', status: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const toastTimerRef = useRef(null);

    const showToast = useCallback((message, type = 'success') => { clearTimeout(toastTimerRef.current); setToast({ show: true, message, type }); toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000); }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token'); if (!token) { router.push('/login'); return; }
        try {
            const [usersRes, poolsRes] = await Promise.all([fetch(`${apiUrl}/usuarios`, { headers: { Authorization: `Bearer ${token}` } }), fetch(`${apiUrl}/pools/admin`, { headers: { Authorization: `Bearer ${token}` } }),]);
            if (!usersRes.ok || !poolsRes.ok) throw new Error('Falha ao buscar dados.');
            const [usersData, poolsData] = await Promise.all([usersRes.json(), poolsRes.json()]);
            setUsers(usersData); setAllPools(poolsData);
        } catch (err) { console.error(err.message); showToast(err.message, 'error'); }
        finally { setIsLoading(false); }
    }, [apiUrl, router, showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredUsers = useMemo(() => users.filter(user => (searchTerm ? user.nome.toLowerCase().includes(searchTerm.toLowerCase()) : true) && (filters.funcao ? user.funcao === filters.funcao : true) && (filters.status ? user.status === filters.status : true)), [users, searchTerm, filters]);

    const handleOpenModal = (type, user = null) => { setSelectedUser(user); setModalType(type); };
    const handleCloseModals = () => setModalType(null);
    const handleSuccess = useCallback((message) => { showToast(message); fetchData(); handleCloseModals(); }, [showToast, fetchData]);
    const handleError = useCallback((message) => { showToast(message, 'error'); }, [showToast]);

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'Ativo' ? 'Inativo' : 'Ativo';
        try {
            const token = localStorage.getItem('token');
            const payload = { nome: user.nome, email: user.email, funcao: user.funcao, status: newStatus };

            const res = await fetch(`${apiUrl}/usuarios/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Falha ao alterar status.');
            handleSuccess(`Status de ${user.nome} alterado para ${newStatus}!`);
        } catch (err) { handleError(err.message); }
    };
    return (
        <>
            <Toast show={toast.show} message={toast.message} type={toast.type} onclose={() => setToast({ show: false })} />
            <main className="flex-1 flex flex-col bg-gray-900/50 h-full overflow-hidden">
                <div className="p-6 bg-[#1f1f1f] border-b border-gray-800 space-y-4 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h2>
                        <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center"><IconPlus /> Criar Usuário</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                        <div className='w-full'><label className="text-xs text-gray-400">Cargo</label><select value={filters.funcao} onChange={e => setFilters({ ...filters, funcao: e.target.value })} className={`${inputStyles} mt-1`}><option value="">Todos os Cargos</option><option value="admin">Admin</option><option value="tecnico">Técnico</option><option value="usuario">Usuário</option></select></div>
                        <div className='w-full'><label className="text-xs text-gray-400">Status</label><select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className={`${inputStyles} mt-1`}><option value="">Todos os Status</option><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>
                        <button onClick={() => setFilters({ funcao: '', status: '' })} className="btn-secondary w-full bg-gray-600 text hover:bg-gray-500 text-white md:col-start-5">Limpar Filtros</button>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {isLoading ? <p className="text-center text-gray-400">Carregando...</p> : (
                        <div className="overflow-x-auto bg-[#1a1a1a] rounded-lg border border-gray-700/50">
                            <table className="min-w-full text-sm text-left"><thead className="text-xs text-gray-400 uppercase bg-gray-800/50"><tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3">Função</th><th className="px-6 py-3">Competências</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Ações</th></tr></thead><tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4 font-medium text-white">{user.nome}<p className="text-xs text-gray-400 font-normal">{user.email}</p></td>
                                        <td className="px-6 py-4 capitalize">{user.funcao}</td>
                                        <td className="px-6 py-4"><div className="flex flex-wrap gap-2">{user.competencias && user.competencias.length > 0 ? user.competencias.map(c => <CompetencyBadge key={c} competencia={c} />) : <span className="text-xs text-gray-500">N/A</span>}</div></td>
                                        <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                                        <td className="px-6 py-4 text-right"><div className='flex items-center justify-end gap-2'>
                                            {user.funcao === 'tecnico' && (<button onClick={() => handleOpenModal('competencies', user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Gerenciar Competências"><IconUserCircle /></button>)}
                                            <button onClick={() => handleOpenModal('edit', user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md" title="Editar"><IconPencil /></button>
                                            <button onClick={() => handleToggleStatus(user)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md">{user.status === 'Ativo' ? <IconToggleOff title="Inativar" /> : <IconToggleOn title="Ativar" />}</button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody></table>
                        </div>
                    )}
                </div>
            </main>
            <UserModal isOpen={!!modalType} onClose={handleCloseModals} type={modalType} user={selectedUser} allPools={allPools} onSuccess={handleSuccess} onError={handleError} />
            <ChatBot />
        </>
    );
}

function UserModal({ isOpen, onClose, type, user, allPools, onSuccess, onError }) {
    if (!isOpen) return null;
    const getModalContent = () => {
        switch (type) {
            case 'create': return <CreateUserForm onSuccess={onSuccess} onError={onError} onClose={onClose} />;
            case 'edit': return <EditUserForm user={user} onSuccess={onSuccess} onError={onError} onClose={onClose} />;
            case 'competencies': return <CompetenciesForm user={user} allPools={allPools} onSuccess={onSuccess} onError={onError} onClose={onClose} />;
            default: return null;
        }
    };
    return (<Transition appear show={isOpen} as={Fragment}><Dialog as="div" className="relative z-50" onClose={onClose}><Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" }}><div className="fixed inset-0 bg-black/70" /></Transition.Child><div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center"><Transition.Child as={Fragment} {...{ enter: "ease-out duration-300", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95" }}><Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-[#1c1c1c] p-6 text-left align-middle shadow-xl transition-all">{getModalContent()}</Dialog.Panel></Transition.Child></div></div></Dialog></Transition>);
}

function CreateUserForm({ onSuccess, onError, onClose }) {
    const [formData, setFormData] = useState({ nome: '', email: '', senha: '', funcao: 'usuario' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); try { const token = localStorage.getItem('token'); const res = await fetch(`${apiUrl}/usuarios`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) }); const data = await res.json(); if (!res.ok) throw new Error(data.message || "Falha ao criar usuário"); onSuccess('Usuário criado com sucesso!'); } catch (error) { onError(error.message); } finally { setIsSubmitting(false); } };
    return (<form onSubmit={handleSubmit}><Dialog.Title className="text-xl font-bold leading-6 text-white">Criar Novo Usuário</Dialog.Title><div className="mt-4 space-y-4"><input required placeholder="Nome Completo" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className={inputStyles} /><input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputStyles} /><input required type="password" placeholder="Senha" value={formData.senha} onChange={e => setFormData({ ...formData, senha: e.target.value })} className={inputStyles} /><select value={formData.funcao} onChange={e => setFormData({ ...formData, funcao: e.target.value })} className={inputStyles}><option value="usuario">Usuário</option><option value="tecnico">Técnico</option><option value="admin">Admin</option></select></div><div className="mt-8 flex justify-end gap-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar'}</button></div></form>);
}

function EditUserForm({ user, onSuccess, onError, onClose }) {
    const [formData, setFormData] = useState({ nome: user.nome, email: user.email, funcao: user.funcao, status: user.status });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); try { const token = localStorage.getItem('token'); const res = await fetch(`${apiUrl}/usuarios/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) }); if (!res.ok) throw new Error((await res.json()).message || "Falha ao editar usuário"); onSuccess('Usuário atualizado com sucesso!'); } catch (error) { onError(error.message); } finally { setIsSubmitting(false); } };
    return (<form onSubmit={handleSubmit}><Dialog.Title className="text-xl font-bold leading-6 text-white">Editar Usuário</Dialog.Title><div className="mt-4 space-y-4"><input required placeholder="Nome Completo" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className={inputStyles} /><input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputStyles} /><select value={formData.funcao} onChange={e => setFormData({ ...formData, funcao: e.target.value })} className={inputStyles}><option value="usuario">Usuário</option><option value="tecnico">Técnico</option><option value="admin">Admin</option></select><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputStyles}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div><div className="mt-8 flex justify-end gap-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</button></div></form>);
}

function CompetenciesForm({ user, allPools, onSuccess, onError, onClose }) {
    const [current, setCurrent] = useState(() => allPools.filter(p => user.competencias?.includes(p.titulo)));
    const [available, setAvailable] = useState(() => allPools.filter(p => !user.competencias?.includes(p.titulo)));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const handleAdd = (poolId) => { if (!poolId) return; const poolToAdd = available.find(p => p.id === parseInt(poolId)); if (poolToAdd) { setCurrent([...current, poolToAdd]); setAvailable(available.filter(p => p.id !== parseInt(poolId))); } };
    const handleRemove = (poolToRemove) => { setAvailable([...available, poolToRemove].sort((a, b) => a.titulo.localeCompare(b.titulo))); setCurrent(current.filter(p => p.id !== poolToRemove.id)); };
    const handleSave = async () => { setIsSubmitting(true); const token = localStorage.getItem('token'); const toAdd = current.filter(p => !user.competencias?.includes(p.titulo)); const toRemove = allPools.filter(p => user.competencias?.includes(p.titulo) && !current.some(c => c.id === p.id)); try { const addPromises = toAdd.map(pool => fetch(`${apiUrl}/pools/${pool.id}/tecnicos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id_tecnico: user.id }) })); const removePromises = toRemove.map(pool => fetch(`${apiUrl}/pools/${pool.id}/tecnicos/${user.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })); const results = await Promise.all([...addPromises, ...removePromises]); for (const res of results) { if (!res.ok) throw new Error("Uma ou mais operações falharam.") } onSuccess('Competências atualizadas!'); } catch (err) { onError('Erro ao atualizar competências.'); } finally { setIsSubmitting(false); } };
    return (<><Dialog.Title className="text-xl font-bold text-white mb-6">Gerenciar Competências de {user?.nome}</Dialog.Title><div className="mt-4 space-y-6"><label className="text-sm font-medium text-gray-300">Competências Atuais</label><div className="flex flex-wrap gap-2 p-2 bg-[#2a2a2a] rounded-md min-h-[40px] border border-gray-600">{current.length > 0 ? current.map(pool => (<span key={pool.id} className="flex items-center gap-2 px-2 py-1 text-xs font-semibold bg-red-800 text-white rounded-md">{pool.titulo.replace(/_/g, ' ')}<button onClick={() => handleRemove(pool)} className="text-red-200 hover:text-white"><IconX /></button></span>)) : <p className="text-xs text-gray-500 p-1">Nenhuma competência atribuída.</p>}</div></div><div><label className="text-sm font-medium text-gray-300">Adicionar Nova</label><select value="" onChange={e => handleAdd(e.target.value)} className={`${inputStyles} mt-2`}><option value="">Selecione para adicionar...</option>{available.map(p => <option key={p.id} value={p.id}>{p.titulo.replace(/_/g, ' ')}</option>)}</select></div><div className="mt-8 flex justify-end gap-4"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="button" onClick={handleSave} disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</button></div></>);
}