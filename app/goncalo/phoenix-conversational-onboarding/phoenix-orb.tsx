'use client';

import phoenixSkin from './assets/phoenix.png';
import { useEffect, useRef } from 'react';

export type PhoenixMood = 'breath' | 'speak' | 'listen' | 'think';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uSpeak;
uniform float uListen;
uniform float uThink;
uniform sampler2D uSkin;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.07 + vec2(0.13, 0.07);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float t = uTime;

  float breath = 1.0 + sin(t * 1.12) * (0.045 - uSpeak * 0.02);
  uv /= breath;

  float think = 1.0 - uThink * 0.14;
  uv /= think;

  float n = fbm(uv * (2.15 + uSpeak * 1.8) + vec2(t * (0.11 + uSpeak * 0.42), t * 0.07));
  float n2 = fbm(uv * 3.6 - vec2(t * 0.08, t * 0.1) + n * 0.65);

  vec2 texUv = vUv + (vec2(n, n2) - 0.5) * (0.06 + uSpeak * 0.08);
  vec3 skin = texture2D(uSkin, clamp(texUv, 0.0, 1.0)).rgb;

  float r = length(uv);
  float core = smoothstep(0.52, 0.0, r) * (0.5 + n2 * 0.5);
  float body = smoothstep(0.96, 0.18, r);
  float halo = smoothstep(1.18, 0.42, r);
  float alpha = smoothstep(1.02, 0.58, r);
  alpha *= mix(1.0, 0.82, uListen);

  vec3 coral = vec3(0.99, 0.54, 0.46);
  vec3 peri = vec3(0.47, 0.56, 0.96);
  vec3 lav = vec3(0.73, 0.58, 0.93);
  vec3 white = vec3(1.0, 0.97, 0.95);

  vec3 col = mix(peri, coral, n);
  col = mix(col, lav, n2 * 0.4);
  col = mix(col, skin, 0.55);
  col = mix(col, white, core * (0.72 + uSpeak * 0.28));
  col += halo * mix(peri, coral, 0.35) * 0.28;
  col *= 1.0 + uSpeak * 0.1;

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function PhoenixOrb({
  mood,
  className,
}: {
  mood: PhoenixMood;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moodRef = useRef(mood);
  moodRef.current = mood;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const loc = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uSpeak = gl.getUniformLocation(program, 'uSpeak');
    const uListen = gl.getUniformLocation(program, 'uListen');
    const uThink = gl.getUniformLocation(program, 'uThink');
    const uSkin = gl.getUniformLocation(program, 'uSkin');

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 180, 160, 255]),
    );

    const image = new Image();
    image.src = typeof phoenixSkin === 'string' ? phoenixSkin : phoenixSkin.src;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);
    gl.uniform1i(uSkin, 0);

    let speak = 0;
    let listen = 0;
    let think = 0;
    let frame = 0;
    const start = performance.now();
    let alive = true;

    const resize = () => {
      const size = Math.max(1, canvas.clientWidth);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixels = Math.round(size * dpr);
      if (canvas.width !== pixels || canvas.height !== pixels) {
        canvas.width = pixels;
        canvas.height = pixels;
        gl.viewport(0, 0, pixels, pixels);
      }
    };

    const tick = (now: number) => {
      if (!alive) return;
      resize();
      const moodNow = moodRef.current;
      const speakT = moodNow === 'speak' ? 1 : 0;
      const listenT = moodNow === 'listen' ? 1 : 0;
      const thinkT = moodNow === 'think' ? 1 : 0;
      speak += (speakT - speak) * 0.08;
      listen += (listenT - listen) * 0.08;
      think += (thinkT - think) * 0.1;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uSpeak, speak);
      gl.uniform1f(uListen, listen);
      gl.uniform1f(uThink, think);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.deleteTexture(texture);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
