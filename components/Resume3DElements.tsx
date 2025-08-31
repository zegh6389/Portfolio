"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Torus, Cone, Dodecahedron } from "@react-three/drei";
import * as THREE from "three";

/**
 * Floating decorative elements for the 3D scene
 * These are separated to allow lazy loading
 */
export function FloatingElements() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Floating spheres */}
      <FloatingShape
        position={[-3, 1, -2]}
        scale={0.3}
        rotationSpeed={0.5}
        floatSpeed={0.3}
        floatAmount={0.2}
      >
        <Sphere args={[1, 16, 16]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>
      </FloatingShape>

      {/* Floating torus */}
      <FloatingShape
        position={[3, -1, -2]}
        scale={0.4}
        rotationSpeed={-0.3}
        floatSpeed={0.4}
        floatAmount={0.15}
      >
        <Torus args={[1, 0.4, 12, 24]}>
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </Torus>
      </FloatingShape>

      {/* Floating cone */}
      <FloatingShape
        position={[-2, -1.5, -1]}
        scale={0.35}
        rotationSpeed={0.4}
        floatSpeed={0.5}
        floatAmount={0.25}
      >
        <Cone args={[1, 2, 8]}>
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </Cone>
      </FloatingShape>

      {/* Floating dodecahedron */}
      <FloatingShape
        position={[2, 1.5, -1.5]}
        scale={0.3}
        rotationSpeed={-0.6}
        floatSpeed={0.35}
        floatAmount={0.18}
      >
        <Dodecahedron args={[1, 0]}>
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </Dodecahedron>
      </FloatingShape>
    </group>
  );
}

/**
 * Individual floating shape with animation
 */
function FloatingShape({
  children,
  position,
  scale,
  rotationSpeed = 0.5,
  floatSpeed = 0.5,
  floatAmount = 0.2,
}: {
  children: React.ReactNode;
  position: [number, number, number];
  scale: number;
  rotationSpeed?: number;
  floatSpeed?: number;
  floatAmount?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotation animation
    meshRef.current.rotation.x += rotationSpeed * 0.01;
    meshRef.current.rotation.y += rotationSpeed * 0.01;
    
    // Floating animation
    meshRef.current.position.y = 
      position[1] + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmount;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {children}
    </mesh>
  );
}

/**
 * Particle system for background ambiance
 */
export function ParticleSystem({ count = 100 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  
  // Generate random positions
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.05;
    points.current.rotation.x = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Animated grid background
 */
export function GridBackground() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (!gridRef.current) return;
    gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[20, 20, 0x444444, 0x222222]}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}
