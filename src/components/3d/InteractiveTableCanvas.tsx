import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { PlanogramPosition, PositionAuditState, StoreCenter, VisualElementAuditState } from '../../types';
import { StorePosmItem } from '../../data/storePosmData';
import { 
  RotateCcw, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Maximize2,
  ChevronRight
} from 'lucide-react';

interface InteractiveTableCanvasProps {
  store?: StoreCenter;
  mesaName?: string;
  spaceName?: string;
  positions: PlanogramPosition[];
  auditStates: Record<string, PositionAuditState>;
  selectedPositionId: string | null;
  onSelectPosition: (position: PlanogramPosition) => void;
  relevantTopTable?: StorePosmItem;
  topTableState?: VisualElementAuditState;
  onInspectTopTable?: (item: StorePosmItem) => void;
}

interface ScreenHotspot {
  id: string;
  posNum: number;
  x: number;
  y: number;
  isFrontFacing: boolean;
  cara: string;
  status: 'OK' | 'Incidencia' | 'Pendiente';
  device: string;
}

export const InteractiveTableCanvas: React.FC<InteractiveTableCanvasProps> = ({
  store,
  mesaName,
  spaceName,
  positions,
  auditStates,
  selectedPositionId,
  onSelectPosition,
  relevantTopTable,
  topTableState,
  onInspectTopTable
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [screenHotspots, setScreenHotspots] = useState<ScreenHotspot[]>([]);
  const [activeSide, setActiveSide] = useState<'Cara 1' | 'Cara 2'>('Cara 1');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const effectiveMesaName = mesaName || spaceName || 'MESA 1';
  const effectiveStore: StoreCenter = store || {
    tiendaId: 'GENERIC',
    nombreTienda: 'Mesa Retail',
    retailer: 'MediaMarkt',
    tipoEspacioId: 'Table 1',
    zona: 'Centro',
    region: 'Nacional',
    totalPuestos: positions.length || 22,
    availableSpaces: [effectiveMesaName]
  };

  // Determinar texturas oficiales de Cara 1 y Cara 2 según la tipología de tienda y mesa
  const tableTextures = useMemo(() => {
    const isTable2 = effectiveStore.tipoEspacioId.includes('Table 2');
    const isTableCrf = effectiveStore.tipoEspacioId.includes('Table CRF');
    const isMesa2 = effectiveMesaName.toUpperCase().includes('MESA 2');
    const hasWall = effectiveStore.availableSpaces?.some(
      s => s.toUpperCase().includes('WALL') && !s.toUpperCase().includes('MINIWALL')
    );

    if (isTableCrf) {
      return {
        cara1: './images/tables/table_crf_cara1_render.jpg',
        cara2: './images/tables/table_crf_cara2_render.jpg'
      };
    }
    if (isTable2) {
      if (isMesa2) {
        return {
          cara1: './images/tables/table2_mesa2_cara1.jpg',
          cara2: './images/tables/table2_mesa2_cara2.jpg'
        };
      }
      return {
        cara1: './images/tables/table2_mesa1_cara1_xiaomi18_render.jpg',
        cara2: './images/tables/table2_mesa1_cara2_render.jpg'
      };
    }
    if (hasWall) {
      return {
        cara1: './images/tables/table1_wall_cara1_render.jpg',
        cara2: './images/tables/table1_wall_cara2_render.jpg'
      };
    }
    return {
      cara1: './images/tables/table1_cara1_render.jpg',
      cara2: './images/tables/table1_cara2_render.jpg'
    };
  }, [store, mesaName]);

  // Separar posiciones de Cara 1 y Cara 2
  const { cara1Positions, cara2Positions } = useMemo(() => {
    const c1 = positions.filter(p => p.cara === 'Cara 1');
    const c2 = positions.filter(p => p.cara === 'Cara 2');
    return { cara1Positions: c1, cara2Positions: c2 };
  }, [positions]);

  // Referencias para control orbital
  const targetRotationY = useRef<number>(0);
  const targetRotationX = useRef<number>(0.35); // Inclinación inicial natural
  const currentRotationY = useRef<number>(0);
  const currentRotationX = useRef<number>(0.35);
  const isDragging = useRef<boolean>(false);
  const prevMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Si se selecciona una posición de Cara 2 desde fuera, girar automáticamente a Cara 2
  useEffect(() => {
    if (!selectedPositionId) return;
    const pos = positions.find(p => p.id === selectedPositionId);
    if (pos) {
      if (pos.cara === 'Cara 2') {
        targetRotationY.current = Math.PI;
        setActiveSide('Cara 2');
      } else if (pos.cara === 'Cara 1') {
        targetRotationY.current = 0;
        setActiveSide('Cara 1');
      }
    }
  }, [selectedPositionId, positions]);

  const handleRotateToSide = (side: 'Cara 1' | 'Cara 2') => {
    setActiveSide(side);
    if (side === 'Cara 1') {
      targetRotationY.current = 0;
    } else {
      targetRotationY.current = Math.PI;
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Escena, Cámara y Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b132b');

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.4, 4.2);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Luces de Estudio Retail Xiaomi
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(2, 6, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x00c4cc, 0.4);
    fillLight.position.set(-3, 3, -4);
    scene.add(fillLight);

    // 3. Suelo de la tienda (Parquet / Suelo claro de boutique)
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07111e,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    floor.receiveShadow = true;
    scene.add(floor);

    // 4. Grupo de la Mesa 3D
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    const tableW = 4.2;
    const tableH = 0.8;
    const tableD = 1.5;
    const caraDepth = (tableD - 0.16) / 2; // ~0.67m cada cara

    // Cargar Texturas HD Oficiales
    const textureLoader = new THREE.TextureLoader();
    const texCara1 = textureLoader.load(tableTextures.cara1);
    const texCara2 = textureLoader.load(tableTextures.cara2);
    texCara1.colorSpace = THREE.SRGBColorSpace;
    texCara2.colorSpace = THREE.SRGBColorSpace;

    // A) Tablero Cara 1 (Frontal Z+)
    const matCara1 = new THREE.MeshBasicMaterial({ map: texCara1 });
    const geoCara1 = new THREE.PlaneGeometry(tableW - 0.08, caraDepth);
    const meshCara1 = new THREE.Mesh(geoCara1, matCara1);
    meshCara1.rotation.x = -Math.PI / 2;
    meshCara1.position.set(0, tableH + 0.005, caraDepth / 2 + 0.08);
    tableGroup.add(meshCara1);

    // B) Tablero Cara 2 (Trasero Z-)
    const matCara2 = new THREE.MeshBasicMaterial({ map: texCara2 });
    const geoCara2 = new THREE.PlaneGeometry(tableW - 0.08, caraDepth);
    const meshCara2 = new THREE.Mesh(geoCara2, matCara2);
    meshCara2.rotation.x = -Math.PI / 2;
    meshCara2.rotation.z = Math.PI; // Invertir 180° para que quede bien orientada al rotar
    meshCara2.position.set(0, tableH + 0.005, -caraDepth / 2 - 0.08);
    tableGroup.add(meshCara2);

    // C) Estructura Base del Tablero (Madera / Titanio blanco retail)
    const baseTableGeo = new THREE.BoxGeometry(tableW, 0.08, tableD);
    const baseTableMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.3,
      metalness: 0.1
    });
    const baseTableMesh = new THREE.Mesh(baseTableGeo, baseTableMat);
    baseTableMesh.position.y = tableH - 0.04;
    baseTableMesh.castShadow = true;
    baseTableMesh.receiveShadow = true;
    tableGroup.add(baseTableMesh);

    // D) Borde LED Naranja Perimetral Xiaomi
    const ledRimGeo = new THREE.BoxGeometry(tableW + 0.02, 0.015, tableD + 0.02);
    const ledRimMat = new THREE.MeshBasicMaterial({ color: 0xff6900 });
    const ledRimMesh = new THREE.Mesh(ledRimGeo, ledRimMat);
    ledRimMesh.position.y = tableH - 0.075;
    tableGroup.add(ledRimMesh);

    // E) Franja Central Top Table (Elevación de Metacrilato / Duratrans)
    const ridgeGeo = new THREE.BoxGeometry(tableW - 0.04, 0.09, 0.14);
    const ridgeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.4
    });
    const ridgeMesh = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridgeMesh.position.set(0, tableH + 0.045, 0);
    ridgeMesh.castShadow = true;
    tableGroup.add(ridgeMesh);

    // Placa gráfica central de Top Table (iluminada)
    const ttPlateGeo = new THREE.BoxGeometry(tableW - 0.2, 0.07, 0.142);
    const ttPlateMat = new THREE.MeshStandardMaterial({
      color: 0xff6900,
      emissive: 0xff4500,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const ttPlate = new THREE.Mesh(ttPlateGeo, ttPlateMat);
    ttPlate.position.set(0, tableH + 0.05, 0);
    tableGroup.add(ttPlate);

    // Logos Mi iluminados en los extremos de la franja central
    [-tableW / 2 + 0.15, tableW / 2 - 0.15].forEach((lx) => {
      const logoBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.15),
        new THREE.MeshBasicMaterial({ color: 0xff6900 })
      );
      logoBox.position.set(lx, tableH + 0.05, 0);
      tableGroup.add(logoBox);
    });

    // F) Faldones Metálicos y Patas Robustas
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.25
    });
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, tableH, 16);

    const legOffsets = [
      [-tableW / 2 + 0.2, -tableD / 2 + 0.2],
      [tableW / 2 - 0.2, -tableD / 2 + 0.2],
      [-tableW / 2 + 0.2, tableD / 2 - 0.2],
      [tableW / 2 - 0.2, tableD / 2 - 0.2]
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, tableH / 2 - 0.08, lz);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    // 5. Vectores 3D para Proyección de Hotspots
    // Mapear cada posición a su coordenada 3D real en la mesa
    const hotspotVectors: Array<{
      id: string;
      posNum: number;
      cara: string;
      device: string;
      vector: THREE.Vector3;
    }> = [];

    // Cara 1
    const c1Count = cara1Positions.length;
    cara1Positions.forEach((pos, idx) => {
      const xRatio = (idx + 0.5) / c1Count;
      const xPos = -tableW / 2 + 0.2 + xRatio * (tableW - 0.4);
      hotspotVectors.push({
        id: pos.id,
        posNum: pos.posicionNumero,
        cara: 'Cara 1',
        device: pos.modeloOficial,
        vector: new THREE.Vector3(xPos, tableH + 0.03, caraDepth / 2 + 0.08)
      });
    });

    // Cara 2 (orientada hacia Z-)
    const c2Count = cara2Positions.length;
    cara2Positions.forEach((pos, idx) => {
      const xRatio = (idx + 0.5) / c2Count;
      // En Cara 2 invertimos X para que al girar 180° se lean de izquierda a derecha
      const xPos = tableW / 2 - 0.2 - xRatio * (tableW - 0.4);
      hotspotVectors.push({
        id: pos.id,
        posNum: pos.posicionNumero,
        cara: 'Cara 2',
        device: pos.modeloOficial,
        vector: new THREE.Vector3(xPos, tableH + 0.03, -caraDepth / 2 - 0.08)
      });
    });

    // 6. Controles de Arrastre Orbital (Touch y Mouse)
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouse.current = { x: cx, y: cy };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = cx - prevMouse.current.x;
      const dy = cy - prevMouse.current.y;

      targetRotationY.current += dx * 0.008;
      targetRotationX.current = Math.max(0.15, Math.min(0.65, targetRotationX.current + dy * 0.005));

      prevMouse.current = { x: cx, y: cy };
    };

    const onPointerUp = () => {
      isDragging.current = false;
      // Actualizar automáticamente qué cara queda de frente
      const normRot = ((targetRotationY.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (normRot > Math.PI * 0.5 && normRot < Math.PI * 1.5) {
        setActiveSide('Cara 2');
      } else {
        setActiveSide('Cara 1');
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 7. Bucle de Render y Proyección de Hotspots a 2D
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Suavizado inercial de rotación
      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.12;
      currentRotationX.current += (targetRotationX.current - currentRotationX.current) * 0.12;

      tableGroup.rotation.y = currentRotationY.current;
      tableGroup.rotation.x = currentRotationX.current;

      renderer.render(scene, camera);

      // Proyectar coordenadas 3D a pantalla
      const projected = hotspotVectors.map((h) => {
        const worldVec = h.vector.clone().applyMatrix4(tableGroup.matrixWorld);
        worldVec.project(camera);

        const sx = ((worldVec.x + 1) * width) / 2;
        const sy = ((-worldVec.y + 1) * height) / 2;

        // Normal de la cara respecto al ángulo actual para saber si mira a la cámara
        const normRot = ((currentRotationY.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const isLookingAtCara2 = normRot > Math.PI * 0.5 && normRot < Math.PI * 1.5;
        const isFrontFacing = (h.cara === 'Cara 2' && isLookingAtCara2) || (h.cara === 'Cara 1' && !isLookingAtCara2);

        const st = auditStates[h.id];
        let status: 'OK' | 'Incidencia' | 'Pendiente' = 'Pendiente';
        if (st?.estadoPosicion === 'OK') status = 'OK';
        else if (st?.estadoPosicion === 'Incidencia') status = 'Incidencia';

        return {
          id: h.id,
          posNum: h.posNum,
          x: sx,
          y: sy,
          isFrontFacing,
          cara: h.cara,
          status,
          device: h.device
        };
      });

      setScreenHotspots(projected);
    };

    animate();

    const onResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight || 450;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
    };
  }, [effectiveStore, effectiveMesaName, tableTextures, cara1Positions, cara2Positions, auditStates]);

  return (
    <div className="relative w-full h-[360px] xs:h-[420px] sm:h-[480px] lg:h-[calc(100vh-140px)] rounded-none lg:rounded-2xl overflow-hidden bg-gradient-to-b from-[#0b132b] via-[#07111e] to-[#040812] select-none shadow-2xl flex flex-col justify-center items-center">
      {/* Canvas 3D Three.js */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
      />

      {/* HEADER FLOTANTE: Selector Rápido Cara 1 / Cara 2 y Top Table */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Toggle Cara 1 / Cara 2 con Giro 180° Automático */}
        <div className="bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleRotateToSide('Cara 1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeSide === 'Cara 1'
                ? 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Cara 1</span>
            <span className="text-[10px] opacity-80">({cara1Positions.length} puestos)</span>
          </button>

          <button
            type="button"
            onClick={() => handleRotateToSide('Cara 2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeSide === 'Cara 2'
                ? 'bg-gradient-to-r from-[#009ca6] to-[#00b4bf] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Cara 2</span>
            <span className="text-[10px] opacity-80">({cara2Positions.length} puestos)</span>
          </button>
        </div>

        {/* Badge Flotante de Top Table (si la mesa dispone de él) */}
        {relevantTopTable && (
          <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-teal-500/30 shadow-xl text-white flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider bg-[#ff6900] text-white px-2 py-0.5 rounded shadow-sm shrink-0">
                Top Table
              </span>
              <span className="text-xs font-bold text-teal-200 truncate hidden sm:inline">
                {relevantTopTable.campanaOficial}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onInspectTopTable && onInspectTopTable(relevantTopTable)}
              className="px-2.5 py-1 rounded-lg bg-[#009ca6] hover:bg-[#008992] text-white text-[11px] font-black transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
            >
              <span>{topTableState?.estadoVisual || 'Auditar'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* INDICADOR TÁCTIL Y AYUDA 360° */}
      <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-bold text-slate-300 flex items-center gap-1.5 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-[#00c4cc] animate-pulse"></span>
        <span>Gira 360° para ver ambas caras de la mesa</span>
      </div>

      {/* CONTROLES DE ZOOM */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 z-20 text-white text-xs shadow-lg">
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
          className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
          title="Reducir zoom"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <span className="font-mono text-[10px] px-1">{Math.round(zoomLevel * 100)}%</span>
        <button
          onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
          className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg cursor-pointer text-teal-300"
          title="Restablecer zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HOTSPOTS INTERACTIVOS PROYECTADOS EN PANTALLA */}
      {screenHotspots.map((hs) => {
        const isSelected = selectedPositionId === hs.id;
        const posObj = positions.find(p => p.id === hs.id);
        if (!posObj) return null;

        let statusColor = 'bg-[#104a60] text-white border-white ring-2 ring-[#009ca6]/60 shadow-lg';
        if (hs.status === 'OK') {
          statusColor = 'bg-emerald-500 text-white border-white ring-2 ring-emerald-500/40 shadow-emerald-500/30';
        } else if (hs.status === 'Incidencia') {
          statusColor = 'bg-rose-500 text-white border-white ring-2 ring-rose-500/40 shadow-rose-500/30 animate-pulse';
        }

        // Si la posición está en la cara oculta (atrás de la mesa), atenuarla suavemente
        const opacityClass = hs.isFrontFacing
          ? 'opacity-100 scale-100 z-20'
          : 'opacity-35 scale-80 z-10 hover:opacity-90';

        return (
          <div
            key={hs.id}
            style={{
              position: 'absolute',
              left: `${hs.x}px`,
              top: `${hs.y}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto'
            }}
            className={`transition-all duration-150 pointer-events-auto ${opacityClass}`}
          >
            <button
              type="button"
              onClick={() => onSelectPosition(posObj)}
              className={`rounded-full font-black flex items-center justify-center transition-all cursor-pointer border-2 ${statusColor} ${
                isSelected
                  ? 'w-8 h-8 sm:w-9 sm:h-9 scale-120 ring-4 ring-[#00c4cc] z-30 shadow-[#009ca6]'
                  : 'w-6 h-6 sm:w-7 sm:h-7 hover:scale-115'
              }`}
              title={`Puesto ${hs.posNum}: ${hs.device} (${hs.cara})`}
            >
              {hs.status === 'OK' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : hs.status === 'Incidencia' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="text-[10px] sm:text-[11px] font-black">{String(hs.posNum).padStart(2, '0')}</span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};
