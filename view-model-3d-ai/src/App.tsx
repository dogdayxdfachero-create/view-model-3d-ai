import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Box, WandSparkles, FolderOpen, Settings2, Download, Upload, Search, Plus,
  ChevronDown, Sparkles, RotateCcw, Grid3X3, Eye, EyeOff, Palette, Image,
  Layers3, Clock3, Check, AlertCircle, LoaderCircle, Cuboid, SlidersHorizontal
} from "lucide-react";

type ModelKind = "crystal" | "orb" | "robot" | "tree" | "imported";
type Asset = { id: string; name: string; kind: ModelKind; prompt: string; color: string; created: string; file?: File };

const starterAssets: Asset[] = [
  { id: "a1", name: "Cristal arcano", kind: "crystal", prompt: "Un cristal mágico facetado, fantasía estilizada", color: "#8d79ff", created: "Hace 2 min" },
  { id: "a2", name: "Orbe solar", kind: "orb", prompt: "Una esfera energética dorada con anillos", color: "#f0ae5b", created: "Hace 1 h" },
  { id: "a3", name: "Robot explorador", kind: "robot", prompt: "Un pequeño robot explorador de ciencia ficción", color: "#6bdbc2", created: "Ayer" },
  { id: "a4", name: "Árbol antiguo", kind: "tree", prompt: "Un árbol de fantasía con copa frondosa", color: "#79bb8d", created: "Ayer" }
];

function ProceduralModel({ kind, color, wireframe = false }: { kind: ModelKind; color: string; wireframe?: boolean }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.16, wireframe }), [color, wireframe]);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#252b3b", roughness: 0.4, metalness: 0.45, wireframe }), [wireframe]);
  if (kind === "orb") return <Float speed={1.1} rotationIntensity={0.4} floatIntensity={0.2}>
    <mesh material={material}><icosahedronGeometry args={[1.05, 2]} /></mesh>
    <mesh rotation={[Math.PI / 2.5, 0.2, 0]}><torusGeometry args={[1.45, 0.035, 12, 100]} /><meshStandardMaterial color="#f5d08a" metalness={0.7} roughness={0.25} /></mesh>
    <mesh rotation={[0.7, 0.2, 0.7]}><torusGeometry args={[1.65, 0.022, 10, 100]} /><meshStandardMaterial color="#e9a84e" metalness={0.7} roughness={0.25} /></mesh>
  </Float>;
  if (kind === "robot") return <group>
    <mesh position={[0, 0.45, 0]} material={material}><boxGeometry args={[1.05, 0.9, 0.8]} /></mesh>
    <mesh position={[0, 1.12, 0]} material={dark}><boxGeometry args={[0.82, 0.55, 0.72]} /></mesh>
    {[-0.2, 0.2].map(x => <mesh key={x} position={[x, 1.15, 0.37]}><sphereGeometry args={[0.075, 16, 16]} /><meshStandardMaterial color="#8fffe2" emissive="#4ce0be" emissiveIntensity={1.8} /></mesh>)}
    {[-0.67, 0.67].map(x => <mesh key={x} position={[x, 0.42, 0]} material={dark}><boxGeometry args={[0.22, 0.72, 0.24]} /></mesh>)}
    {[-0.3, 0.3].map(x => <mesh key={x} position={[x, -0.35, 0]} material={dark}><boxGeometry args={[0.25, 0.55, 0.3]} /></mesh>)}
    <mesh position={[0, 1.5, 0]} material={dark}><cylinderGeometry args={[0.035, 0.035, 0.25, 10]} /></mesh>
    <mesh position={[0, 1.64, 0]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} /></mesh>
  </group>;
  if (kind === "tree") return <group>
    <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.18, 0.3, 1.35, 8]} /><meshStandardMaterial color="#8a6042" roughness={0.95} /></mesh>
    {[[-0.35, 0.7, 0], [0.3, 0.85, 0.12], [0, 1.2, -0.18], [0.45, 0.45, -0.15], [-0.45, 0.45, 0.2]].map((p, i) =>
      <mesh key={i} position={p as [number, number, number]} material={material}><icosahedronGeometry args={[0.58, 1]} /></mesh>)}
  </group>;
  return <group>
    <mesh material={material} rotation={[0.1, 0.25, 0]}><octahedronGeometry args={[1.2, 0]} /></mesh>
    <mesh rotation={[0.2, 0.6, 0.1]}><octahedronGeometry args={[0.76, 0]} /><meshStandardMaterial color="#c3b8ff" roughness={0.22} metalness={0.3} wireframe={wireframe} /></mesh>
    <mesh position={[0, -1.05, 0]}><cylinderGeometry args={[0.6, 0.85, 0.18, 6]} /><meshStandardMaterial color="#35314d" metalness={0.45} roughness={0.35} /></mesh>
  </group>;
}

function ModelScene({ asset, color, wireframe, showGrid }: { asset: Asset; color: string; wireframe: boolean; showGrid: boolean }) {
  const inputUrl = useMemo(() => asset.file ? URL.createObjectURL(asset.file) : "", [asset.file]);
  const [loadedObject, setLoadedObject] = useState<THREE.Object3D | null>(null);
  // Uploaded files are available for download; actual GLB/GLTF rendering is handled by the import panel message.
  return <Canvas camera={{ position: [4, 3, 5], fov: 38 }} shadows dpr={[1, 2]}>
    <color attach="background" args={["#10131b"]} />
    <ambientLight intensity={1.2} />
    <directionalLight position={[4, 6, 4]} intensity={2.2} castShadow />
    <pointLight position={[-4, 2, -3]} intensity={1.1} color="#7770ff" />
    <Suspense fallback={<Html center><span style={{color:"white"}}>Cargando modelo…</span></Html>}>
      {loadedObject ? <primitive object={loadedObject} /> : <ProceduralModel kind={asset.kind} color={color} wireframe={wireframe} />}
      <Environment preset="city" />
    </Suspense>
    {showGrid && <Grid position={[0, -1.35, 0]} args={[12, 12]} cellSize={0.5} cellThickness={0.5} cellColor="#313748" sectionSize={2} sectionThickness={1} sectionColor="#515c78" fadeDistance={18} infiniteGrid />}
    <ContactShadows position={[0, -1.34, 0]} opacity={0.32} scale={8} blur={2.5} far={3} />
    <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={2.5} maxDistance={12} />
  </Canvas>;
}

export default function App() {
  const [assets, setAssets] = useState(starterAssets);
  const [activeId, setActiveId] = useState("a1");
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"generate" | "library">("generate");
  const [color, setColor] = useState("#8d79ff");
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Modo demostración: el visor y las herramientas visuales funcionan; la generación por IA real requiere conectar un proveedor.");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const active = assets.find(a => a.id === activeId) ?? assets[0];

  async function generate() {
    const text = prompt.trim();
    if (!text) { setNotice("Escribe una descripción del modelo que quieres crear."); return; }
    setBusy(true);
    setNotice("Enviando solicitud…");
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text }) });
      const data = await res.json();
      if (data.mode === "demo" || !data.model) {
        const item: Asset = { id: `demo-${Date.now()}`, name: text.slice(0, 25), kind: "crystal", prompt: text, color, created: "Ahora" };
        setAssets(prev => [item, ...prev]); setActiveId(item.id);
        setNotice("Vista previa de demostración creada. Esto NO es una malla generada por IA; conecta un proveedor para generar geometría real.");
      } else {
        setNotice("El proveedor respondió. Falta implementar la importación del formato que devuelva para visualizarlo.");
      }
    } catch {
      const item: Asset = { id: `demo-${Date.now()}`, name: text.slice(0, 25), kind: "crystal", prompt: text, color, created: "Ahora" };
      setAssets(prev => [item, ...prev]); setActiveId(item.id);
      setNotice("Servidor no conectado: se creó una vista previa demo, no un modelo real generado por IA.");
    } finally { setBusy(false); }
  }

  function importFile(file?: File) {
    if (!file) return;
    const item: Asset = { id: `import-${Date.now()}`, name: file.name.replace(/\.[^.]+$/, "").slice(0, 28), kind: "imported", prompt: `Archivo importado: ${file.name}`, color, created: "Ahora", file };
    setAssets(prev => [item, ...prev]); setActiveId(item.id);
    setNotice(`Archivo "${file.name}" añadido a la biblioteca local. La vista 3D de archivos GLB/GLTF se conectará en la siguiente iteración; puedes conservar y descargar el archivo original.`);
  }
  function downloadActive() {
    if (active.file) {
      const url = URL.createObjectURL(active.file); const a = document.createElement("a"); a.href = url; a.download = active.file.name; a.click(); URL.revokeObjectURL(url);
    } else {
      const payload = { app: "View Model 3D AI", asset: active.name, prompt: active.prompt, color, type: active.kind, note: "Metadata preview only; not a production mesh." };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${active.name.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "modelo"}-preview.json`; a.click(); URL.revokeObjectURL(url);
      setNotice("Descargaste los metadatos de la vista previa, NO un modelo 3D. Para descargar mallas reales hace falta integrar generación 3D por IA.");
    }
  }

  const visibleAssets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Cuboid size={23} /></div><div><b>VIEW MODEL</b><span>3D AI STUDIO</span></div></div>
      <div className="workspace"><div className="workspace-icon">V</div><div className="workspace-copy"><b>Mi espacio</b><small>Plan gratuito · Demo</small></div><ChevronDown size={15} /></div>
      <div className="nav-label">CREAR</div>
      <button className={`nav-item ${activeTab === "generate" ? "selected" : ""}`} onClick={() => setActiveTab("generate")}><WandSparkles size={18} /> Generador 3D <span className="new-pill">AI</span></button>
      <button className={`nav-item ${activeTab === "library" ? "selected" : ""}`} onClick={() => setActiveTab("library")}><FolderOpen size={18} /> Mi biblioteca <span className="nav-count">{assets.length}</span></button>
      <button className="nav-item" onClick={() => fileRef.current?.click()}><Upload size={18} /> Importar modelo</button>
      <input ref={fileRef} type="file" accept=".glb,.gltf,.obj,.stl,.fbx" hidden onChange={e => importFile(e.target.files?.[0])} />
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Sparkles size={17} /></div><b>Tu taller 3D</b><p>Construye una biblioteca de modelos y prepara tu flujo de creación.</p><button onClick={() => setNotice("La versión gratuita no limita el visor. La generación real dependerá del proveedor de IA y sus cuotas.")}>Ver funciones <span>↗</span></button></div><div className="profile"><div className="avatar">M</div><div><b>Mi cuenta</b><small>Espacio personal</small></div><Settings2 size={17} /></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{activeTab === "generate" ? "Generador 3D" : "Mi biblioteca"}</b></div><div className="top-actions"><span className="status-dot"></span><span className="status-text">Sistema de vista previa</span><button className="icon-button" title="Ajustes" onClick={() => setNotice("Configuración: el proyecto está preparado para añadir proveedor de IA mediante variables de entorno.")}><Settings2 size={18} /></button></div></header>
      <div className="content">
        <section className="page-heading"><div><div className="eyebrow"><Sparkles size={14} /> TU ESPACIO CREATIVO</div><h1>{activeTab === "generate" ? "Dale forma a tus ideas." : "Tu biblioteca 3D."}</h1><p>{activeTab === "generate" ? "Describe tu idea y trabaja con ella en un espacio 3D interactivo." : "Tus modelos y archivos, organizados en un solo lugar."}</p></div><button className="secondary-button" onClick={() => fileRef.current?.click()}><Upload size={16} /> Importar modelo</button></section>

        {activeTab === "generate" && <section className="prompt-card"><div className="prompt-top"><div className="prompt-icon"><WandSparkles size={19} /></div><div><h2>Generador de modelos</h2><p>Describe el objeto, el estilo y los detalles que necesitas.</p></div><span className="beta-badge">PREVIEW</span></div><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ej. Un cofre antiguo de fantasía, madera oscura, bordes de oro envejecido, runas azules brillantes, estilo videojuego..." rows={3} /><div className="prompt-footer"><span><Sparkles size={14} /> Sé específico con materiales, forma y estilo.</span><button className="primary-button" onClick={generate} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <WandSparkles size={17} />}{busy ? "Procesando…" : "Crear vista previa"} <span>→</span></button></div></section>}

        <section className="workbench">
          <div className="viewer-panel">
            <div className="panel-heading"><div><h2>{active?.name ?? "Vista 3D"}</h2><p><span className="live-dot"></span> VISOR INTERACTIVO <span className="muted-sep">·</span> {active?.kind === "imported" ? "ARCHIVO IMPORTADO" : "OBJETO DE DEMOSTRACIÓN"}</p></div><div className="viewer-head-actions"><button className="icon-button" title="Mostrar cuadrícula" onClick={() => setShowGrid(!showGrid)}>{showGrid ? <Grid3X3 size={17} /> : <EyeOff size={17} />}</button><button className="icon-button" title="Reiniciar vista" onClick={() => setNotice("Para centrar la cámara, arrastra el visor; rueda para zoom.")}><RotateCcw size={17} /></button><button className="download-button" onClick={downloadActive}><Download size={15} /> Exportar</button></div></div>
            <div className="canvas-wrap"><ModelScene asset={active} color={color} wireframe={wireframe} showGrid={showGrid} /><div className="canvas-tag"><span className="green-dot"></span> 3D VIEWPORT <span className="tag-divider">/</span> PERSPECTIVE</div><div className="canvas-controls"><span>Arrastrar <b>Orbitar</b></span><span>Rueda <b>Zoom</b></span><span>Mayús + arrastrar <b>Desplazar</b></span></div></div>
            <div className="viewer-footer"><div className="model-type"><div className="mini-cube"><Box size={16} /></div><div><b>{active?.name}</b><small>{active?.prompt}</small></div></div><div className="viewport-stats"><span><Layers3 size={14} /> Vista previa</span><span><Check size={14} /> Interactivo</span></div></div>
          </div>
          <aside className="properties-panel"><div className="properties-header"><div><SlidersHorizontal size={17} /><h2>Propiedades</h2></div><span className="properties-dots">•••</span></div><div className="property-section"><div className="section-title"><Palette size={15} /> APARIENCIA</div><label className="field-label">Color del material</label><div className="color-picker-row"><div className="color-swatch" style={{background: color}}></div><code>{color.toUpperCase()}</code><input aria-label="Color del material" type="color" value={color} onChange={e => setColor(e.target.value)} /></div><div className="swatches">{["#8d79ff","#6bdbc2","#f0ae5b","#ec759b","#e9edf7","#79bb8d"].map(c => <button key={c} className={`swatch ${c === color ? "active" : ""}`} style={{background:c}} onClick={() => setColor(c)} aria-label={`Color ${c}`} />)}</div><div className="toggle-row"><div><b>Modo alambre</b><small>Mostrar aristas de la geometría</small></div><button className={`toggle ${wireframe ? "on" : ""}`} onClick={() => setWireframe(!wireframe)}><span /></button></div></div><div className="property-section"><div className="section-title"><Image size={15} /> TEXTURAS</div><div className="texture-empty"><div className="texture-icon"><Image size={19} /></div><b>Texturizado PBR</b><p>Prepara materiales base, rugosidad y metalicidad para el flujo de texturas.</p><button onClick={() => setNotice("El panel visual es una base. Aplicar texturas PBR generadas por IA requiere conectar un servicio de texturizado y asignar sus mapas al material 3D.")}>Configurar material <span>→</span></button></div></div><div className="property-section details-section"><div className="section-title"><Settings2 size={15} /> DETALLES</div><div className="detail-row"><span>Formato</span><b>{active?.file?.name.split(".").pop()?.toUpperCase() || "Preview"}</b></div><div className="detail-row"><span>Estado</span><b className="detail-status">● {active?.kind === "imported" ? "Importado" : "Demo"}</b></div><div className="detail-row"><span>Creado</span><b>{active?.created}</b></div></div></aside>
        </section>

        <section className="library-section"><div className="library-heading"><div><h2>{activeTab === "library" ? "Todos los modelos" : "Empieza con una idea"}</h2><p>{activeTab === "library" ? "Selecciona un elemento para verlo en el visor." : "Ejemplos para explorar el espacio de trabajo."}</p></div><div className="library-tools"><div className="search-box"><Search size={15} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar modelos..." /></div><button className="icon-button" onClick={() => setAssets(prev => [...prev])} title="Actualizar"><RotateCcw size={16} /></button></div></div><div className="asset-grid">{visibleAssets.slice(0, 8).map(asset => <button key={asset.id} className={`asset-card ${activeId === asset.id ? "active" : ""}`} onClick={() => {setActiveId(asset.id); setColor(asset.color);}}><div className="asset-preview"><div className="asset-preview-glow" style={{background: asset.color}}></div><div className="asset-cube" style={{color:asset.color}}>{asset.kind === "orb" ? "◉" : asset.kind === "robot" ? "▣" : asset.kind === "tree" ? "♣" : asset.kind === "imported" ? "▱" : "◆"}</div><span className="asset-format">{asset.kind === "imported" ? "FILE" : "3D"}</span></div><div className="asset-info"><b>{asset.name}</b><small><Clock3 size={12} /> {asset.created}</small></div></button>)}<button className="add-card" onClick={() => fileRef.current?.click()}><div><Plus size={22} /></div><b>Añadir modelo</b><span>Importa un archivo 3D</span></button></div></section>
        {notice && <div className="notice"><AlertCircle size={16} /><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}
        <footer><span>VIEW MODEL 3D AI <span className="footer-dot">·</span> ESPACIO DE CREACIÓN</span><span>Prototipo funcional · Generación real por conectar</span></footer>
      </div>
    </main>
  </div>;
}
