import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlanogramPosition, PositionAuditState } from '../../types';

interface InteractiveTableCanvasProps {
  positions: PlanogramPosition[];
  auditStates: Record<string, PositionAuditState>;
  selectedPositionId: string | null;
  onSelectPosition: (position: PlanogramPosition) => void;
  spaceName: string;
}

export const InteractiveTableCanvas: React.FC<InteractiveTableCanvasProps> = ({
  positions,
  auditStates,
  selectedPositionId,
  onSelectPosition,
  spaceName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [screenCoords, setScreenCoords] = useState<Array<{ id: string; x: number; y: number; num: number; status: string }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 360;

    // Escena, Cámara y Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b132b');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 3.8);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.2);
    spotLight.position.set(0, 5, 2);
    spotLight.castShadow = true;
    scene.add(spotLight);

    const floorLight = new THREE.DirectionalLight(0x0284c7, 0.3);
    floorLight.position.set(0, -2, 2);
    scene.add(floorLight);

    // Suelo de tienda
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Mesa de Experiencia Retail o Wall según el espacio
    const isWall = spaceName.includes('WALL');
    const tableGroup = new THREE.Group();

    if (!isWall) {
      // Tablero de madera clara / acabado blanco retail
      const topGeo = new THREE.BoxGeometry(4.2, 0.12, 1.4);
      const topMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.3,
        metalness: 0.1
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 0.7;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      tableGroup.add(topMesh);

      // Borde frontal LED iluminado naranja Xiaomi
      const ledGeo = new THREE.BoxGeometry(4.22, 0.03, 1.42);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0xff6900 });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.y = 0.65;
      tableGroup.add(ledMesh);

      // Patas metálicas minimalistas
      const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2);

      const legPositions = [
        [-1.8, 0.1, -0.5],
        [1.8, 0.1, -0.5],
        [-1.8, 0.1, 0.5],
        [1.8, 0.1, 0.5]
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        tableGroup.add(leg);
      });
    } else {
      // Panel Wall Expositor Vertical
      const wallGeo = new THREE.BoxGeometry(4.5, 2.4, 0.15);
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.set(0, 1.5, -0.9);
      tableGroup.add(wallMesh);

      // Balda expositora
      const shelfGeo = new THREE.BoxGeometry(4.2, 0.08, 0.4);
      const shelfMat = new THREE.MeshStandardMaterial({ color: 0xff6900 });
      const shelf = new THREE.Mesh(shelfGeo, shelfMat);
      shelf.position.set(0, 1.1, -0.7);
      tableGroup.add(shelf);
    }

    // Modelos 3D representativos de los Smartphones/Wearables sobre la mesa
    const hotspotVectors: Array<{ id: string; num: number; vector: THREE.Vector3; status: string }> = [];

    positions.forEach((pos) => {
      const px = pos.x ?? 0;
      const py = pos.y ?? (isWall ? 1.2 : 0.76);
      const pz = pos.z ?? (isWall ? -0.65 : 0);

      // Peana / Stand acrílico
      const standGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.04, 16);
      const standMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.85
      });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(px, py, pz);
      tableGroup.add(stand);

      // Smartphone / Dispositivo estilizado
      const isTablet = pos.categoria === 'Tablet';
      const isWatch = pos.categoria === 'Wearable';
      const phoneGeo = isTablet
        ? new THREE.BoxGeometry(0.35, 0.02, 0.48)
        : isWatch
        ? new THREE.CylinderGeometry(0.1, 0.1, 0.04, 16)
        : new THREE.BoxGeometry(0.2, 0.02, 0.38);

      const auditState = auditStates[pos.id];
      const statusColor = auditState?.estadoPosicion === 'OK'
        ? 0x10b981 // Verde
        : auditState?.estadoPosicion === 'Incidencia'
        ? 0xef4444 // Rojo
        : 0xf59e0b; // Ámbar/Naranja

      const phoneMat = new THREE.MeshStandardMaterial({
        color: statusColor,
        roughness: 0.2,
        metalness: 0.8
      });

      const phoneMesh = new THREE.Mesh(phoneGeo, phoneMat);
      phoneMesh.position.set(px, py + 0.04, pz);
      phoneMesh.rotation.x = isWall ? 0 : 0.25; // Inclinación de exposición ergonómica
      tableGroup.add(phoneMesh);

      // Guardar vector 3D para proyectar hotspot HTML interactivo
      hotspotVectors.push({
        id: pos.id,
        num: pos.posicionNumero,
        vector: new THREE.Vector3(px, py + 0.2, pz),
        status: auditState?.estadoPosicion || 'Pendiente'
      });
    });

    scene.add(tableGroup);

    // Controles táctiles orbitales nativos
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      targetRotationY += deltaX * 0.008;
      targetRotationX = Math.max(-0.4, Math.min(0.5, targetRotationX + deltaY * 0.005));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onPointerDown);
    domElement.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElement.addEventListener('touchstart', onPointerDown, { passive: true });
    domElement.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Bucle de render y proyección de coordenadas a pantalla
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Suavizado de rotación
      tableGroup.rotation.y += (targetRotationY - tableGroup.rotation.y) * 0.1;
      tableGroup.rotation.x += (targetRotationX - tableGroup.rotation.x) * 0.1;

      renderer.render(scene, camera);

      // Proyección de hotspots a 2D
      const coords = hotspotVectors.map((h) => {
        const v = h.vector.clone().applyMatrix4(tableGroup.matrixWorld);
        v.project(camera);
        const sx = ((v.x + 1) * width) / 2;
        const sy = ((-v.y + 1) * height) / 2;
        return {
          id: h.id,
          num: h.num,
          x: sx,
          y: sy,
          status: h.status
        };
      });

      setScreenCoords(coords);
    };

    animate();

    // Redimensionamiento
    const onResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight || 360;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      domElement.removeEventListener('mousedown', onPointerDown);
      domElement.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onPointerDown);
      domElement.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
    };
  }, [positions, auditStates, spaceName]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl select-none">
      {/* Canvas 3D */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Indicador de ayuda táctil */}
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 pointer-events-none shadow-lg">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
        <span>Arrastra para girar mesa 3D</span>
      </div>

      {/* Hotspots interactivos HTML proyectados con coordenadas del modelo 3D */}
      {screenCoords.map((hs) => {
        const posObj = positions.find((p) => p.id === hs.id);
        if (!posObj) return null;
        const isSelected = selectedPositionId === hs.id;

        const colorClasses =
          hs.status === 'OK'
            ? 'bg-emerald-500 text-white border-emerald-300 ring-emerald-500/30'
            : hs.status === 'Incidencia'
            ? 'bg-rose-600 text-white border-rose-300 ring-rose-500/40 animate-pulse'
            : 'bg-amber-500 text-white border-amber-300 ring-amber-500/30';

        return (
          <button
            key={hs.id}
            onClick={() => onSelectPosition(posObj)}
            style={{
              position: 'absolute',
              left: `${hs.x}px`,
              top: `${hs.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full font-black text-xs border-2 shadow-xl flex items-center justify-center transition-all cursor-pointer ring-4 ${colorClasses} ${
              isSelected ? 'scale-125 ring-8 ring-sky-400 border-white z-20' : 'hover:scale-110 z-10'
            }`}
          >
            {String(hs.num).padStart(2, '0')}
          </button>
        );
      })}
    </div>
  );
};
