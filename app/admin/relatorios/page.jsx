"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Menu, Transition } from '@headlessui/react';
import ChatBot from "../../ChatBot";

// Registrando componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler);

//  Ícones 
const IconChevronDown = () => <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const IconFileDownload = () => <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const IconCheckCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconExclamationCircle = () => <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

//  Componente Toast 
function Toast({ message, type, onclose }) {
  return (
    <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 p-4 rounded-lg shadow-2xl border text-white ${type === 'success' ? 'bg-green-600/90 border-green-500' : 'bg-red-600/90 border-red-500'} animate-fade-in`}>
      {type === 'success' ? <IconCheckCircle /> : <IconExclamationCircle />}
      <span>{message}</span>
      <button onClick={onclose} className="ml-4">&times;</button>
    </div>
  );
}

//  Componente ChartReport 
const ChartReport = ({ id, title, children, reportRefs, handleExportPDF, handleExportPNG, handleExportCSV, chartData, headers, keys }) => (
  <div className="bg-[#1a1a1a] border border-gray-700/50 p-6 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <Menu as="div" className="relative">
        <Menu.Button className="p-2 rounded-md hover:bg-gray-700 text-gray-400"><IconChevronDown /></Menu.Button>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-gray-800 rounded-md shadow-lg z-10">
            <Menu.Item><button onClick={() => handleExportPDF(id, title)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-red-600"><IconFileDownload /> Exportar PDF</button></Menu.Item>
            <Menu.Item><button onClick={() => handleExportPNG(id, title)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-red-600"><IconFileDownload /> Exportar PNG</button></Menu.Item>
            {handleExportCSV && <Menu.Item><button onClick={() => handleExportCSV(chartData, title, headers, keys)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-red-600"><IconFileDownload /> Exportar CSV</button></Menu.Item>}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
    <div ref={el => reportRefs.current[id] = el} className="h-60">{children}</div>
  </div>
);

const TableReport = ({ id, title, data, headers, keys, reportRefs, handleExportPDF, handleExportCSV, scrollable = false }) => (
  <div className="bg-[#1a1a1a] border border-gray-700/50 p-6 rounded-lg flex flex-col">
    <div className="flex justify-between items-center mb-4 flex-shrink-0">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <Menu as="div" className="relative">
        <Menu.Button className="p-2 rounded-md hover:bg-gray-700 text-gray-400"><IconChevronDown /></Menu.Button>
        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-gray-800 rounded-md shadow-lg z-10">
            <Menu.Item><button onClick={() => handleExportPDF(id, title, data, headers, keys)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-red-600"><IconFileDownload /> Exportar PDF</button></Menu.Item>
            <Menu.Item><button onClick={() => handleExportCSV(data, title, headers, keys)} className="group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-red-600"><IconFileDownload /> Exportar CSV</button></Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
    <div ref={el => reportRefs.current[id] = el} className={`overflow-auto ${scrollable ? 'max-h-96 custom-scrollbar' : ''}`}>
      <table className="min-w-full text-sm text-left text-white border-separate border-spacing-0">
        <thead className="bg-gray-800 sticky top-0">
          <tr>{headers.map((h, i) => <th key={i} className="px-4 py-2 border-b border-gray-700">{h}</th>)}</tr>
        </thead>
        <tbody>
          {data?.length ? data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-[#2a2a2a]" : "bg-[#2f2f2f]"}>
              {keys.map((k, i) => <td key={i} className="px-4 py-2 border-b border-gray-700/50">{row[k]}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={headers.length} className="px-4 py-2 text-center text-gray-400">Nenhum dado disponível</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function RelatoriosPage() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [reportsData, setReportsData] = useState({ status: [], tipo: [], tecnicos: [], porDia: [], porEquipamento: [], logs: [] });
  const [filters, setFilters] = useState({ dataInicio: '', dataFim: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRefs = useRef({});

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimerRef = useRef(null);
  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast({ show: false, message: '', type }), 4000);
  };

  const inputStyles = "w-full bg-[#2a2a2a] p-2 rounded text-sm text-white border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200";

  const fetchReports = useCallback(async (currentFilters) => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setIsLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilters.dataInicio) params.append('data_inicio', currentFilters.dataInicio);
      if (currentFilters.dataFim) params.append('data_fim', currentFilters.dataFim);
      const queryString = params.toString();

      const endpoints = ['status', 'tipo', 'tecnicos', 'chamados-por-dia', 'por-equipamento', 'logs']; // Added 'logs'
      const responses = await Promise.all(
        endpoints.map(ep => fetch(`${apiUrl}/relatorios/${ep}?${queryString}`, { headers: { Authorization: `Bearer ${token}` } }))
      );

      for (const res of responses) { if (!res.ok) throw new Error('Falha ao buscar relatórios.'); }

      const [status, tipo, tecnicos, porDia, porEquipamento, logs] = await Promise.all(responses.map(res => res.json()));
      setReportsData({ status, tipo, tecnicos, porDia, porEquipamento, logs }); // Updated state

    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }, [apiUrl, router]);

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];
    const initialFilters = { dataInicio: firstDayOfMonth, dataFim: todayString };
    setFilters(initialFilters);
    fetchReports(initialFilters);
  }, [fetchReports]);

  const handleFilterSubmit = () => fetchReports(filters);
  const handleClearFilters = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];
    const initialFilters = { dataInicio: firstDayOfMonth, dataFim: todayString };
    setFilters(initialFilters);
    fetchReports(initialFilters);
  };

  const handleExportPNG = async (elementId, reportTitle) => {
    const element = reportRefs.current[elementId];
    if (!element) return;
    showToast('Gerando PNG...', 'success');
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#1a1a1a', scale: 2 });
      const link = document.createElement('a');
      link.download = `${reportTitle.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      showToast('Falha ao exportar PNG.', 'error');
    }
  };


  //  FUNÇÃO DE EXPORTAÇÃO DE PDF 
  const handleExportPDF = async (elementId, reportTitle, data, headers, keys) => {
    const element = reportRefs.current[elementId];
    if (!element) return;

    const isChart = !!element.querySelector('canvas');

    if (isChart) {

      showToast('Gerando PDF do Gráfico...', 'success');
      try {
        const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape' });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.height / imgProps.width;

        let imgWidth = pdfWidth - 40;
        let imgHeight = imgWidth * ratio;

        if (imgHeight > pdfHeight - 80) {
          imgHeight = pdfHeight - 80;
          imgWidth = imgHeight / ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;

        pdf.setFontSize(18);
        pdf.text(reportTitle, 20, 30);

        pdf.addImage(imgData, 'PNG', x, 50, imgWidth, imgHeight);
        pdf.save(`${reportTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      } catch (error) {
        showToast('Falha ao exportar PDF do gráfico.', 'error');
        console.error(error);
      }
    } else {

      showToast('Gerando PDF da Tabela...', 'success');
      try {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(18);
        doc.text(reportTitle, 14, 22);
        const tableBody = data.map(row => keys.map(key => row[key] ?? 'N/A'));

        autoTable(doc, {
          head: [headers],
          body: tableBody,
          startY: 30,
          theme: 'grid',
          headStyles: { fillColor: '#e11d48' }
        });

        doc.save(`${reportTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      } catch (error) {
        showToast('Falha ao exportar PDF da tabela.', 'error');
        console.error(error);
      }
    }
  };


  const handleExportCSV = (data, reportTitle, headers, keys) => {
    if (!data || data.length === 0) {
      showToast('Nenhum dado para exportar.', 'error');
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    data.forEach(row => {
      const values = keys.map(key => {
        let value = row[key] === null || row[key] === undefined ? '' : row[key];
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvContent += values.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportTitle.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //  Configurações dos Gráficos 
  const vibrantPalette = ['#e11d48', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  const pastelPalette = ['rgba(225, 29, 72, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'];
  const chartBaseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#d1d5db', font: { size: 14 } } }, title: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } } } };

  const statusChartData = { labels: reportsData.status.map(item => item.status), datasets: [{ data: reportsData.status.map(item => item.total), backgroundColor: pastelPalette, borderColor: vibrantPalette, borderWidth: 2 }] };
  const tipoChartData = { labels: reportsData.tipo.map(item => item.tipo_chamado), datasets: [{ label: 'Total', data: reportsData.tipo.map(item => item.total), backgroundColor: vibrantPalette, borderWidth: 1, borderRadius: 4 }] };
  const porDiaChartData = { labels: reportsData.porDia.map(item => new Date(item.dia + "T00:00:00").toLocaleDateString("pt-BR")), datasets: [{ label: "Abertos", data: reportsData.porDia.map(item => item.total_abertos), borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.3)", fill: true, tension: 0.4 }, { label: "Concluídos", data: reportsData.porDia.map(item => item.total_fechados), borderColor: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.3)", fill: true, tension: 0.4 },] };

  return (
    <main className="flex-1 flex flex-col bg-gray-900/50 h-full overflow-hidden">
      {toast.show && <Toast message={toast.message} type={toast.type} onclose={() => setToast({ show: false })} />}

      <div className="p-4 sm:p-6 bg-[#1f1f1f] border-b border-gray-800 space-y-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white">Relatórios Gerenciais</h2>
        <div className="flex flex-col sm:flex-row items-end gap-3 w-full">
          <div className='flex-1 w-full sm:w-auto'>
            <label className="text-xs text-gray-400">Data Início</label>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => setFilters(p => ({ ...p, dataInicio: e.target.value }))}
              className={`${inputStyles} mt-1 w-full`}
            />
          </div>
          <div className='flex-1 w-full sm:w-auto'>
            <label className="text-xs text-gray-400">Data Fim</label>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => setFilters(p => ({ ...p, dataFim: e.target.value }))}
              className={`${inputStyles} mt-1 w-full`}
            />
          </div>
          <div className='flex-1 w-full sm:w-auto'>
            <button
              onClick={handleFilterSubmit}
              className="w-full h-[42px] flex items-center justify-center bg-red-600 text-sm rounded-md hover:bg-red-700 font-semibold transition-colors px-5"
            >
              Filtrar
            </button>
          </div>
          <div className='flex-1 w-full sm:w-auto'>
            <button
              onClick={handleClearFilters}
              className="w-full h-[42px] flex items-center justify-center bg-gray-600 text-sm rounded-md hover:bg-gray-500 transition-colors px-5"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        {isLoading ? <p className="text-center text-gray-400 mt-8">Gerando relatórios...</p> :
          error ? <p className="text-center text-red-500 mt-8">{error}</p> :
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartReport id="status-chart" title="Chamados por Status" reportRefs={reportRefs} handleExportPDF={handleExportPDF} handleExportPNG={handleExportPNG} chartData={reportsData.status} handleExportCSV={handleExportCSV} headers={['Status', 'Total']} keys={['status', 'total']}><Doughnut data={statusChartData} options={chartBaseOptions} /></ChartReport>
                <ChartReport id="tipo-chart" title="Chamados por Tipo" reportRefs={reportRefs} handleExportPDF={handleExportPDF} handleExportPNG={handleExportPNG} chartData={reportsData.tipo} handleExportCSV={handleExportCSV} headers={['Tipo de Chamado', 'Total']} keys={['tipo_chamado', 'total']}><Bar data={tipoChartData} options={chartBaseOptions} /></ChartReport>
              </div>
              <ChartReport id="fluxo-chart" title="Fluxo de Chamados" reportRefs={reportRefs} handleExportPDF={handleExportPDF} handleExportPNG={handleExportPNG} chartData={reportsData.porDia} handleExportCSV={handleExportCSV} headers={['Dia', 'Abertos', 'Concluídos']} keys={['dia', 'total_abertos', 'total_fechados']}><Line data={porDiaChartData} options={chartBaseOptions} /></ChartReport>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TableReport id="tecnicos-report" title="Desempenho por Técnico" data={reportsData.tecnicos} headers={["Técnico", "Chamados Concluídos"]} keys={["nome_tecnico", "concluidos"]} reportRefs={reportRefs} handleExportPDF={handleExportPDF} handleExportCSV={handleExportCSV} />
                <TableReport id="equipamentos-report" title="Equipamentos com Chamados (Crescente)" data={reportsData.porEquipamento} headers={["Equipamento", "Nº de Chamados"]} keys={["nome_equipamento", "total_chamados"]} reportRefs={reportRefs} handleExportPDF={handleExportPDF} handleExportCSV={handleExportCSV} scrollable={true} />
              </div>
              <TableReport id="logs-report" title="Logs de Atividades" data={reportsData.logs} headers={["Data", "Atividade Realizada", "Chamado ID", "Usuário", "Perfil"]} keys={["data_hora", "atividade", "chamado_id", "usuario", "perfil"]} reportRefs={reportRefs} handleExportPDF={handleExportPDF} handleExportCSV={handleExportCSV} scrollable={true} />
            </div>}
      </div>

      <ChatBot />
    </main>
    
  );
}