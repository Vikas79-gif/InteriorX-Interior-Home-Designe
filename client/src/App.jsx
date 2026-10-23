import React, { useEffect, useMemo, useState } from 'react';
import {
  Armchair, ArrowDownRight, ArrowRight, Bath, BedDouble, Check, ChevronDown,
  CircleHelp, Clock3, Compass, Heart, House, Lamp, LayoutGrid, Menu, Plus,
  Search, Settings2, Sofa, Sparkles, Trash2, X
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const styles = [
  { name: 'Warm Minimal', type: 'MINIMALIST', tone: '#d6c4ad', image: 'photo-1600210492486-724fe5c67fb0', desc: 'Quiet forms, warm neutrals, and thoughtful details.' },
  { name: 'Modern Organic', type: 'CONTEMPORARY', tone: '#b7b6a4', image: 'photo-1600607687939-ce8a6c25118c', desc: 'Natural textures meet clean, modern lines.' },
  { name: 'Scandinavian', type: 'SCANDINAVIAN', tone: '#e4d9c8', image: 'photo-1600210491369-e753d80a41f3', desc: 'Light-filled rooms and functional simplicity.' },
  { name: 'Earth & Clay', type: 'BOHEMIAN', tone: '#bb8064', image: 'photo-1616486338812-3dadae4b4ace', desc: 'Layered textures and earthy, expressive color.' }
];
const furnitureCatalog = [
  { id: 'sofa', name: 'Linen Sofa', category: 'Living room', price: 48000, icon: 'sofa', color: '#b6a18a' },
  { id: 'table', name: 'Oak Coffee Table', category: 'Living room', price: 12500, icon: 'table', color: '#bd9569' },
  { id: 'lamp', name: 'Arc Floor Lamp', category: 'Lighting', price: 6800, icon: 'lamp', color: '#c7b28b' },
  { id: 'plant', name: 'Indoor Olive Tree', category: 'Decor', price: 4200, icon: 'plant', color: '#788b70' },
  { id: 'bed', name: 'Platform Bed', category: 'Bedroom', price: 36500, icon: 'bed', color: '#c4b6a5' },
  { id: 'chair', name: 'Accent Chair', category: 'Seating', price: 14500, icon: 'chair', color: '#9d806e' }
];
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const initialDesign = { name: 'My calm living room', roomType: 'Living room', style: 'Warm Minimal', wallColor: '#e8dfd2', floorColor: '#c8aa89', furniture: ['sofa', 'table', 'lamp', 'plant'] };

function IconFor({ type, size = 20 }) {
  const props = { size, strokeWidth: 1.7 };
  if (type === 'sofa' || type === 'chair') return <Sofa {...props} />;
  if (type === 'lamp') return <Lamp {...props} />;
  if (type === 'bed') return <BedDouble {...props} />;
  if (type === 'plant') return <Sparkles {...props} />;
  return <LayoutGrid {...props} />;
}

function App() {
  const [page, setPage] = useState('Home');
  const [design, setDesign] = useState(initialDesign);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [apiMode, setApiMode] = useState('checking');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`${API}/health`, { signal: AbortSignal.timeout(1500) });
        if (!response.ok) throw new Error('API unavailable');
        if (!cancelled) {
          setApiMode('api');
          const res = await fetch(`${API}/designs`);
          if (res.ok) setProjects(await res.json());
        }
      } catch {
        if (!cancelled) {
          setApiMode('local');
          try { setProjects(JSON.parse(localStorage.getItem('interiorx-projects') || '[]')); }
          catch { setProjects([]); }
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const selectedFurniture = useMemo(
    () => furnitureCatalog.filter(item => design.furniture.includes(item.id)),
    [design.furniture]
  );
  const furnitureTotal = selectedFurniture.reduce((sum, item) => sum + item.price, 0);
  const roomEstimate = furnitureTotal + 18000 + 12000;
  const filteredStyles = styles.filter(s => `${s.name} ${s.type}`.toLowerCase().includes(search.toLowerCase()));

  function updateDesign(key, value) {
    setDesign(prev => ({ ...prev, [key]: value }));
  }
  function toggleFurniture(id) {
    setDesign(prev => ({
      ...prev,
      furniture: prev.furniture.includes(id)
        ? prev.furniture.filter(x => x !== id)
        : [...prev.furniture, id]
    }));
  }
  async function saveDesign() {
    setSaving(true);
    const record = { ...design, furnitureItems: selectedFurniture, estimatedBudget: roomEstimate };
    try {
      if (apiMode === 'api') {
        const response = await fetch(`${API}/designs`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record)
        });
        if (!response.ok) throw new Error('Could not save');
        const saved = await response.json();
        setProjects(prev => [saved, ...prev]);
      } else {
        const saved = { ...record, _id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        const next = [saved, ...projects];
        setProjects(next);
        localStorage.setItem('interiorx-projects', JSON.stringify(next));
      }
      setNotice('Design saved to My Projects');
    } catch {
      setNotice('Could not save. Check that the backend is running.');
    } finally {
      setSaving(false);
    }
  }
  async function deleteProject(id) {
    try {
      if (apiMode === 'api') await fetch(`${API}/designs/${id}`, { method: 'DELETE' });
      const next = projects.filter(p => p._id !== id);
      setProjects(next);
      if (apiMode !== 'api') localStorage.setItem('interiorx-projects', JSON.stringify(next));
      setNotice('Project removed');
    } catch { setNotice('Could not remove project'); }
  }
  function loadProject(project) {
    setDesign({
      name: project.name || 'Untitled room',
      roomType: project.roomType || 'Living room',
      style: project.style || 'Warm Minimal',
      wallColor: project.wallColor || '#e8dfd2',
      floorColor: project.floorColor || '#c8aa89',
      furniture: project.furniture || []
    });
    setPage('Designer');
    setNotice('Project loaded into the designer');
  }

  const navItems = [
    { label: 'Home', icon: House },
    { label: 'Room Designer', icon: Compass },
    { label: 'My Projects', icon: LayoutGrid }
  ];
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><House size={19} /></span><span>interior<span className="brand-light">x</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => { setPage(label); setMobileNav(false); }}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
              {label === 'My Projects' && <span className="nav-count">{projects.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={18} /></div><strong>Need a little help?</strong><p>Make your dream space feel like you.</p><button onClick={() => setNotice('Tip: choose a room style, then customize colors and furniture.')}>Explore tips <ArrowRight size={14} /></button></div>
          <div className="profile"><div className="avatar">D</div><div className="profile-info"><strong>Design Studio</strong><span>Personal workspace</span></div><Settings2 size={18} className="muted-icon" /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu"><Menu size={20}/></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="top-actions">
            <div className={`status-pill ${apiMode === 'api' ? 'status-live' : ''}`}><span />{apiMode === 'api' ? 'Database connected' : apiMode === 'local' ? 'Local demo mode' : 'Connecting…'}</div>
            <div className="top-avatar">D</div>
          </div>
        </header>

        {page === 'Home' && <section className="page-content">
          <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR SPACE, YOUR STORY</div><h1>Make room for <em>beautiful living.</em></h1><p className="intro">A thoughtful space starts with a little inspiration. Find your style, shape your room, and bring your ideas to life.</p></div><button className="primary-button" onClick={() => setPage('Designer')}>Start designing <ArrowRight size={17}/></button></div>
          <div className="hero-card">
            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85" alt="Warm contemporary living room with neutral furniture" />
            <div className="hero-shade"></div><div className="hero-copy"><span className="hero-tag">THE EDIT · 01</span><h2>Less, but<br/>more meaningful.</h2><p>Warm minimalism is all about living with what you love.</p><button onClick={() => { updateDesign('style', 'Warm Minimal'); setPage('Designer'); }}>Explore this look <ArrowDownRight size={17}/></button></div>
            <div className="hero-caption"><span>01 / 04</span><span>THE ART OF SLOW LIVING</span></div>
          </div>
          <div className="section-heading"><div><span className="eyebrow">FIND YOUR FEELING</span><h2>Explore design styles</h2></div><button className="text-button" onClick={() => setPage('Designer')}>View all styles <ArrowRight size={16}/></button></div>
          <div className="style-grid">{filteredStyles.map((style, i) => <button className="style-card" key={style.name} onClick={() => { updateDesign('style', style.name); setPage('Designer'); }}><div className="style-image"><img src={`https://images.unsplash.com/${style.image}?auto=format&fit=crop&w=800&q=80`} alt={`${style.name} interior style`} loading="lazy"/><span className="style-number">0{i+1}</span><span className="style-arrow"><ArrowDownRight size={18}/></span></div><div className="style-meta"><div><span>{style.type}</span><h3>{style.name}</h3></div><span className="color-dot" style={{background:style.tone}}/></div><p>{style.desc}</p></button>)}</div>
          <div className="bottom-banner"><div className="banner-icon"><Compass size={22}/></div><div><strong>Your room, your rules.</strong><p>Start with a blank canvas and make it your own.</p></div><button className="outline-button" onClick={() => setPage('Designer')}>Open room designer <ArrowRight size={16}/></button></div>
        </section>}

        {page === 'Room Designer' && <section className="page-content designer-page">
          <div className="page-title-row"><div><div className="eyebrow"><Compass size={14}/> DESIGN YOUR SPACE</div><h1>Your room, <em>reimagined.</em></h1><p className="intro">Play with colors, curate your furniture, and make the space yours.</p></div><button className="primary-button" onClick={saveDesign} disabled={saving}>{saving ? 'Saving…' : <><Check size={17}/> Save design</>}</button></div>
          <div className="designer-layout">
            <div className="preview-panel"><div className="panel-top"><div><span className="eyebrow">LIVE PREVIEW</span><h2>{design.roomType} <span className="live-dot"/></h2></div><span className="preview-badge"><Sparkles size={13}/> {design.style}</span></div>
              <div className="room-scene" style={{'--wall':design.wallColor,'--floor':design.floorColor}}>
                <div className="scene-wall"><div className="window"><div/><div/><div/></div><div className="wall-art"><div className="art-shape"/></div><div className="plant-visual"><span/><i/><b/></div>
                  {design.furniture.includes('lamp') && <div className="scene-lamp"><span className="lamp-shade"/><i/></div>}
                  {design.furniture.includes('sofa') && <div className="scene-sofa"><div className="sofa-back"/><div className="sofa-seat"/><div className="sofa-arm left"/><div className="sofa-arm right"/><div className="sofa-leg l1"/><div className="sofa-leg l2"/></div>}
                  {design.furniture.includes('table') && <div className="scene-table"><div/><i/></div>}
                  {design.furniture.includes('bed') && <div className="scene-bed"><div/><i/></div>}
                  {design.furniture.includes('chair') && <div className="scene-chair"><div/><i/></div>}
                  {design.furniture.includes('plant') && <div className="scene-pot"><div className="leaves"><i/><i/><i/><i/><i/></div><span/></div>}
                </div><div className="scene-floor"><div className="rug"/></div>
              </div>
              <div className="preview-footer"><span><span className="small-live-dot"/> Live room preview</span><span>Concept visualization · not to scale</span></div>
            </div>
            <div className="controls-panel">
              <div className="control-section"><div className="control-heading"><span>01</span><h3>Room details</h3></div><label className="field-label">Project name</label><input className="text-input" value={design.name} onChange={e=>updateDesign('name',e.target.value)} placeholder="Give your room a name"/><label className="field-label">Room type</label><div className="select-wrap"><select value={design.roomType} onChange={e=>updateDesign('roomType',e.target.value)}><option>Living room</option><option>Bedroom</option><option>Dining room</option><option>Home office</option><option>Kitchen</option></select><ChevronDown size={16}/></div><label className="field-label">Design style</label><div className="style-chips">{styles.map(s=><button key={s.name} className={design.style===s.name?'selected':''} onClick={()=>updateDesign('style',s.name)}>{s.name}</button>)}</div></div>
              <div className="control-section"><div className="control-heading"><span>02</span><h3>Set your palette</h3></div><label className="field-label">Wall color</label><div className="swatches">{[{c:'#e8dfd2',n:'Linen'},{c:'#d8d7c8',n:'Sage mist'},{c:'#d7b9a5',n:'Clay'},{c:'#f4eee5',n:'Ivory'},{c:'#b9c3c0',n:'Sea glass'},{c:'#c9b4c6',n:'Dusty lilac'}].map(x=><button key={x.c} className={`swatch ${design.wallColor===x.c?'swatch-active':''}`} onClick={()=>updateDesign('wallColor',x.c)} title={x.n} style={{'--swatch':x.c}}><span>{design.wallColor===x.c&&<Check size={15}/>}</span><small>{x.n}</small></button>)}</div><label className="field-label">Floor finish</label><div className="floor-options">{[{c:'#c8aa89',n:'Natural oak'},{c:'#96765d',n:'Walnut'},{c:'#d5cfc3',n:'Light stone'}].map(x=><button key={x.c} className={design.floorColor===x.c?'floor-active':''} onClick={()=>updateDesign('floorColor',x.c)}><span style={{background:x.c}}/>{x.n}</button>)}</div></div>
              <div className="control-section furniture-control"><div className="control-heading"><span>03</span><h3>Curate furniture</h3><span className="item-count">{design.furniture.length} selected</span></div><div className="furniture-list">{furnitureCatalog.map(item=><button key={item.id} className={`furniture-item ${design.furniture.includes(item.id)?'furniture-selected':''}`} onClick={()=>toggleFurniture(item.id)}><span className="furniture-icon" style={{background:item.color+'30',color:'#645b4f'}}><IconFor type={item.icon}/></span><span className="furniture-info"><strong>{item.name}</strong><small>{item.category}</small></span><span className="furniture-price">{money(item.price)}</span><span className="check-box">{design.furniture.includes(item.id)&&<Check size={13}/>}</span></button>)}</div></div>
              <div className="budget-card"><div><span>ESTIMATED PROJECT BUDGET</span><h2>{money(roomEstimate)}</h2><p>Includes furniture, paint & flooring</p></div><div className="budget-breakdown"><span>Furniture <b>{money(furnitureTotal)}</b></span><span>Paint & finish <b>{money(18000)}</b></span><span>Flooring <b>{money(12000)}</b></span></div></div>
              <button className="primary-button full-button" onClick={saveDesign} disabled={saving}>{saving?'Saving design…':'Save this design'} <ArrowRight size={17}/></button>
            </div>
          </div>
        </section>}

        {page === 'My Projects' && <section className="page-content">
          <div className="page-title-row"><div><div className="eyebrow"><LayoutGrid size={14}/> YOUR COLLECTION</div><h1>Spaces in <em>progress.</em></h1><p className="intro">Your saved concepts, all in one place. Pick up where your inspiration left off.</p></div><button className="primary-button" onClick={()=>setPage('Designer')}><Plus size={17}/> New project</button></div>
          {projects.length===0 ? <div className="empty-state"><div className="empty-icon"><House size={28}/></div><h2>Your next favorite room starts here.</h2><p>You haven't saved a design yet. Open the room designer, experiment with colors and furniture, then save your first project.</p><button className="primary-button" onClick={()=>setPage('Designer')}>Create your first design <ArrowRight size={16}/></button></div> : <div className="project-grid">{projects.map((p,i)=><article className="project-card" key={p._id||i}><div className="project-thumb" style={{background:`linear-gradient(135deg, ${p.wallColor||'#e8dfd2'}, ${p.floorColor||'#c8aa89'})`}}><House size={38}/><span>{p.roomType||'Living room'}</span></div><div className="project-card-body"><div className="project-card-top"><span className="project-style">{p.style||'Custom style'}</span><button className="icon-button delete-button" onClick={()=>deleteProject(p._id)} aria-label="Delete project"><Trash2 size={16}/></button></div><h3>{p.name||'Untitled room'}</h3><div className="project-card-footer"><span>{money(p.estimatedBudget||0)}</span><button onClick={()=>loadProject(p)}>Edit project <ArrowRight size={14}/></button></div></div></article>)}</div>}
          <div className="project-note"><Clock3 size={16}/><span>{apiMode==='api'?'Projects are stored in your configured backend database.':'Demo mode saves projects in this browser. Start the backend and configure MongoDB for database persistence.'}</span></div>
        </section>}

        <footer className="app-footer"><span>© 2026 InteriorX Studio</span><span>Designed with intention <Heart size={13}/></span><span>Portfolio project · AAT-1</span></footer>
      </main>
      {mobileNav && <button className="mobile-overlay" onClick={()=>setMobileNav(false)} aria-label="Close menu"/>}
      {notice && <div className="toast"><Check size={17}/>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
    </div>
  );
}

export default App;
