'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { type BodyView } from './body-map';
import { isZoneSelected, zoneById, type MapZoneId } from './body-map';

interface BodySkeletonProps {
  selectedAreas: string[];
  drill: MapZoneId | null;
  view: BodyView;
  zoom: number;
  onZoneTap: (zone: MapZoneId) => void;
}

const ZOOM_STEPS = 4;

type MarkerKind = 'glass' | 'bone';

interface BoneMarker {
  mesh: THREE.Mesh;
  zone: MapZoneId | null;
  kind: MarkerKind;
}

type SurfaceState = 'rest' | 'hover' | 'drill' | 'selected';

interface SurfaceTarget {
  color: THREE.Color;
  emissive: THREE.Color;
  emissiveIntensity: number;
  transmission: number;
  iridescence: number;
  roughness: number;
}

const UP = new THREE.Vector3(0, 1, 0);
const CORAL = 0xff8283;
const BLUE = 0x4a89e8;

const GLASS_LOOK: Record<SurfaceState, SurfaceTarget> = {
  rest: {
    color: new THREE.Color(0xf4f1ff),
    emissive: new THREE.Color(CORAL),
    emissiveIntensity: 0.09,
    transmission: 0.62,
    iridescence: 0.58,
    roughness: 0.06,
  },
  hover: {
    color: new THREE.Color(0xffd0cc),
    emissive: new THREE.Color(CORAL),
    emissiveIntensity: 0.16,
    transmission: 0.4,
    iridescence: 0.62,
    roughness: 0.06,
  },
  drill: {
    color: new THREE.Color(0xc5d6ff),
    emissive: new THREE.Color(BLUE),
    emissiveIntensity: 0.18,
    transmission: 0.36,
    iridescence: 0.58,
    roughness: 0.06,
  },
  selected: {
    color: new THREE.Color(BLUE),
    emissive: new THREE.Color(BLUE),
    emissiveIntensity: 0.32,
    transmission: 0.28,
    iridescence: 0.7,
    roughness: 0.05,
  },
};

const BONE_LOOK: Record<SurfaceState, SurfaceTarget> = {
  rest: {
    color: new THREE.Color(0xe9e6f4),
    emissive: new THREE.Color(0x6a5a88),
    emissiveIntensity: 0.06,
    transmission: 0.28,
    iridescence: 0.12,
    roughness: 0.28,
  },
  hover: {
    color: new THREE.Color(0xffe4dc),
    emissive: new THREE.Color(CORAL),
    emissiveIntensity: 0.12,
    transmission: 0.06,
    iridescence: 0,
    roughness: 0.34,
  },
  drill: {
    color: new THREE.Color(0xd5e1ff),
    emissive: new THREE.Color(BLUE),
    emissiveIntensity: 0.16,
    transmission: 0.05,
    iridescence: 0,
    roughness: 0.32,
  },
  selected: {
    color: new THREE.Color(0xa8c0f8),
    emissive: new THREE.Color(BLUE),
    emissiveIntensity: 0.24,
    transmission: 0.04,
    iridescence: 0,
    roughness: 0.28,
  },
};

function vec(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function makeGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: GLASS_LOOK.rest.color,
    roughness: 0.06,
    metalness: 0,
    transmission: 0.62,
    thickness: 0.85,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: 0.58,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [80, 460],
    attenuationColor: new THREE.Color(0xffb0b4),
    attenuationDistance: 0.28,
    transparent: true,
    opacity: 1,
    envMapIntensity: 2.1,
    specularIntensity: 1,
    emissive: GLASS_LOOK.rest.emissive.clone(),
    emissiveIntensity: GLASS_LOOK.rest.emissiveIntensity,
  });
}

function makeBoneMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: BONE_LOOK.rest.color,
    roughness: 0.28,
    metalness: 0.02,
    transmission: 0.28,
    thickness: 0.08,
    ior: 1.42,
    sheen: 0.7,
    sheenColor: new THREE.Color(0xe8dcff),
    sheenRoughness: 0.3,
    clearcoat: 0.45,
    clearcoatRoughness: 0.22,
    transparent: true,
    opacity: 0.55,
    envMapIntensity: 0.55,
    emissive: BONE_LOOK.rest.emissive.clone(),
    emissiveIntensity: BONE_LOOK.rest.emissiveIntensity,
  });
}

function mark(
  parent: THREE.Group,
  markers: BoneMarker[],
  zone: MapZoneId | null,
  kind: MarkerKind,
  mesh: THREE.Mesh,
) {
  mesh.userData.zone = zone;
  mesh.userData.kind = kind;
  parent.add(mesh);
  markers.push({ mesh, zone, kind });
}

function addEllipsoid(
  parent: THREE.Group,
  markers: BoneMarker[],
  zone: MapZoneId | null,
  kind: MarkerKind,
  position: THREE.Vector3,
  rx: number,
  ry: number,
  rz: number,
  material: THREE.MeshPhysicalMaterial,
  rotation?: THREE.Euler,
) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 36, 24),
    material.clone(),
  );
  mesh.scale.set(rx, ry, rz);
  mesh.position.copy(position);
  if (rotation) mesh.setRotationFromEuler(rotation);
  mark(parent, markers, zone, kind, mesh);
}

function addTaper(
  parent: THREE.Group,
  markers: BoneMarker[],
  zone: MapZoneId | null,
  kind: MarkerKind,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radiusStart: number,
  radiusEnd: number,
  material: THREE.MeshPhysicalMaterial,
) {
  const direction = end.clone().sub(start);
  const length = Math.max(0.016, direction.length());
  const points: THREE.Vector2[] = [];
  const steps = 16;
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const radiusMix = radiusStart * (1 - t) + radiusEnd * t;
    const cap =
      t < 0.16
        ? Math.sin((t / 0.16) * Math.PI * 0.5)
        : t > 0.84
          ? Math.sin(((1 - t) / 0.16) * Math.PI * 0.5)
          : 1;
    points.push(new THREE.Vector2(Math.max(0.0012, radiusMix * cap), (t - 0.5) * length));
  }
  const mesh = new THREE.Mesh(
    new THREE.LatheGeometry(points, 24),
    material.clone(),
  );
  mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(UP, direction.normalize());
  mark(parent, markers, zone, kind, mesh);
}

function addTube(
  parent: THREE.Group,
  markers: BoneMarker[],
  zone: MapZoneId | null,
  kind: MarkerKind,
  points: THREE.Vector3[],
  radius: number,
  material: THREE.MeshPhysicalMaterial,
) {
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      Math.max(16, points.length * 5),
      radius,
      8,
      false,
    ),
    material.clone(),
  );
  mark(parent, markers, zone, kind, mesh);
}

function addLathe(
  parent: THREE.Group,
  markers: BoneMarker[],
  zone: MapZoneId | null,
  kind: MarkerKind,
  points: THREE.Vector2[],
  flatten: number,
  material: THREE.MeshPhysicalMaterial,
) {
  const mesh = new THREE.Mesh(
    new THREE.LatheGeometry(points, 48),
    material.clone(),
  );
  mesh.scale.z = flatten;
  mark(parent, markers, zone, kind, mesh);
}

function addHand(
  parent: THREE.Group,
  markers: BoneMarker[],
  zone: MapZoneId,
  kind: MarkerKind,
  wrist: THREE.Vector3,
  side: number,
  material: THREE.MeshPhysicalMaterial,
) {
  const palm = wrist.clone().add(vec(side * 0.018, -0.042, 0.02));
  addEllipsoid(
    parent,
    markers,
    zone,
    kind,
    palm,
    0.026,
    0.038,
    0.011,
    material,
    new THREE.Euler(0.45, 0, side * 0.18),
  );

  for (let index = 0; index < 4; index += 1) {
    const spread = (index - 1.5) * 0.013;
    const base = palm.clone().add(vec(side * 0.006 + spread, -0.036, 0.008));
    const tip = base.clone().add(vec(spread * 0.35, -0.042, 0.01));
    addTaper(parent, markers, zone, kind, base, tip, 0.0052, 0.0032, material);
  }

  const thumbBase = palm.clone().add(vec(side * -0.016, -0.006, 0.014));
  const thumbTip = thumbBase.clone().add(vec(side * -0.028, -0.018, 0.018));
  addTaper(parent, markers, zone, kind, thumbBase, thumbTip, 0.006, 0.0038, material);
}

function addRibCage(
  parent: THREE.Group,
  markers: BoneMarker[],
  material: THREE.MeshPhysicalMaterial,
) {
  const count = 7;
  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const y = 1.36 - t * 0.22;
    const width = 0.08 + Math.sin(t * Math.PI) * 0.065;
    const depth = 0.078 + Math.sin(t * Math.PI) * 0.05;
    const drop = 0.01 + t * 0.02;

    for (const side of [-1, 1]) {
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= 10; step += 1) {
        const u = step / 10;
        const angle = u * Math.PI * 0.82;
        points.push(
          vec(
            side * Math.sin(angle) * width,
            y - Math.sin(u * Math.PI) * drop,
            -Math.cos(angle) * depth + depth * 0.22,
          ),
        );
      }
      addTube(parent, markers, 'back', 'bone', points, 0.0036, material);
    }
  }
}

function buildFigure(
  glassMaterial: THREE.MeshPhysicalMaterial,
  boneMaterial: THREE.MeshPhysicalMaterial,
) {
  const root = new THREE.Group();
  const markers: BoneMarker[] = [];

  const skull = vec(0, 1.63, 0.015);
  const c1 = vec(0, 1.525, 0.012);
  const c7 = vec(0, 1.445, 0.004);
  const t4 = vec(0, 1.345, -0.018);
  const t8 = vec(0, 1.245, -0.028);
  const t12 = vec(0, 1.145, -0.016);
  const l3 = vec(0, 1.045, 0.01);
  const sacrum = vec(0, 0.945, -0.008);
  const rShoulder = vec(0.185, 1.405, 0.012);
  const lShoulder = vec(-0.185, 1.405, 0.012);
  const rElbow = vec(0.255, 1.145, 0.038);
  const lElbow = vec(-0.255, 1.145, 0.038);
  const rWrist = vec(0.3, 0.9, 0.055);
  const lWrist = vec(-0.3, 0.9, 0.055);
  const rHip = vec(0.092, 0.915, 0.012);
  const lHip = vec(-0.092, 0.915, 0.012);
  const rKnee = vec(0.108, 0.5, 0.028);
  const lKnee = vec(-0.108, 0.5, 0.028);
  const rAnkle = vec(0.1, 0.095, 0.002);
  const lAnkle = vec(-0.1, 0.095, 0.002);
  const rFoot = vec(0.1, 0.028, 0.08);
  const lFoot = vec(-0.1, 0.028, 0.08);

  addEllipsoid(root, markers, 'neck', 'bone', skull, 0.068, 0.082, 0.074, boneMaterial);
  addEllipsoid(
    root,
    markers,
    'neck',
    'bone',
    vec(0, 1.555, 0.03),
    0.042,
    0.032,
    0.05,
    boneMaterial,
  );
  addTaper(root, markers, 'neck', 'bone', skull, c1, 0.016, 0.012, boneMaterial);
  addTaper(root, markers, 'neck', 'bone', c1, c7, 0.012, 0.014, boneMaterial);

  addTaper(root, markers, 'back', 'bone', c7, t4, 0.011, 0.012, boneMaterial);
  addTaper(root, markers, 'back', 'bone', t4, t8, 0.012, 0.013, boneMaterial);
  addTaper(root, markers, 'back', 'bone', t8, t12, 0.013, 0.012, boneMaterial);
  addTaper(root, markers, 'back', 'bone', t12, l3, 0.012, 0.013, boneMaterial);
  addTaper(root, markers, 'back', 'bone', l3, sacrum, 0.013, 0.016, boneMaterial);
  for (const joint of [t4, t8, t12, l3]) {
    addEllipsoid(root, markers, 'back', 'bone', joint, 0.014, 0.01, 0.013, boneMaterial);
  }
  addRibCage(root, markers, boneMaterial);
  addEllipsoid(
    root,
    markers,
    'back',
    'bone',
    vec(0, 1.28, 0.05),
    0.012,
    0.055,
    0.008,
    boneMaterial,
  );

  addTube(
    root,
    markers,
    'shoulder',
    'bone',
    [vec(0.02, 1.41, 0.04), vec(0.1, 1.425, 0.03), rShoulder],
    0.007,
    boneMaterial,
  );
  addTube(
    root,
    markers,
    'shoulder',
    'bone',
    [vec(-0.02, 1.41, 0.04), vec(-0.1, 1.425, 0.03), lShoulder],
    0.007,
    boneMaterial,
  );
  addEllipsoid(root, markers, 'shoulder', 'bone', rShoulder, 0.028, 0.026, 0.024, boneMaterial);
  addEllipsoid(root, markers, 'shoulder', 'bone', lShoulder, 0.028, 0.026, 0.024, boneMaterial);
  addEllipsoid(
    root,
    markers,
    'shoulder',
    'bone',
    vec(0.13, 1.36, -0.05),
    0.04,
    0.032,
    0.01,
    boneMaterial,
    new THREE.Euler(0.35, 0.4, 0.2),
  );
  addEllipsoid(
    root,
    markers,
    'shoulder',
    'bone',
    vec(-0.13, 1.36, -0.05),
    0.04,
    0.032,
    0.01,
    boneMaterial,
    new THREE.Euler(0.35, -0.4, -0.2),
  );

  addTaper(root, markers, 'arm', 'bone', rShoulder, rElbow, 0.018, 0.014, boneMaterial);
  addTaper(root, markers, 'arm', 'bone', lShoulder, lElbow, 0.018, 0.014, boneMaterial);
  addEllipsoid(root, markers, 'arm', 'bone', rElbow, 0.02, 0.018, 0.016, boneMaterial);
  addEllipsoid(root, markers, 'arm', 'bone', lElbow, 0.02, 0.018, 0.016, boneMaterial);
  addTaper(root, markers, 'arm', 'bone', rElbow, rWrist, 0.013, 0.01, boneMaterial);
  addTaper(root, markers, 'arm', 'bone', lElbow, lWrist, 0.013, 0.01, boneMaterial);
  addHand(root, markers, 'arm', 'bone', rWrist, 1, boneMaterial);
  addHand(root, markers, 'arm', 'bone', lWrist, -1, boneMaterial);

  addEllipsoid(root, markers, 'hip', 'bone', sacrum, 0.034, 0.03, 0.022, boneMaterial);
  addEllipsoid(
    root,
    markers,
    'hip',
    'bone',
    vec(0.07, 0.94, -0.01),
    0.055,
    0.038,
    0.02,
    boneMaterial,
    new THREE.Euler(0.5, 0.35, 0.15),
  );
  addEllipsoid(
    root,
    markers,
    'hip',
    'bone',
    vec(-0.07, 0.94, -0.01),
    0.055,
    0.038,
    0.02,
    boneMaterial,
    new THREE.Euler(0.5, -0.35, -0.15),
  );
  addEllipsoid(root, markers, 'hip', 'bone', rHip, 0.03, 0.028, 0.026, boneMaterial);
  addEllipsoid(root, markers, 'hip', 'bone', lHip, 0.03, 0.028, 0.026, boneMaterial);

  addTaper(root, markers, 'leg', 'bone', rHip, rKnee, 0.024, 0.018, boneMaterial);
  addTaper(root, markers, 'leg', 'bone', lHip, lKnee, 0.024, 0.018, boneMaterial);
  addEllipsoid(root, markers, 'leg', 'bone', rKnee, 0.024, 0.022, 0.02, boneMaterial);
  addEllipsoid(root, markers, 'leg', 'bone', lKnee, 0.024, 0.022, 0.02, boneMaterial);
  addTaper(root, markers, 'leg', 'bone', rKnee, rAnkle, 0.016, 0.012, boneMaterial);
  addTaper(root, markers, 'leg', 'bone', lKnee, lAnkle, 0.016, 0.012, boneMaterial);
  addEllipsoid(root, markers, 'leg', 'bone', rAnkle, 0.018, 0.016, 0.015, boneMaterial);
  addEllipsoid(root, markers, 'leg', 'bone', lAnkle, 0.018, 0.016, 0.015, boneMaterial);
  addTaper(root, markers, 'leg', 'bone', rAnkle, rFoot, 0.012, 0.01, boneMaterial);
  addTaper(root, markers, 'leg', 'bone', lAnkle, lFoot, 0.012, 0.01, boneMaterial);
  addEllipsoid(
    root,
    markers,
    'leg',
    'bone',
    rFoot,
    0.032,
    0.016,
    0.07,
    boneMaterial,
    new THREE.Euler(0.12, 0, 0),
  );
  addEllipsoid(
    root,
    markers,
    'leg',
    'bone',
    lFoot,
    0.032,
    0.016,
    0.07,
    boneMaterial,
    new THREE.Euler(0.12, 0, 0),
  );

  addEllipsoid(root, markers, 'neck', 'glass', skull, 0.078, 0.094, 0.084, glassMaterial);
  addEllipsoid(
    root,
    markers,
    'neck',
    'glass',
    vec(0, 1.548, 0.028),
    0.05,
    0.04,
    0.056,
    glassMaterial,
  );
  addTaper(root, markers, 'neck', 'glass', vec(0, 1.54, 0.012), c7, 0.038, 0.046, glassMaterial);
  addEllipsoid(
    root,
    markers,
    'shoulder',
    'glass',
    vec(0, 1.43, -0.02),
    0.12,
    0.05,
    0.055,
    glassMaterial,
  );

  addLathe(
    root,
    markers,
    'back',
    'glass',
    [
      new THREE.Vector2(0.04, 1.49),
      new THREE.Vector2(0.048, 1.46),
      new THREE.Vector2(0.078, 1.43),
      new THREE.Vector2(0.132, 1.405),
      new THREE.Vector2(0.168, 1.365),
      new THREE.Vector2(0.176, 1.315),
      new THREE.Vector2(0.162, 1.255),
      new THREE.Vector2(0.142, 1.195),
      new THREE.Vector2(0.128, 1.135),
      new THREE.Vector2(0.126, 1.08),
      new THREE.Vector2(0.14, 1.03),
    ],
    0.7,
    glassMaterial,
  );

  addLathe(
    root,
    markers,
    'hip',
    'glass',
    [
      new THREE.Vector2(0.136, 1.055),
      new THREE.Vector2(0.166, 1.005),
      new THREE.Vector2(0.18, 0.965),
      new THREE.Vector2(0.172, 0.925),
      new THREE.Vector2(0.128, 0.89),
      new THREE.Vector2(0.055, 0.858),
    ],
    0.72,
    glassMaterial,
  );

  addEllipsoid(
    root,
    markers,
    'shoulder',
    'glass',
    rShoulder,
    0.07,
    0.046,
    0.055,
    glassMaterial,
    new THREE.Euler(0.15, 0.2, -0.35),
  );
  addEllipsoid(
    root,
    markers,
    'shoulder',
    'glass',
    lShoulder,
    0.07,
    0.046,
    0.055,
    glassMaterial,
    new THREE.Euler(0.15, -0.2, 0.35),
  );

  addTaper(root, markers, 'arm', 'glass', rShoulder, rElbow, 0.046, 0.032, glassMaterial);
  addTaper(root, markers, 'arm', 'glass', lShoulder, lElbow, 0.046, 0.032, glassMaterial);
  addTaper(root, markers, 'arm', 'glass', rElbow, rWrist, 0.03, 0.02, glassMaterial);
  addTaper(root, markers, 'arm', 'glass', lElbow, lWrist, 0.03, 0.02, glassMaterial);
  addHand(root, markers, 'arm', 'glass', rWrist, 1, glassMaterial);
  addHand(root, markers, 'arm', 'glass', lWrist, -1, glassMaterial);

  addTaper(root, markers, 'leg', 'glass', rHip, rKnee, 0.062, 0.042, glassMaterial);
  addTaper(root, markers, 'leg', 'glass', lHip, lKnee, 0.062, 0.042, glassMaterial);
  addTaper(root, markers, 'leg', 'glass', rKnee, rAnkle, 0.036, 0.022, glassMaterial);
  addTaper(root, markers, 'leg', 'glass', lKnee, lAnkle, 0.036, 0.022, glassMaterial);
  addEllipsoid(
    root,
    markers,
    'leg',
    'glass',
    rFoot,
    0.038,
    0.022,
    0.088,
    glassMaterial,
    new THREE.Euler(0.1, 0.04, 0),
  );
  addEllipsoid(
    root,
    markers,
    'leg',
    'glass',
    lFoot,
    0.038,
    0.022,
    0.088,
    glassMaterial,
    new THREE.Euler(0.1, -0.04, 0),
  );

  return { root, markers };
}

function createEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(10, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xf4eef8, side: THREE.BackSide }),
  );
  envScene.add(sky);

    const coral = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xff8a86 }),
  );
  coral.position.set(-2.1, 2.3, -2.4);
  envScene.add(coral);

  const blue = new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x6a9cff }),
  );
  blue.position.set(2.2, 0.2, -2.1);
  envScene.add(blue);

  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  highlight.position.set(0.4, 3.4, 2.2);
  envScene.add(highlight);

  const envMap = pmrem.fromScene(envScene, 0.06).texture;
  pmrem.dispose();
  envScene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    }
  });
  return envMap;
}

function createGround() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createRadialGradient(64, 64, 6, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(90, 80, 160, 0.18)');
  gradient.addColorStop(0.42, 'rgba(90, 80, 160, 0.07)');
  gradient.addColorStop(1, 'rgba(90, 80, 160, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.46),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, 0.012, 0.03);
  return mesh;
}

function surfaceState(
  zone: MapZoneId | null,
  selected: string[],
  drill: MapZoneId | null,
  hover: MapZoneId | null,
): SurfaceState {
  if (!zone) return 'rest';
  if (isZoneSelected(zoneById(zone), selected)) return 'selected';
  if (drill === zone) return 'drill';
  if (hover === zone) return 'hover';
  return 'rest';
}

function radiusForZoom(level: number, min: number, max: number) {
  return THREE.MathUtils.lerp(max, min, level / ZOOM_STEPS);
}

function shortestAngle(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function BodySkeleton({
  selectedAreas,
  drill,
  view,
  zoom,
  onZoneTap,
}: BodySkeletonProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedAreas);
  const drillRef = useRef(drill);
  const viewRef = useRef(view);
  const zoomRef = useRef(zoom);
  const onZoneTapRef = useRef(onZoneTap);
  const hoverRef = useRef<MapZoneId | null>(null);

  selectedRef.current = selectedAreas;
  drillRef.current = drill;
  viewRef.current = view;
  zoomRef.current = zoom;
  onZoneTapRef.current = onZoneTap;

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const hostEl: HTMLDivElement = node;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0.98, 2.52);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    hostEl.appendChild(renderer.domElement);

    const envMap = createEnvironment(renderer);
    scene.environment = envMap;

    scene.add(new THREE.HemisphereLight(0xffe8e4, 0xb8c6ff, 0.55));

    const key = new THREE.DirectionalLight(0xfff6f0, 1.35);
    key.position.set(1.2, 2.6, 1.8);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffc8cc, 0.4);
    fill.position.set(-1.8, 1.1, 0.8);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x8eb0ff, 1.55);
    rim.position.set(-1.4, 0.7, -1.9);
    scene.add(rim);

    const bounce = new THREE.DirectionalLight(0xdce4ff, 0.28);
    bounce.position.set(0.2, -1.4, 0.8);
    scene.add(bounce);

    const core = new THREE.PointLight(CORAL, 0.55, 2.6);
    core.position.set(0, 1.22, 0.16);
    scene.add(core);

    const glassMaterial = makeGlassMaterial();
    const boneMaterial = makeBoneMaterial();
    const { root, markers } = buildFigure(glassMaterial, boneMaterial);
    root.rotation.z = 0.03;
    root.rotation.x = 0.02;
    scene.add(root);

    const ground = createGround();
    if (ground) scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = true;
    controls.panSpeed = 0.45;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.7;
    controls.minDistance = 1.55;
    controls.maxDistance = 3.8;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = Math.PI - 0.55;
    controls.target.set(0, 0.9, 0);
    controls.update();

    const cameraTween = { theta: false, radius: false };
    let appliedView = viewRef.current;
    let appliedZoom = zoomRef.current;
    const offset = new THREE.Vector3();
    const spherical = new THREE.Spherical();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = { x: 0, y: 0 };
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    canvas.style.cursor = 'grab';

    function sizeToHost() {
      const width = Math.max(1, hostEl.clientWidth);
      const height = Math.max(1, hostEl.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function zoneFromEvent(event: PointerEvent) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        markers.map((marker) => marker.mesh),
        false,
      );
      const zone = hits[0]?.object.userData.zone;
      return typeof zone === 'string' ? (zone as MapZoneId) : null;
    }

    function paint() {
      const hover = hoverRef.current;
      const selected = selectedRef.current;
      const activeDrill = drillRef.current;

      for (const marker of markers) {
        const material = marker.mesh.material as THREE.MeshPhysicalMaterial;
        const palette = marker.kind === 'glass' ? GLASS_LOOK : BONE_LOOK;
        const target =
          palette[surfaceState(marker.zone, selected, activeDrill, hover)];
        material.color.lerp(target.color, 0.16);
        material.emissive.lerp(target.emissive, 0.16);
        material.emissiveIntensity +=
          (target.emissiveIntensity - material.emissiveIntensity) * 0.16;
        material.transmission += (target.transmission - material.transmission) * 0.16;
        material.iridescence += (target.iridescence - material.iridescence) * 0.16;
        material.roughness += (target.roughness - material.roughness) * 0.16;
      }
    }

    function applyCameraTween() {
      if (viewRef.current !== appliedView) {
        appliedView = viewRef.current;
        cameraTween.theta = true;
      }
      if (zoomRef.current !== appliedZoom) {
        appliedZoom = zoomRef.current;
        cameraTween.radius = true;
      }
      if (!cameraTween.theta && !cameraTween.radius) return;

      offset.copy(camera.position).sub(controls.target);
      spherical.setFromVector3(offset);

      if (cameraTween.theta) {
        const targetTheta = appliedView === 'front' ? 0 : Math.PI;
        const delta = shortestAngle(spherical.theta, targetTheta);
        spherical.theta += delta * 0.16;
        if (Math.abs(delta) < 0.01) {
          spherical.theta = targetTheta;
          cameraTween.theta = false;
        }
      }

      if (cameraTween.radius) {
        const targetRadius = radiusForZoom(
          appliedZoom,
          controls.minDistance,
          controls.maxDistance,
        );
        spherical.radius += (targetRadius - spherical.radius) * 0.18;
        if (Math.abs(targetRadius - spherical.radius) < 0.014) {
          spherical.radius = targetRadius;
          cameraTween.radius = false;
        }
      }

      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
    }

    function handlePointerDown(event: PointerEvent) {
      pointerDown = { x: event.clientX, y: event.clientY };
      cameraTween.theta = false;
      canvas.style.cursor = 'grabbing';
    }

    function handlePointerMove(event: PointerEvent) {
      hoverRef.current = zoneFromEvent(event);
      if (canvas.style.cursor !== 'grabbing') {
        canvas.style.cursor = hoverRef.current ? 'pointer' : 'grab';
      }
    }

    function handlePointerUp(event: PointerEvent) {
      canvas.style.cursor = hoverRef.current ? 'pointer' : 'grab';
      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      if (Math.hypot(dx, dy) > 8) return;
      const zone = zoneFromEvent(event);
      if (zone) onZoneTapRef.current(zone);
    }

    function handlePointerLeave() {
      hoverRef.current = null;
      canvas.style.cursor = 'grab';
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const observer = new ResizeObserver(sizeToHost);
    observer.observe(hostEl);
    sizeToHost();

    let frame = 0;
    function tick() {
      frame = window.requestAnimationFrame(tick);
      const time = performance.now() / 1000;
      root.rotation.y = Math.sin(time * 0.28) * 0.06;
      applyCameraTween();
      paint();
      controls.update();
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      controls.dispose();
      envMap.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((item) => item.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      hostEl.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_62%,rgba(244,240,255,0.28)_100%)]" />
    </div>
  );
}
