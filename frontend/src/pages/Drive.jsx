import { useState, useEffect } from 'react'
import { 
  FileText, Shield, Search, Filter, Clock, MoreVertical, Download, 
  Trash2, Eye, Folder, Star, Grid, List as ListIcon, Share2, 
  Loader2, AlertCircle, Plus, HardDrive
} from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'react-toastify'
import api from '../services/api'

import { DocumentViewerModal } from '../components/ui/DocumentViewerModal'

export function Drive() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, documents, contracts
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [fetchingDoc, setFetchingDoc] = useState(false)

  const handleView = async (item) => {
    setFetchingDoc(true)
    try {
      const endpoint = item.type === 'document' ? `/documents/${item.id}` : `/contracts/${item.id}`
      const response = await api.get(endpoint)
      setSelectedDoc({ ...response.data, type: item.type })
    } catch (error) {
      console.error('View error:', error)
      toast.error('Не удалось загрузить содержимое файла')
    } finally {
      setFetchingDoc(false)
    }
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      const [docsRes, contractsRes] = await Promise.all([
        api.get('/documents?limit=50'),
        api.get('/contracts?limit=50')
      ])
      
      const docs = (docsRes.data.items || []).map(d => ({
        ...d,
        type: 'document',
        title: getDocTitle(d.document_type),
        icon: FileText,
        color: 'text-[#0A84FF]'
      }))
      
      const contracts = (contractsRes.data.items || []).map(c => ({
        ...c,
        type: 'contract',
        title: c.original_file_name,
        icon: Shield,
        color: 'text-amber-500'
      }))
      
      const combined = [...docs, ...contracts].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
      
      setItems(combined)
    } catch (error) {
      console.error('Failed to load drive items:', error)
      toast.error('Ошибка при загрузке файлов')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const getDocTitle = (type) => {
    const titles = {
      claim: 'Исковое заявление',
      complaint: 'Жалоба',
      demand: 'Претензия',
      contract_sale: 'Договор купли-продажи',
      contract_employment: 'Трудовой договор',
      power_of_attorney: 'Доверенность'
    }
    return titles[type] || 'Документ'
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Вы уверены, что хотите удалить "${item.title}"?`)) return
    try {
      const endpoint = item.type === 'document' ? `/documents/${item.id}` : `/contracts/${item.id}`
      await api.delete(endpoint)
      setItems(items.filter(i => i.id !== item.id))
      toast.success('Удалено')
    } catch (error) {
      toast.error('Ошибка при удалении')
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'documents' && item.type === 'document') || 
                         (filter === 'contracts' && item.type === 'contract')
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-2 sm:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white flex items-center gap-3 italic uppercase tracking-tighter">
            <HardDrive className="w-8 h-8 text-[#0A84FF]" /> Моё хранилище
          </h1>
          <p className="text-white/40 font-medium text-sm">Ваша личная библиотека юридических документов</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="secondary" onClick={loadItems} className="rounded-2xl h-12 bg-white/5 border-white/5">
              <Clock className="w-4 h-4 mr-2" /> Обновить
           </Button>
           <Button onClick={() => window.location.href='/dashboard/documents'} className="rounded-2xl h-12 gap-2 font-black uppercase tracking-widest text-[10px] px-6">
              <Plus className="w-4 h-4" /> Создать новый
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{items.filter(i => i.type === 'document').length}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Документов создано</div>
            </div>
         </div>
         <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">{items.filter(i => i.type === 'contract').length}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Договоров проверено</div>
            </div>
         </div>
         <div className="p-8 rounded-[40px] bg-gradient-to-br from-[#0A84FF]/10 to-transparent border border-[#0A84FF]/20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0A84FF]/20 flex items-center justify-center text-[#0A84FF]">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-black text-white">Drive</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0A84FF]">Smart Cloud Storage</div>
            </div>
         </div>
      </div>

      <Card className="rounded-[40px] border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl">
        <CardBody className="p-0">
          {/* Toolbar */}
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.01]">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input 
                placeholder="Поиск по названию..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 bg-white/5 border-white/10 rounded-2xl h-12"
              />
            </div>
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'Все' },
                { id: 'documents', label: 'Генератор' },
                { id: 'contracts', label: 'Аудит' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === t.id ? 'bg-[#0A84FF] text-white' : 'text-white/20 hover:text-white/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/20">Название</th>
                    <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/20">Тип</th>
                    <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/20">Дата</th>
                    <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/20 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-white/20 font-medium italic text-lg">
                        Файлы не найдены
                      </td>
                    </tr>
                  ) : filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-6 px-8">
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                               <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="font-bold text-white group-hover:text-[#0A84FF] transition-colors">{item.title}</div>
                               <div className="text-[10px] font-black text-white/10 uppercase tracking-widest">{item.id.split('-')[0]}...</div>
                            </div>
                         </div>
                      </td>
                      <td className="py-6 px-8">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 ${item.type === 'contract' ? 'bg-amber-500/10 text-amber-500' : 'bg-[#0A84FF]/10 text-[#0A84FF]'}`}>
                            {item.type === 'contract' ? 'Аудит' : 'AI Генерация'}
                         </span>
                      </td>
                      <td className="py-6 px-8 text-white/40 font-medium">
                        {new Date(item.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-6 px-8">
                         <div className="flex items-center justify-end gap-3 transition-all">
                            <button 
                              onClick={() => setSelectedDoc(item)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 hover:bg-[#0A84FF] hover:text-white transition-all shadow-sm"
                              title="Просмотреть"
                            >
                               <Eye className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Удалить"
                            >
                               <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </CardBody>
      </Card>
      
      {/* Modal for viewing docs */}
      <DocumentViewerModal 
        isOpen={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)} 
        document={selectedDoc} 
      />
    </div>
  )
}
