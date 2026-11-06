import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { StoreCenter, VisualElementAuditState } from '../../types';
import { StorePosmItem, getStorePosmConfig } from '../../data/storePosmData';
import { CheckCircle2, AlertTriangle, Clock, Eye, Rotate3d, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface InteractiveColumnCanvasProps {
  store: StoreCenter;
  selectedFace: number; // 1, 2, 3, 4
  onSelectFace: (face: number) => void;
  posmStates?: Record<string, VisualElementAuditState>;
  onInspectElement?: (item: StorePosmItem) => void;
}

export const InteractiveColumnCanvas: React.FC<InteractiveColumnCanvasProps> = ({
  store,
  selectedFace,
  onSelectFace,
  posmStates = {},
  onInspectElement
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetRotationY = useRef<number>(0);
  const currentRotationY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const posmConfig = useMemo(() => getStorePosmConfig(store.tiendaId), [store.tiendaId]);
  const columnItems = useMemo(() => {
    return (posmConfig?.elementos || []).filter((e) => e.tipo === 'columna');
  }, [posmConfig]);

  // Coordenadas proyectadas de cada cara a 2D para badges flotantes
  const [faceScreenPoints, setFaceScreenPoints] = useState<
    Array<{ cara: number; x: number; y: number; visible: boolean; item?: StorePosmItem; status: string }>
  >([]);

  // Ángulos objetivo para cada cara:
  // Cara 1 (Frontal Z+): 0 rad
  // Cara 2 (Derecha X+): -Math.PI / 2
  // Cara 3 (Trasera Z-): Math.PI
  // Cara 4 (Izquierda X-): Math.PI / 2
  const faceAngles: Record<number, number> = {
    1: 0,
    2: -Math.PI / 2,
    3: Math.PI,
    4: Math.PI / 2
  };

  useEffect(() => {
    targetRotationY.current = faceAngles[selectedFace] ?? 0;
  }, [selectedFace]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 460;

    // 1. Escena y Cámara
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#071720');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.4, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
    frontLight.position.set(2, 4, 4);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0x00c4cc, 0.6);
    backLight.position.set(-3, -2, -3);
    scene.add(backLight);

    // Suelo con efecto parquet comercial oscuro
    const floorGeo = new THREE.PlaneGeometry(8, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x091c25,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    scene.add(floor);

    // 3. Grupo Columna Retail
    const columnGroup = new THREE.Group();
    scene.add(columnGroup);

    // Dimensiones proporcionales reales de la columna
    const colW = 1.35; // Ancho caras 1 y 3
    const colD = 1.15; // Profundidad caras 2 y 4
    const colH = 2.8;  // Altura total columna

    // Núcleo / Estructura metálica principal (gris oscuro titanio)
    const bodyGeo = new THREE.BoxGeometry(colW, colH, colD);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.7
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    columnGroup.add(bodyMesh);

    // Zócalo inferior metálico negro
    const baseGeo = new THREE.BoxGeometry(colW + 0.08, 0.15, colD + 0.08);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -colH / 2 + 0.075;
    columnGroup.add(baseMesh);

    // Coronación superior con cajón de logotipos Xiaomi
    const topCapGeo = new THREE.BoxGeometry(colW + 0.06, 0.35, colD + 0.06);
    const topCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });
    const topCapMesh = new THREE.Mesh(topCapGeo, topCapMat);
    topCapMesh.position.y = colH / 2 - 0.175;
    columnGroup.add(topCapMesh);

    // Logotipos retroiluminados Xiaomi naranja en las 4 caras superiores
    const logoMat = new THREE.MeshBasicMaterial({ color: 0xff6900 });
    const logoPositions = [
      { x: 0, y: colH / 2 - 0.175, z: colD / 2 + 0.04, rotY: 0 },
      { x: colW / 2 + 0.04, y: colH / 2 - 0.175, z: 0, rotY: Math.PI / 2 },
      { x: 0, y: colH / 2 - 0.175, z: -colD / 2 - 0.04, rotY: Math.PI },
      { x: -colW / 2 - 0.04, y: colH / 2 - 0.175, z: 0, rotY: -Math.PI / 2 }
    ];

    logoPositions.forEach((lp) => {
      const logoBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.03), logoMat);
      logoBox.position.set(lp.x, lp.y, lp.z);
      logoBox.rotation.y = lp.rotY;
      columnGroup.add(logoBox);
    });

    // 4. Lonas Retroiluminadas / Paneles para cada una de las 4 Caras
    // Cara 1 = Xiaomi 17 Ultra | Cara 2 = Xiaomi 17T | Cara 3 = Redmi Note 17 | Cara 4 = Pad 8
    const textureLoader = new THREE.TextureLoader();
    const texCara1 = textureLoader.load('./images/posm/cara1_xiaomi17ultra.jpg');
    const texCara2 = textureLoader.load('./images/posm/cara2_xiaomi17t.jpg');
    const texCara3 = textureLoader.load('./images/posm/cara3_redminote17.jpg');
    const texCara4 = textureLoader.load('./images/posm/cara4_xiaoipad8.jpg');

    const lonaMatCara1 = new THREE.MeshBasicMaterial({ map: texCara1 });
    const lonaMatCara2 = new THREE.MeshBasicMaterial({ map: texCara2 });
    const lonaMatCara3 = new THREE.MeshBasicMaterial({ map: texCara3 });
    const lonaMatCara4 = new THREE.MeshBasicMaterial({ map: texCara4 });

    // Caras de lona (ligeramente sobresalientes para simular perfilería perimetral)
    const lonaH = colH - 0.6;
    const lonaW_Z = colW - 0.12;
    const lonaW_X = colD - 0.12;

    // Cara 1 (Frontal Z+) → Xiaomi 17 Ultra
    const pCara1 = new THREE.Mesh(new THREE.PlaneGeometry(lonaW_Z, lonaH), lonaMatCara1);
    pCara1.position.set(0, -0.05, colD / 2 + 0.015);
    columnGroup.add(pCara1);

    // Cara 2 (Derecha X+) → Xiaomi 17T Series
    const pCara2 = new THREE.Mesh(new THREE.PlaneGeometry(lonaW_X, lonaH), lonaMatCara2);
    pCara2.rotation.y = Math.PI / 2;
    pCara2.position.set(colW / 2 + 0.015, -0.05, 0);
    columnGroup.add(pCara2);

    // Cara 3 (Trasera Z-) → Redmi Note 17 Series
    const pCara3 = new THREE.Mesh(new THREE.PlaneGeometry(lonaW_Z, lonaH), lonaMatCara3);
    pCara3.rotation.y = Math.PI;
    pCara3.position.set(0, -0.05, -colD / 2 - 0.015);
    columnGroup.add(pCara3);

    // Cara 4 (Izquierda X-) → Xiaomi Pad 8 Series
    const pCara4 = new THREE.Mesh(new THREE.PlaneGeometry(lonaW_X, lonaH), lonaMatCara4);
    pCara4.rotation.y = -Math.PI / 2;
    pCara4.position.set(-colW / 2 - 0.015, -0.05, 0);
    columnGroup.add(pCara4);

    // Vectores 3D de referencia para proyectar hotspots HTML
    const faceVectors: Array<{ cara: number; vec: THREE.Vector3 }> = [
      { cara: 1, vec: new THREE.Vector3(0, 0.2, colD / 2 + 0.05) },
      { cara: 2, vec: new THREE.Vector3(colW / 2 + 0.05, 0.2, 0) },
      { cara: 3, vec: new THREE.Vector3(0, 0.2, -colD / 2 - 0.05) },
      { cara: 4, vec: new THREE.Vector3(-colW / 2 - 0.05, 0.2, 0) }
    ];

    // 5. Interacción de Arrastre Orbital (Touch y Mouse)
    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition.current = { x: clientX, y: clientY };
    };

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - previousMousePosition.current.x;

      targetRotationY.current += deltaX * 0.008;
      previousMousePosition.current = { x: clientX, y: clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    container.addEventListener('touchstart', onMouseDown, { passive: true });
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // 6. Loop de Animación y Proyección 2D
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Suavizado lerp hacia la rotación objetivo
      currentRotationY.current += (targetRotationY.current - currentRotationY.current) * 0.08;
      columnGroup.rotation.y = currentRotationY.current;

      // Calcular coordenadas 2D de las caras
      const points = faceVectors.map((fv) => {
        const worldVec = fv.vec.clone();
        worldVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationY.current);

        // Vector normal de la cara para comprobar si está visible hacia la cámara
        const normal = new THREE.Vector3(
          fv.cara === 2 ? 1 : fv.cara === 4 ? -1 : 0,
          0,
          fv.cara === 1 ? 1 : fv.cara === 3 ? -1 : 0
        );
        normal.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationY.current);

        const isFacingCamera = normal.z > 0.05;

        // Proyectar a coordenadas de pantalla (0 a width / height)
        const screenVec = worldVec.clone().project(camera);
        const sx = ((screenVec.x + 1) * width) / 2;
        const sy = ((-screenVec.y + 1) * height) / 2;

        const item = columnItems.find((it) => it.caraNumero === fv.cara);
        const state = item ? posmStates[item.id] : undefined;
        const status = state?.estadoVisual || (item ? 'Pendiente' : 'Inactiva');

        return {
          cara: fv.cara,
          x: sx,
          y: sy,
          visible: isFacingCamera,
          item,
          status
        };
      });

      setFaceScreenPoints(points);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onMouseDown);
      window.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [columnItems, posmStates]);

  return (
    <div className="relative w-full h-[440px] sm:h-[500px] bg-gradient-to-b from-[#061e28] via-[#072431] to-[#041219] rounded-2xl overflow-hidden shadow-2xl border border-teal-500/20 select-none">
      {/* Contenedor Three.js */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Selector de Caras Rápido Superior */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <Rotate3d className="w-4 h-4 text-[#00c4cc]" />
          <span className="text-[11px] font-black text-white uppercase tracking-wider">
            Columna 3D · 360°
          </span>
        </div>

        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/15 pointer-events-auto">
          {[1, 2, 3, 4].map((faceNum) => {
            const isSelected = selectedFace === faceNum;
            const item = columnItems.find((it) => it.caraNumero === faceNum);
            const state = item ? posmStates[item.id] : undefined;
            const isOk = state?.estadoVisual === 'OK';
            const isInc = state?.estadoVisual === 'Incidencia';

            return (
              <button
                key={faceNum}
                onClick={() => onSelectFace(faceNum)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#009ca6] text-white shadow-sm ring-2 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Cara {faceNum}</span>
                {isOk ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ) : isInc ? (
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges y Hotspots flotantes sobre la columna */}
      {faceScreenPoints.map((pt) => {
        if (!pt.visible) return null;
        const isSelected = selectedFace === pt.cara;
        const isOk = pt.status === 'OK';
        const isInc = pt.status === 'Incidencia';

        return (
          <div
            key={pt.cara}
            style={{
              left: `${pt.x}px`,
              top: `${pt.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            className="absolute z-20 pointer-events-auto transition-transform hover:scale-105"
          >
            <div
              onClick={() => {
                onSelectFace(pt.cara);
                if (pt.item && onInspectElement) {
                  onInspectElement(pt.item);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer shadow-xl backdrop-blur-md border transition-all ${
                isSelected
                  ? 'bg-[#104a60]/95 border-[#00c4cc] ring-2 ring-[#00c4cc]/50 text-white'
                  : 'bg-black/80 border-white/20 text-slate-200 hover:border-[#00c4cc]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-xs ${
                  isOk
                    ? 'bg-emerald-500 text-white'
                    : isInc
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {pt.cara}
              </div>

              <div className="text-left leading-tight">
                <span className="block text-[10px] font-black uppercase text-teal-300 truncate max-w-[140px]">
                  {pt.item ? pt.item.campanaOficial : `Cara ${pt.cara}`}
                </span>
                <span className="block text-[9px] text-slate-300 font-bold">
                  {pt.item?.medida || 'Sin medida'}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicador de ayuda inferior */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 pointer-events-none">
        <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
          Arrastra con el dedo o ratón para rotar en 360°
        </span>
        <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-teal-300 font-bold">
          Pulsa en cualquier cara para auditarla
        </span>
      </div>
    </div>
  );
};

