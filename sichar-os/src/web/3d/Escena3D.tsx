// Ambientes 3D en tiempo real (WebGL) con los productos de SICHAR.
// El piso brillante refleja la escena: así se ve un porcelanato 60x130 de verdad.
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls, PerformanceMonitor, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Producto } from '../../data/types'
import { esBrillante, texturaSuperficie } from './texturas'

export type TipoAmbiente = 'bano' | 'cocina' | 'sala'
export type Griferia = 'negro' | 'cromo' | 'dorado'
export type Luz = 'dia' | 'calida' | 'noche'

export interface PropsEscena {
  ambiente: TipoAmbiente
  piso: Producto
  pared: Producto
  acento: Producto
  griferia: Griferia
  luz: Luz
  /** Cámara automática (hero) o controlable con el mouse. */
  modo?: 'interactivo' | 'cine'
  className?: string
  /** Si es falso, la escena deja de dibujarse (por ejemplo, cuando no está en pantalla). */
  activo?: boolean
}

/** Calidad gráfica: "baja" quita el reflejo en tiempo real y las sombras dinámicas. */
export type Calidad = 'alta' | 'baja'

function calidadInicial(): Calidad {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const pocosNucleos = (nav.hardwareConcurrency ?? 8) <= 4
  const pocaMemoria = (nav.deviceMemory ?? 8) <= 4
  const movil = /Android|iPhone|iPad/i.test(nav.userAgent)
  return pocosNucleos || pocaMemoria || movil ? 'baja' : 'alta'
}

const W = 5.2 // ancho
const D = 4.6 // fondo
const H = 2.8 // alto

const METAL: Record<Griferia, { color: string; metalness: number; roughness: number }> = {
  negro: { color: '#151515', metalness: 0.5, roughness: 0.38 },
  cromo: { color: '#e9ebee', metalness: 1, roughness: 0.06 },
  dorado: { color: '#d4ad62', metalness: 1, roughness: 0.22 },
}

function Metal({ g }: { g: Griferia }) {
  return <meshStandardMaterial {...METAL[g]} envMapIntensity={1.4} />
}

// --- Superficies ------------------------------------------------------------

function Piso({ p, calidad }: { p: Producto; calidad: Calidad }) {
  const tex = useMemo(() => texturaSuperficie(p, W, D), [p])
  const brillo = esBrillante(p)
  if (calidad === 'baja')
    return (
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial map={tex} roughness={brillo ? 0.08 : 0.7} clearcoat={brillo ? 1 : 0} clearcoatRoughness={0.04} envMapIntensity={brillo ? 1.4 : 0.6} />
      </mesh>
    )
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[W, D]} />
      <MeshReflectorMaterial
        map={tex}
        blur={brillo ? [120, 40] : [400, 200]}
        resolution={512}
        mixBlur={brillo ? 0.6 : 1}
        mixStrength={brillo ? 3.2 : 0.6}
        mirror={brillo ? 0.75 : 0.15}
        roughness={brillo ? 0.12 : 0.75}
        metalness={0.05}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
      />
    </mesh>
  )
}

function Pared({ p, ancho, alto, brilloExtra = 0, ...props }: { p: Producto; ancho: number; alto: number; brilloExtra?: number } & ThreeElements['mesh']) {
  const tex = useMemo(() => texturaSuperficie(p, ancho, alto), [p, ancho, alto])
  const brillo = esBrillante(p)
  return (
    <mesh receiveShadow {...props}>
      <planeGeometry args={[ancho, alto]} />
      <meshPhysicalMaterial map={tex} roughness={brillo ? 0.18 : 0.8} clearcoat={brillo ? 0.6 + brilloExtra : 0} clearcoatRoughness={0.15} envMapIntensity={0.8} />
    </mesh>
  )
}

function Cuarto({ piso, pared, acento, children, acentoFondo, calidad }: { piso: Producto; pared: Producto; acento: Producto; children?: ReactNode; acentoFondo: [number, number, number, number]; calidad: Calidad }) {
  // acentoFondo: [x, y, ancho, alto] de la franja de acento en la pared del fondo
  const [ax, ay, aw, ah] = acentoFondo
  return (
    <group>
      <Piso p={piso} calidad={calidad} />
      <Pared p={pared} ancho={W} alto={H} position={[0, H / 2, -D / 2]} />
      <Pared p={acento} ancho={aw} alto={ah} position={[ax, ay, -D / 2 + 0.004]} />
      <Pared p={pared} ancho={D} alto={H} position={[-W / 2, H / 2, 0]} rotation-y={Math.PI / 2} />
      {/* zócalo de luz LED en el techo de la pared del fondo */}
      <mesh position={[0, H - 0.02, -D / 2 + 0.06]}>
        <boxGeometry args={[W, 0.03, 0.06]} />
        <meshStandardMaterial color="#fff2d6" emissive="#ffd9a0" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      {/* techo con luces empotradas */}
      <mesh position={[0, H, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#f3f0ea" roughness={0.9} />
      </mesh>
      {[-1.2, 0.35, 1.6].map((x) => (
        <mesh key={x} position={[x, H - 0.005, -0.6]} rotation-x={Math.PI / 2}>
          <circleGeometry args={[0.06, 32]} />
          <meshStandardMaterial color="#fff" emissive="#fff3dc" emissiveIntensity={3} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {children}
    </group>
  )
}

// --- Objetos ---------------------------------------------------------------

function Ceramica(props: ThreeElements['meshPhysicalMaterial']) {
  return <meshPhysicalMaterial color="#fbfbf9" roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} {...props} />
}

function Madera({ color = '#6e4a30' }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.55} />
}

function Lavamanos({ g, x = 0, y = 0.86, z = -D / 2 + 0.3 }: { g: Griferia; x?: number; y?: number; z?: number }) {
  const perfil = useMemo(() => {
    const pts: THREE.Vector2[] = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      pts.push(new THREE.Vector2(0.06 + Math.sin(t * Math.PI * 0.5) * 0.17, t * 0.14))
    }
    return pts
  }, [])
  return (
    <group position={[x, y, z]}>
      <mesh castShadow>
        <latheGeometry args={[perfil, 48]} />
        <Ceramica side={THREE.DoubleSide} />
      </mesh>
      {/* grifería de pared */}
      <group position={[0, 0.3, -0.17]}>
        <mesh castShadow rotation-x={Math.PI / 2} position={[0, 0, 0.09]}>
          <cylinderGeometry args={[0.014, 0.014, 0.2, 24]} />
          <Metal g={g} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 32]} />
          <Metal g={g} />
        </mesh>
        <mesh position={[0, 0.07, 0.015]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 16]} />
          <Metal g={g} />
        </mesh>
      </group>
    </group>
  )
}

function Espejo({ g, x = 0, y = 1.62, r = 0.45 }: { g: Griferia; x?: number; y?: number; r?: number }) {
  return (
    <group position={[x, y, -D / 2 + 0.03]}>
      <mesh>
        <circleGeometry args={[r, 64]} />
        <meshStandardMaterial color="#e8eef0" metalness={0.92} roughness={0.04} envMapIntensity={2.6} />
      </mesh>
      <mesh>
        <torusGeometry args={[r, 0.018, 16, 96]} />
        <Metal g={g} />
      </mesh>
    </group>
  )
}

function Aplique({ g, pos, luz }: { g: Griferia; pos: [number, number, number]; luz: Luz }) {
  return (
    <group position={pos}>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 12]} />
        <Metal g={g} />
      </mesh>
      <mesh position={[0, -0.2, 0.06]}>
        <sphereGeometry args={[0.07, 32, 16]} />
        <meshStandardMaterial color="#fff6e0" emissive="#ffcf8a" emissiveIntensity={luz === 'dia' ? 1.2 : 3.5} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.2, 0.2]} intensity={luz === 'dia' ? 0.6 : 2.4} distance={3.2} color="#ffcf8a" />
    </group>
  )
}

function Planta({ pos, escala = 1 }: { pos: [number, number, number]; escala?: number }) {
  const hojas = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, h: 0.35 + (i % 4) * 0.12, inc: 0.5 + (i % 3) * 0.2 })), [])
  return (
    <group position={pos} scale={escala}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.36, 32]} />
        <meshStandardMaterial color="#e9e3d9" roughness={0.9} />
      </mesh>
      {hojas.map((h, i) => (
        <group key={i} position={[0, 0.34, 0]} rotation={[0, h.a, 0]}>
          <mesh castShadow position={[0, h.h * 0.55, h.h * 0.35]} rotation-x={0.35 + h.inc * 0.6} scale={[0.09, 0.012, h.h * 0.5]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshStandardMaterial color={i % 2 ? '#2f5d34' : '#467a45'} roughness={0.55} />
          </mesh>
          <mesh position={[0, h.h * 0.25, h.h * 0.15]} rotation-x={0.6}>
            <cylinderGeometry args={[0.006, 0.006, h.h * 0.6, 6]} />
            <meshStandardMaterial color="#5f7a3c" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bano({ g, luz }: { g: Griferia; luz: Luz }) {
  return (
    <group>
      {/* mueble flotante */}
      <RoundedBox args={[1.5, 0.42, 0.5]} radius={0.02} position={[0.35, 0.62, -D / 2 + 0.26]} castShadow>
        <Madera />
      </RoundedBox>
      <mesh position={[0.35, 0.845, -D / 2 + 0.27]} castShadow>
        <boxGeometry args={[1.56, 0.03, 0.54]} />
        <meshPhysicalMaterial color="#f2efe9" roughness={0.2} clearcoat={0.8} />
      </mesh>
      <Lavamanos g={g} x={0.35} />
      <Espejo g={g} x={0.35} />
      <Aplique g={g} pos={[-0.35, 1.78, -D / 2 + 0.08]} luz={luz} />
      <Aplique g={g} pos={[1.05, 1.78, -D / 2 + 0.08]} luz={luz} />
      {/* ducha: vidrio + regadera */}
      <mesh position={[-1.25, 1.05, -D / 2 + 0.75]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[1.5, 2.1, 0.012]} />
        <meshPhysicalMaterial transmission={1} roughness={0.04} thickness={0.02} ior={1.5} color="#eaf4f4" transparent opacity={0.35} />
      </mesh>
      {[2.12, 0.0].map((y) => (
        <mesh key={y} position={[-1.25, y + 0.01, -D / 2 + 0.75]}>
          <boxGeometry args={[0.025, 0.025, 1.5]} />
          <Metal g={g} />
        </mesh>
      ))}
      <mesh position={[-1.25, 1.06, -D / 2 + 1.5]}>
        <boxGeometry args={[0.025, 2.12, 0.025]} />
        <Metal g={g} />
      </mesh>
      <group position={[-W / 2 + 0.45, 2.22, -D / 2 + 0.75]}>
        <mesh position={[-0.22, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, 0.45, 12]} />
          <Metal g={g} />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[0.3, 0.015, 0.3]} />
          <Metal g={g} />
        </mesh>
      </group>
      {/* toallas */}
      <RoundedBox args={[0.5, 0.1, 0.32]} radius={0.04} position={[1.4, 0.13, -D / 2 + 0.3]} castShadow>
        <meshStandardMaterial color="#e8dccb" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.09, 0.3]} radius={0.04} position={[1.4, 0.23, -D / 2 + 0.3]} castShadow>
        <meshStandardMaterial color="#cbb8a0" roughness={1} />
      </RoundedBox>
      <Planta pos={[1.7, 0, -0.9]} escala={1.2} />
    </group>
  )
}

function Cocina({ g, luz }: { g: Griferia; luz: Luz }) {
  return (
    <group>
      {/* muebles bajos */}
      <mesh position={[0.2, 0.44, -D / 2 + 0.31]} castShadow>
        <boxGeometry args={[4, 0.88, 0.6]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.9, -D / 2 + 0.32]} castShadow>
        <boxGeometry args={[4.08, 0.04, 0.64]} />
        <meshPhysicalMaterial color="#f1eee8" roughness={0.15} clearcoat={0.9} />
      </mesh>
      {/* muebles altos */}
      <mesh position={[-0.8, 2.15, -D / 2 + 0.18]} castShadow>
        <boxGeometry args={[2, 0.7, 0.35]} />
        <Madera color="#8a6a4c" />
      </mesh>
      {/* estufa y lavaplatos */}
      <mesh position={[1.2, 0.925, -D / 2 + 0.32]}>
        <boxGeometry args={[0.6, 0.01, 0.5]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.1} metalness={0.3} />
      </mesh>
      <mesh position={[-0.6, 0.92, -D / 2 + 0.32]}>
        <boxGeometry args={[0.7, 0.01, 0.42]} />
        <Metal g={g === 'negro' ? 'negro' : 'cromo'} />
      </mesh>
      <group position={[-0.6, 0.92, -D / 2 + 0.1]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.4, 16]} />
          <Metal g={g} />
        </mesh>
        <mesh position={[0, 0.4, 0.1]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.1, 0.014, 12, 32, Math.PI]} />
          <Metal g={g} />
        </mesh>
      </group>
      {/* isla */}
      <mesh position={[0.3, 0.45, 0.35]} castShadow>
        <boxGeometry args={[2.2, 0.9, 0.95]} />
        <Madera color="#5b3e29" />
      </mesh>
      <mesh position={[0.3, 0.92, 0.35]} castShadow>
        <boxGeometry args={[2.4, 0.05, 1.05]} />
        <meshPhysicalMaterial color="#f7f5f1" roughness={0.1} clearcoat={1} />
      </mesh>
      {[-0.4, 0.3, 1].map((x) => (
        <group key={x} position={[x, 0, 1.15]}>
          <mesh position={[0, 0.66, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
            <meshStandardMaterial color="#c9a77c" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.66, 12]} />
            <Metal g={g} />
          </mesh>
        </group>
      ))}
      {/* lámparas colgantes */}
      {[-0.4, 0.3, 1].map((x) => (
        <group key={x} position={[x, 1.95, 0.35]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.9, 6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.13, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Metal g={g} />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <sphereGeometry args={[0.07, 24, 12]} />
            <meshStandardMaterial color="#fff6e0" emissive="#ffcf8a" emissiveIntensity={luz === 'dia' ? 1 : 4} toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.15, 0]} intensity={luz === 'dia' ? 0.5 : 2.2} distance={2.6} color="#ffcf8a" />
        </group>
      ))}
      <Planta pos={[-1.9, 0.92, -D / 2 + 0.3]} escala={0.6} />
    </group>
  )
}

function Sala({ luz }: { luz: Luz }) {
  return (
    <group>
      {/* tapete */}
      <mesh rotation-x={-Math.PI / 2} position={[0.2, 0.006, -0.3]} receiveShadow>
        <planeGeometry args={[2.8, 2]} />
        <meshStandardMaterial color="#d8cfc2" roughness={1} />
      </mesh>
      {/* sofá */}
      <group position={[0.2, 0, -D / 2 + 0.75]}>
        <RoundedBox args={[2.6, 0.42, 0.95]} radius={0.08} position={[0, 0.26, 0]} castShadow>
          <meshStandardMaterial color="#b9a58c" roughness={0.95} />
        </RoundedBox>
        <RoundedBox args={[2.6, 0.5, 0.25]} radius={0.08} position={[0, 0.66, -0.36]} castShadow>
          <meshStandardMaterial color="#b9a58c" roughness={0.95} />
        </RoundedBox>
        {[-1.2, 1.2].map((x) => (
          <RoundedBox key={x} args={[0.25, 0.6, 0.95]} radius={0.08} position={[x, 0.36, 0]} castShadow>
            <meshStandardMaterial color="#a8937a" roughness={0.95} />
          </RoundedBox>
        ))}
        {[-0.6, 0.1].map((x, i) => (
          <RoundedBox key={x} args={[0.45, 0.4, 0.14]} radius={0.06} position={[x, 0.66, -0.15]} rotation-z={i ? -0.1 : 0.12} castShadow>
            <meshStandardMaterial color={i ? '#F47920' : '#3c3c3c'} roughness={0.9} />
          </RoundedBox>
        ))}
      </group>
      {/* mesa de centro */}
      <mesh position={[0.2, 0.36, 0.1]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 64]} />
        <meshPhysicalMaterial color="#f5f2ec" roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0.2, 0.17, 0.1]}>
        <cylinderGeometry args={[0.18, 0.25, 0.34, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      {/* lámpara de pie */}
      <group position={[-1.7, 0, -D / 2 + 0.6]}>
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.6, 12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 1.62, 0]}>
          <coneGeometry args={[0.22, 0.28, 32, 1, true]} />
          <meshStandardMaterial color="#fff2dc" emissive="#ffc37a" emissiveIntensity={luz === 'dia' ? 0.6 : 2.6} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} intensity={luz === 'dia' ? 0.4 : 2.5} distance={4} color="#ffc37a" />
      </group>
      {/* cuadro */}
      <mesh position={[0.2, 1.75, -D / 2 + 0.02]}>
        <planeGeometry args={[1.3, 0.8]} />
        <meshStandardMaterial color="#e9d9c3" />
      </mesh>
      <mesh position={[0.05, 1.75, -D / 2 + 0.025]}>
        <circleGeometry args={[0.24, 48]} />
        <meshStandardMaterial color="#F47920" />
      </mesh>
      <Planta pos={[1.75, 0, -D / 2 + 0.5]} escala={1.5} />
    </group>
  )
}

// --- Cámara, luz y entorno ---------------------------------------------------

function CamaraCine() {
  const { camera } = useThree()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const a = 0.55 + Math.sin(t * 0.12) * 0.32
    const r = 4.6
    camera.position.set(Math.sin(a) * r - 0.2, 1.55 + Math.sin(t * 0.2) * 0.12, Math.cos(a) * r - 0.6)
    camera.lookAt(-0.1, 1, -1.3)
  })
  return null
}

function Iluminacion({ luz, calidad }: { luz: Luz; calidad: Calidad }) {
  const sol = luz === 'dia' ? 2.6 : luz === 'calida' ? 0.9 : 0.12
  const amb = luz === 'dia' ? 0.5 : luz === 'calida' ? 0.22 : 0.06
  return (
    <>
      <ambientLight intensity={amb} />
      <directionalLight position={[4, 6, 3]} intensity={sol} color={luz === 'calida' ? '#ffd6a3' : '#fff8ee'} castShadow={calidad === 'alta'} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004}>
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 0.5, 20]} />
      </directionalLight>
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={luz === 'noche' ? 0.4 : 2.2} position={[0, 4, 4]} scale={[8, 3, 1]} color={luz === 'calida' ? '#ffd9b0' : '#ffffff'} />
        <Lightformer form="rect" intensity={luz === 'noche' ? 0.2 : 1.2} position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={luz === 'noche' ? 0.3 : 1.6} position={[0, 1.5, 7]} scale={[10, 4, 1]} color={luz === 'calida' ? '#ffe2c0' : '#ffffff'} />
        <Lightformer form="ring" intensity={luz === 'noche' ? 1.5 : 3} color="#ffcf8a" position={[-3, 3, 2]} scale={1.5} />
        <mesh scale={30}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color={luz === 'noche' ? '#07070a' : luz === 'calida' ? '#2a1d14' : '#c9ced6'} side={THREE.BackSide} />
        </mesh>
      </Environment>
    </>
  )
}

function Contenido({ ambiente, piso, pared, acento, griferia, luz, calidad }: PropsEscena & { calidad: Calidad }) {
  const acentoFondo: Record<TipoAmbiente, [number, number, number, number]> = {
    bano: [0.35, H / 2, 1.9, H],
    cocina: [0.2, 1.25, 4, 0.66],
    sala: [0.2, H / 2, 3.2, H],
  }
  return (
    <>
      <Iluminacion luz={luz} calidad={calidad} />
      <Cuarto piso={piso} pared={pared} acento={acento} acentoFondo={acentoFondo[ambiente]} calidad={calidad}>
        {ambiente === 'bano' && <Bano g={griferia} luz={luz} />}
        {ambiente === 'cocina' && <Cocina g={griferia} luz={luz} />}
        {ambiente === 'sala' && <Sala luz={luz} />}
      </Cuarto>
      {/* Los muebles no se mueven: la sombra se calcula una vez por ambiente. */}
      <ContactShadows key={ambiente} frames={1} position={[0, 0.002, 0]} opacity={0.45} scale={10} blur={2.4} far={3} resolution={512} />
    </>
  )
}

export function Escena3D(props: PropsEscena) {
  const [calidad, setCalidad] = useState<Calidad>(calidadInicial)
  const [listo, setListo] = useState(false)
  const activo = props.activo ?? true
  useEffect(() => {
    const t = setTimeout(() => setListo(true), 1500)
    return () => clearTimeout(t)
  }, [])
  const fondo = props.luz === 'noche' ? '#09090b' : props.luz === 'calida' ? '#1b140f' : '#e7e3dc'
  return (
    <Canvas
      shadows={calidad === 'alta'}
      dpr={calidad === 'alta' ? [1, 1.75] : 1}
      frameloop={activo ? 'always' : 'never'}
      className={props.className}
      style={{ opacity: listo ? 1 : 0, transition: 'opacity 1.2s ease', background: fondo }}
      onCreated={() => setTimeout(() => setListo(true), 250)}
      gl={{ antialias: calidad === 'alta', powerPreference: 'high-performance', preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: props.luz === 'noche' ? 1.1 : 1 }}
      camera={{ position: props.modo === 'cine' ? [3.3, 1.65, 3.5] : [4.6, 1.9, 4.4], fov: 42 }}
    >
      {/* Si el equipo no sostiene la fluidez, baja la calidad sola. */}
      <PerformanceMonitor onDecline={() => setCalidad('baja')} flipflops={1} />
      <color attach="background" args={[fondo]} />
      <fog attach="fog" args={[fondo, 9, 18]} />
      <Suspense fallback={null}>
        <Contenido {...props} calidad={calidad} />
      </Suspense>
      {props.modo === 'cine' ? (
        <CamaraCine />
      ) : (
        <OrbitControls target={[0.75, 1, -1.1]} enablePan={false} minDistance={2.5} maxDistance={7.5} minPolarAngle={0.9} maxPolarAngle={1.52} minAzimuthAngle={-0.25} maxAzimuthAngle={1.25} enableDamping />
      )}
    </Canvas>
  )
}

export default Escena3D
