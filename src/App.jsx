import React, { useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowUpRight, BookOpen, ChevronDown, ChevronRight, CloudUpload,
  File, FileSpreadsheet, FileText, Folder, FolderOpen, Gauge, HardDrive,
  LayoutDashboard, Menu, Search, Settings, ShieldCheck, SlidersHorizontal,
  X, Zap, Factory, Download, Eye, Plus, Trash2, Upload, Monitor, Wrench
} from 'lucide-react'
import * as XLSX from 'xlsx'

const modules = [
  { id:'energy', title:'Energy Monitoring', desc:'Electrical energy, power quality and consumption', icon:Zap, tone:'amber', tag:'MONITORING', url:'#' },
  { id:'equipment', title:'Equipment Monitoring', desc:'Live equipment status, alarms and operating data', icon:Activity, tone:'cyan', tag:'MONITORING', url:'#' },
  { id:'datasheet', title:'Datasheet', desc:'Electrical, HVAC and mechanical specifications', icon:FileText, tone:'blue', tag:'LIBRARY', url:'#' },
  { id:'document', title:'Document', desc:'Engineering documents, drawings and spreadsheets', icon:FolderOpen, tone:'green', tag:'LIBRARY', url:'#' },
  { id:'manual', title:'Technical Manual', desc:'Operation, maintenance and troubleshooting guides', icon:BookOpen, tone:'orange', tag:'LIBRARY', url:'#' },
]

const initialDocs = [
  { id:1, name:'Compressor Technical Datasheet', file:'compressor-datasheet.pdf', category:'HVAC', type:'PDF', size:'2.4 MB', updated:'10 Nov 2026', description:'Compressor performance and operating specifications' },
  { id:2, name:'Electrical Panel Load Schedule', file:'panel-load-schedule.xlsx', category:'Electrical', type:'XLSX', size:'840 KB', updated:'08 Nov 2026', description:'Panel loads, breaker ratings and cable schedule' },
  { id:3, name:'Flake Ice Machine Operation Manual', file:'flake-ice-manual.pdf', category:'Technical Manual', type:'PDF', size:'5.1 MB', updated:'04 Nov 2026', description:'Operating procedures and routine maintenance' },
  { id:4, name:'Pump & Motor Specification', file:'pump-motor-spec.pdf', category:'Mechanical', type:'PDF', size:'1.8 MB', updated:'02 Nov 2026', description:'Motor ratings, pump curves and dimensions' },
]

const categories = ['All files','Electrical','HVAC','Mechanical','Document','Technical Manual']
const iconFor = (type) => type === 'XLSX' || type === 'XLS' ? FileSpreadsheet : FileText

function App() {
  const [active, setActive] = useState('home')
  const [docs, setDocs] = useState(initialDocs)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All files')
  const [selected, setSelected] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [admin, setAdmin] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const fileRef = useRef(null)

  const filteredDocs = useMemo(() => docs.filter(d =>
    (category === 'All files' || d.category === category) &&
    `${d.name} ${d.file} ${d.category}`.toLowerCase().includes(query.toLowerCase())
  ), [docs, category, query])

  const openDoc = async (doc) => {
    setSelected(doc)
    setPreviewData(null)
    if (doc.localFile && (doc.type === 'XLSX' || doc.type === 'XLS')) {
      const buffer = await doc.localFile.arrayBuffer()
      const workbook = XLSX.read(buffer, { type:'array' })
      const sheets = workbook.SheetNames.map(name => ({
        name,
        rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header:1, defval:'' }).slice(0,100)
      }))
      setPreviewData({ kind:'excel', sheets })
    } else if (doc.localUrl && doc.type === 'PDF') {
      setPreviewData({ kind:'pdf', url:doc.localUrl })
    } else {
      setPreviewData({ kind:'placeholder' })
    }
  }

  const uploadFiles = (list) => {
    const added = Array.from(list || []).map((file, i) => {
      const ext = file.name.split('.').pop().toUpperCase()
      const type = ext === 'XLS' ? 'XLS' : ext === 'XLSX' ? 'XLSX' : ext === 'PDF' ? 'PDF' : ext
      const localUrl = URL.createObjectURL(file)
      return {
        id:Date.now()+i, name:file.name.replace(/\.[^.]+$/, ''), file:file.name,
        category:category === 'All files' ? 'Document' : category,
        type, size:file.size > 1024*1024 ? `${(file.size/1024/1024).toFixed(1)} MB` : `${Math.max(1,Math.round(file.size/1024))} KB`,
        updated:'Just now', description:'Locally added preview file', localFile:file, localUrl
      }
    })
    setDocs(old => [...added, ...old])
    setShowUpload(false)
  }

  const navigate = (id) => {
    setActive(id)
    setMobileNav(false)
    if (id === 'datasheet') setCategory('All files')
    if (id === 'document') setCategory('Document')
    if (id === 'manual') setCategory('Technical Manual')
  }

  const sidebar = (
    <>
      <div className="brand">
        <div className="brand-mark"><Factory size={21}/></div>
        <div><b>ENGINEERING</b><span>PORTAL</span></div>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <button className={`nav-item ${active==='home'?'active':''}`} onClick={()=>navigate('home')}><LayoutDashboard size={18}/> Dashboard</button>
      {modules.slice(0,2).map(m => <button key={m.id} className={`nav-item ${active===m.id?'active':''}`} onClick={()=>navigate(m.id)}><m.icon size={18}/> {m.title}</button>)}
      <div className="nav-label spaced">KNOWLEDGE CENTER</div>
      {modules.slice(2).map(m => <button key={m.id} className={`nav-item ${active===m.id?'active':''}`} onClick={()=>navigate(m.id)}><m.icon size={18}/> {m.title}</button>)}
      <div className="sidebar-bottom">
        <div className="storage-card">
          <div className="storage-icon"><HardDrive size={17}/></div>
          <div><b>Document storage</b><span>Google Drive integration</span></div>
          <span className="soon-dot"></span>
        </div>
        <button className="nav-item" onClick={()=>setAdmin(!admin)}><Settings size={18}/> {admin?'Exit admin preview':'Admin settings'}</button>
        <div className="profile"><div className="avatar">EN</div><div><b>Engineering Team</b><span>{admin?'Admin preview':'Portal workspace'}</span></div><ChevronDown size={15}/></div>
      </div>
    </>
  )

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'mobile-open':''}`}>{sidebar}</aside>
    {mobileNav && <div className="scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main">
      <header className="topbar">
        <button className="mobile-menu icon-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><b>{active==='home'?'Dashboard':modules.find(m=>m.id===active)?.title || 'Dashboard'}</b></div>
        <div className="top-actions"><span className="status-pill"><i/> All systems ready</span><div className="top-avatar">EN</div></div>
      </header>
      <div className="page-content">
        {active==='home' ? <Dashboard navigate={navigate} docs={docs}/> :
          active==='datasheet' || active==='document' || active==='manual' ? <Library
            title={modules.find(m=>m.id===active)?.title || 'Document Library'}
            docs={filteredDocs} query={query} setQuery={setQuery} category={category}
            setCategory={setCategory} openDoc={openDoc} admin={admin}
            onUpload={()=>setShowUpload(true)} onDelete={id=>setDocs(old=>old.filter(d=>d.id!==id))}
            active={active}
          /> :
          <ModulePage module={modules.find(m=>m.id===active)} />}
      </div>
    </main>

    {showUpload && <div className="modal-backdrop" onClick={()=>setShowUpload(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><div><h3>Upload documents</h3><p>Add files to the document library preview</p></div><button className="icon-btn" onClick={()=>setShowUpload(false)}><X size={19}/></button></div>
      <div className="upload-zone" onClick={()=>fileRef.current?.click()}><div className="upload-round"><CloudUpload size={25}/></div><b>Choose files to upload</b><span>PDF, XLS, XLSX, DOCX · Multiple files supported</span><button className="primary-btn small"><Plus size={15}/> Browse files</button><input ref={fileRef} type="file" multiple accept=".pdf,.xls,.xlsx,.doc,.docx,.png,.jpg" hidden onChange={e=>uploadFiles(e.target.files)}/></div>
      <div className="notice"><ShieldCheck size={17}/> <span><b>Demo mode:</b> files are previewed locally in this browser. Google Drive upload will be connected in the backend integration step.</span></div>
    </div></div>}

    {selected && <div className="modal-backdrop viewer-backdrop" onClick={()=>setSelected(null)}><div className="viewer-modal" onClick={e=>e.stopPropagation()}>
      <div className="viewer-head"><div className="viewer-file-icon"><FileText size={19}/></div><div className="viewer-title"><b>{selected.name}</b><span>{selected.file} · {selected.size}</span></div><button className="icon-btn" onClick={()=>setSelected(null)}><X size={20}/></button></div>
      <div className="viewer-body">
        {previewData?.kind==='pdf' ? <iframe title={selected.name} src={previewData.url}/> :
         previewData?.kind==='excel' ? <ExcelPreview data={previewData}/> :
         <div className="empty-preview"><div className="empty-preview-icon"><Eye size={28}/></div><h3>Document preview</h3><p>This sample document is a placeholder. Upload a real PDF or Excel file in Admin Preview to test the in-browser viewer.</p><span className="preview-tag">BROWSER PREVIEW</span></div>}
      </div>
      <div className="viewer-foot"><span><ShieldCheck size={15}/> View-only preview</span><span>Download is not required to view</span></div>
    </div></div>}
  </div>
}

function Dashboard({ navigate, docs }) {
  return <div className="dashboard-page">
    <div className="welcome-row"><div><div className="eyebrow"><span/> ENGINEERING DEPARTMENT</div><h1>Engineering Workspace</h1><p>Your central hub for monitoring, equipment information, and technical documentation.</p></div><div className="welcome-art"><div className="art-circle"><Factory size={42}/></div><div className="art-line"/></div></div>
    <div className="section-heading"><div><h2>Quick access</h2><p>Select a workspace to continue</p></div><span className="section-meta">05 MODULES</span></div>
    <div className="module-grid">
      {modules.map((m,i)=><button key={m.id} className={`module-card ${m.id==='manual'?'wide':''}`} onClick={()=>navigate(m.id)}>
        <div className="module-top"><div className={`module-icon ${m.tone}`}><m.icon size={21}/></div><span className="module-tag">{m.tag}</span></div>
        <div className="module-copy"><h3>{m.title}</h3><p>{m.desc}</p></div>
        <div className="module-bottom"><span>Open module</span><span className="arrow-circle"><ArrowUpRight size={16}/></span></div>
      </button>)}
    </div>
    <div className="bottom-grid">
      <div className="panel recent-panel"><div className="panel-heading"><div><h3>Recently added</h3><p>Latest documents in the library</p></div><button className="text-btn" onClick={()=>navigate('document')}>View library <ArrowUpRight size={14}/></button></div>
        {docs.slice(0,3).map(d=><div className="recent-item" key={d.id}><div className={`file-icon ${d.type==='XLSX'?'excel':''}`}>{d.type==='XLSX'?<FileSpreadsheet size={18}/>:<FileText size={18}/>}</div><div className="recent-info"><b>{d.name}</b><span>{d.category} · {d.updated}</span></div><span className="file-type">{d.type}</span></div>)}
      </div>
      <div className="panel storage-panel"><div className="storage-panel-icon"><CloudUpload size={21}/></div><h3>One place for every document</h3><p>Keep datasheets, drawings, spreadsheets and technical manuals organized in one searchable library.</p><button className="outline-btn" onClick={()=>navigate('datasheet')}>Explore library <ArrowUpRight size={15}/></button><div className="drive-note"><span className="drive-dot"/> Google Drive storage planned</div></div>
    </div>
    <footer className="page-footer"><span>ENGINEERING PORTAL <b>·</b> VERSION 1.0</span><span>Built for engineering operations</span></footer>
  </div>
}

function Library({ title, docs, query, setQuery, category, setCategory, openDoc, admin, onUpload, onDelete, active }) {
  const visibleCategories = active==='datasheet' ? ['All files','Electrical','HVAC','Mechanical'] : active==='manual' ? ['All files','Technical Manual'] : ['All files','Document','Electrical','HVAC','Mechanical','Technical Manual']
  return <div className="library-page">
    <div className="library-title-row"><div><div className="eyebrow"><span/> KNOWLEDGE CENTER</div><h1>{title}</h1><p>Browse, search and preview engineering files directly in your browser.</p></div>{admin && <button className="primary-btn" onClick={onUpload}><Upload size={16}/> Upload files</button>}</div>
    <div className="library-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by file name, equipment or model..."/>{query && <button onClick={()=>setQuery('')}><X size={15}/></button>}</div><div className="filter-select"><SlidersHorizontal size={16}/><select value={category} onChange={e=>setCategory(e.target.value)}>{visibleCategories.map(c=><option key={c}>{c}</option>)}</select><ChevronDown size={14}/></div></div>
    <div className="library-summary"><span><b>{docs.length}</b> files found</span><span><i/> Preview available for PDF & Excel</span></div>
    <div className="document-list">
      {docs.length ? docs.map(d=>{const Icon=iconFor(d.type); return <div className="document-row" key={d.id}><div className={`document-icon ${d.type==='XLSX'||d.type==='XLS'?'excel':''}`}><Icon size={21}/></div><div className="document-main"><b>{d.name}</b><span>{d.file}</span></div><span className="doc-category">{d.category}</span><span className="doc-size">{d.size}</span><span className="doc-date">{d.updated}</span><button className="view-btn" onClick={()=>openDoc(d)}><Eye size={15}/> Preview</button>{admin && <button className="icon-btn delete-btn" title="Remove from demo list" onClick={()=>onDelete(d.id)}><Trash2 size={16}/></button>}</div>}) : <div className="no-results"><FolderOpen size={28}/><b>No documents found</b><span>Try a different search term or category.</span></div>}
    </div>
    {!admin && <div className="user-hint"><ShieldCheck size={16}/> You are viewing the library in read-only mode. Admin access is required to upload or manage files.</div>}
    <footer className="page-footer"><span>ENGINEERING PORTAL <b>·</b> DOCUMENT LIBRARY</span><span>Google Drive connection pending</span></footer>
  </div>
}

function ExcelPreview({ data }) {
  const [sheet, setSheet] = useState(0)
  const current = data.sheets[sheet]
  return <div className="excel-preview"><div className="sheet-tabs">{data.sheets.map((s,i)=><button className={sheet===i?'selected':''} onClick={()=>setSheet(i)} key={s.name}>{s.name}</button>)}</div><div className="sheet-scroll"><table><tbody>{current.rows.map((row,ri)=><tr key={ri}><th>{ri+1}</th>{row.map((cell,ci)=><td key={ci}>{String(cell)}</td>)}</tr>)}</tbody></table></div></div>
}

function ModulePage({ module }) {
  const Icon = module?.icon || Monitor
  return <div className="module-placeholder"><div className={`module-icon ${module?.tone || 'blue'}`}><Icon size={25}/></div><div className="eyebrow"><span/> MODULE ACCESS</div><h1>{module?.title}</h1><p>{module?.desc}</p><div className="integration-card"><Wrench size={19}/><div><b>Module URL not configured yet</b><span>Add your existing monitoring website URL to connect this module to the portal.</span></div></div><span className="preview-tag">INTEGRATION PLACEHOLDER</span></div>
}

export default App
