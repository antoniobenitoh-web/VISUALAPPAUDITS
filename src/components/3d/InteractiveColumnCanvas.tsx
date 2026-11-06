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
    // Fondo de tienda comercial sutilmente iluminado
    scene.background = new THREE.Color('#0a1b24');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 4.3);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Iluminación realista de tienda departamental
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.15);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.35);
    mainLight.position.set(2.5, 5.0, 3.5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-3.0, 3.0, -3.0);
    scene.add(fillLight);

    const glowLight = new THREE.PointLight(0xff8833, 0.6, 6);
    glowLight.position.set(0, 1.6, 0);
    scene.add(glowLight);

    // Suelo de tienda comercial con baldosas cerámicas claras
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x223540,
      roughness: 0.6,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.65;
    scene.add(floor);

    // 3. Grupo Columna Retail
    const columnGroup = new THREE.Group();
    scene.add(columnGroup);

    // Dimensiones proporcionales reales de la columna oficial Xiaomi
    const colW = 1.35; // Ancho caras 1 y 3 (Frontal y Trasera)
    const colD = 1.15; // Profundidad caras 2 y 4 (Laterales)
    const colH = 2.85; // Altura total de la columna

    // Material de estructura metálica champagne / titanio cálido oficial
    const structureMat = new THREE.MeshStandardMaterial({
      color: 0x9b958a, // Tono titanio champán anodizado de las fotos
      roughness: 0.42,
      metalness: 0.38
    });

    // Material de zócalos y perfilerías de encastre oscuros
    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x1f2329,
      roughness: 0.5,
      metalness: 0.55
    });

    // Núcleo central de la columna
    const bodyGeo = new THREE.BoxGeometry(colW, colH, colD);
    const bodyMesh = new THREE.Mesh(bodyGeo, structureMat);
    columnGroup.add(bodyMesh);

    // Zócalo inferior metálico
    const baseGeo = new THREE.BoxGeometry(colW + 0.06, 0.14, colD + 0.06);
    const baseMesh = new THREE.Mesh(baseGeo, darkTrimMat);
    baseMesh.position.y = -colH / 2 + 0.07;
    columnGroup.add(baseMesh);

    // Coronación superior biselada
    const topCapGeo = new THREE.BoxGeometry(colW + 0.06, 0.42, colD + 0.06);
    const topCapMesh = new THREE.Mesh(topCapGeo, structureMat);
    topCapMesh.position.y = colH / 2 - 0.21;
    columnGroup.add(topCapMesh);

    // 4 Pilastras angulares / chaflanes biselados en las 4 esquinas (perfilería oficial)
    const cornerW = 0.12;
    const cornerH = colH - 0.14;
    const cornerGeo = new THREE.BoxGeometry(cornerW, cornerH, cornerW);
    const cornerPositions = [
      { x: colW / 2, z: colD / 2 },
      { x: -colW / 2, z: colD / 2 },
      { x: colW / 2, z: -colD / 2 },
      { x: -colW / 2, z: -colD / 2 }
    ];
    cornerPositions.forEach((cp) => {
      const cornerMesh = new THREE.Mesh(cornerGeo, structureMat);
      cornerMesh.position.set(cp.x, 0, cp.z);
      cornerMesh.rotation.y = Math.PI / 4;
      columnGroup.add(cornerMesh);
    });

    // Emblemas oficiales Xiaomi retroiluminados en la parte superior de cada cara
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('./images/xiaomi_logo.png');
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    const logoMat = new THREE.MeshStandardMaterial({
      map: logoTexture,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xff6900,
      emissiveIntensity: 0.5
    });

    const logoPositions = [
      { x: 0, y: colH / 2 - 0.21, z: colD / 2 + 0.035, rotY: 0 },
      { x: colW / 2 + 0.035, y: colH / 2 - 0.21, z: 0, rotY: Math.PI / 2 },
      { x: 0, y: colH / 2 - 0.21, z: -colD / 2 - 0.035, rotY: Math.PI },
      { x: -colW / 2 - 0.035, y: colH / 2 - 0.21, z: 0, rotY: -Math.PI / 2 }
    ];

    logoPositions.forEach((lp) => {
      // Caja de logotipo redondeado naranja con relieve
      const logoBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.035), logoMat);
      logoBox.position.set(lp.x, lp.y, lp.z);
      logoBox.rotation.y = lp.rotY;
      columnGroup.add(logoBox);
    });

    // 4. Lonas Retroiluminadas y Mueble de Tablets
    const texCara1 = textureLoader.load('./images/posm/cara1_xiaomi17ultra.jpg');
    const texCara2 = textureLoader.load('./images/posm/cara2_xiaomi17t.jpg');
    const texCara3 = textureLoader.load('./images/posm/cara3_redminote17.jpg');
    const texCara4 = textureLoader.load('./images/posm/cara4_xiaoipad8.jpg');

    // Material de caja de luz textil retroiluminada (con suave resplandor blanco interno)
    const createLonaMaterial = (tex: THREE.Texture) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.22,
        metalness: 0.05,
        emissive: 0xffffff,
        emissiveIntensity: 0.18
      });
    };

    const lonaMatCara1 = createLonaMaterial(texCara1);
    const lonaMatCara2 = createLonaMaterial(texCara2);
    const lonaMatCara3 = createLonaMaterial(texCara3);
    const lonaMatCara4 = createLonaMaterial(texCara4);

    // Dimensiones de lonas verticales completas (Caras 1, 2 y 3)
    const lonaFullH = colH - 0.72; // ~2.13m de altura
    const lonaW_Z = colW - 0.16;   // ~1.19m de ancho para caras 1 y 3
    const lonaW_X = colD - 0.16;   // ~0.99m de ancho para caras 2 y 4

    // Marco biselado perimetral para cada lona (simulación de perfil de caja de luz)
    const createLonaWithFrame = (
      width: number,
      height: number,
      mat: THREE.Material,
      posX: number,
      posY: number,
      posZ: number,
      rotY: number
    ) => {
      const group = new THREE.Group();
      // Fondo marco
      const frameGeo = new THREE.BoxGeometry(width + 0.04, height + 0.04, 0.02);
      const frameMesh = new THREE.Mesh(frameGeo, darkTrimMat);
      group.add(frameMesh);

      // Lona
      const lonaMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
      lonaMesh.position.z = 0.012;
      group.add(lonaMesh);

      group.position.set(posX, posY, posZ);
      group.rotation.y = rotY;
      columnGroup.add(group);
      return group;
    };

    // CARA 1 (Frontal Z+) → Xiaomi 17 Ultra (Lona vertical completa)
    createLonaWithFrame(lonaW_Z, lonaFullH, lonaMatCara1, 0, -0.12, colD / 2 + 0.01, 0);

    // CARA 2 (Derecha X+) → Xiaomi 17T Series (Lona vertical completa)
    createLonaWithFrame(lonaW_X, lonaFullH, lonaMatCara2, colW / 2 + 0.01, -0.12, 0, Math.PI / 2);

    // CARA 3 (Trasera Z-) → Redmi Note 17 Series MAX POWER (Lona vertical completa)
    createLonaWithFrame(lonaW_Z, lonaFullH, lonaMatCara3, 0, -0.12, -colD / 2 - 0.01, Math.PI);

    // CARA 4 (Izquierda X-) → ESTRUCTURA AUTÉNTICA DE LA TIENDA (FOTO 4):
    // 1) Lona superior cuadrada: Xiaomi Pad 8 Series ("Powerfully productive")
    const lonaPadH = 1.05; // Formato proporcionado a la lona real cuadrada
    createLonaWithFrame(
      lonaW_X,
      lonaPadH,
      lonaMatCara4,
      -colW / 2 - 0.01,
      0.46, // Posicionada en la parte superior
      0,
      -Math.PI / 2
    );

    // 2) Mueble expositor / Mostrador inferior de tablets (como se ve en la foto real)
    const counterW = colD - 0.08;
    const counterH = 0.94;
    const counterD = 0.48;

    const counterGroup = new THREE.Group();
    // Cuerpo del mueble inferior (color titanio grafito)
    const counterBodyGeo = new THREE.BoxGeometry(counterW, counterH, counterD);
    const counterBodyMesh = new THREE.Mesh(counterBodyGeo, darkTrimMat);
    counterBodyMesh.position.y = -colH / 2 + counterH / 2 + 0.07;
    counterGroup.add(counterBodyMesh);

    // Tapa de mostrador blanca con repisa
    const tableTopGeo = new THREE.BoxGeometry(counterW + 0.04, 0.04, counterD + 0.04);
    const tableTopMat = new THREE.MeshStandardMaterial({
      color: 0xefede8,
      roughness: 0.35,
      metalness: 0.1
    });
    const tableTopMesh = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTopMesh.position.y = -colH / 2 + counterH + 0.07;
    counterGroup.add(tableTopMesh);

    // Rótulo 3D frontal "xiaomi" en el frontal del mostrador
    const logoStripGeo = new THREE.BoxGeometry(0.5, 0.08, 0.02);
    const logoStripMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      emissive: 0xffffff,
      emissiveIntensity: 0.25
    });
    const logoStrip = new THREE.Mesh(logoStripGeo, logoStripMat);
    logoStrip.position.set(0, -colH / 2 + counterH * 0.72, counterD / 2 + 0.012);
    counterGroup.add(logoStrip);

    // Tablet Xiaomi Pad 8 con teclado folio abierta sobre la repisa
    const tabletScreenGeo = new THREE.BoxGeometry(0.32, 0.22, 0.01);
    const tabletScreenMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8
    });
    const tabletScreen = new THREE.Mesh(tabletScreenGeo, tabletScreenMat);
    tabletScreen.position.set(0, -colH / 2 + counterH + 0.18, 0.05);
    tabletScreen.rotation.x = -0.3;
    counterGroup.add(tabletScreen);

    // Teclado plano sobre la mesa
    const keyboardGeo = new THREE.BoxGeometry(0.32, 0.01, 0.2);
    const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
    keyboard.position.set(0, -colH / 2 + counterH + 0.09, -0.06);
    counterGroup.add(keyboard);

    counterGroup.position.set(-colW / 2 - counterD / 2 + 0.02, 0, 0);
    counterGroup.rotation.y = -Math.PI / 2;
    columnGroup.add(counterGroup);

    // 5) Plataforma del Patinete Xiaomi en el lateral (Fotos 1, 2 y 3)
    const scooterPodiumGroup = new THREE.Group();
    const podiumW = 0.42;
    const podiumL = 1.15;
    const podiumH = 0.09;

    // Peana blanca de exposición
    const podiumMesh = new THREE.Mesh(
      new THREE.BoxGeometry(podiumW, podiumH, podiumL),
      new THREE.MeshStandardMaterial({ color: 0xe8e6e1, roughness: 0.4 })
    );
    podiumMesh.position.y = -colH / 2 + podiumH / 2 + 0.01;
    scooterPodiumGroup.add(podiumMesh);

    // Silueta estilizada del patinete Xiaomi Electric Scooter
    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.04, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    deckMesh.position.set(0, -colH / 2 + podiumH + 0.04, 0);
    scooterPodiumGroup.add(deckMesh);

    // Mástil y manillar
    const stemMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 })
    );
    stemMesh.position.set(0, -colH / 2 + podiumH + 0.52, 0.38);
    stemMesh.rotation.x = 0.12;
    scooterPodiumGroup.add(stemMesh);

    const handleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 })
    );
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.position.set(0, -colH / 2 + podiumH + 0.98, 0.44);
    scooterPodiumGroup.add(handleMesh);

    // Posicionar la peana al lado derecho de la columna
    scooterPodiumGroup.position.set(colW / 2 + podiumW / 2 + 0.08, 0, 0.1);
    columnGroup.add(scooterPodiumGroup);

    // Vectores 3D de referencia para proyectar hotspots HTML interactivos
    const faceVectors: Array<{ cara: number; vec: THREE.Vector3 }> = [
      { cara: 1, vec: new THREE.Vector3(0, 0.15, colD / 2 + 0.06) },
      { cara: 2, vec: new THREE.Vector3(colW / 2 + 0.06, 0.15, 0) },
      { cara: 3, vec: new THREE.Vector3(0, 0.15, -colD / 2 - 0.06) },
      { cara: 4, vec: new THREE.Vector3(-colW / 2 - 0.06, 0.46, 0) }
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

