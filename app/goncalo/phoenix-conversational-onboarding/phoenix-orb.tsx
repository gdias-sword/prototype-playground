'use client';

import { useEffect, useRef } from 'react';

export type PhoenixMood = 'breath' | 'speak' | 'listen' | 'think';

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uSpeak;
uniform float uListen;
uniform float uThink;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  local = local * local * (3.0 - 2.0 * local);

  return mix(
    mix(hash(cell), hash(cell + vec2(1.0, 0.0)), local.x),
    mix(
      hash(cell + vec2(0.0, 1.0)),
      hash(cell + vec2(1.0, 1.0)),
      local.x
    ),
    local.y
  );
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int octave = 0; octave < 5; octave++) {
    value += amplitude * noise(point);
    point = point * 2.03 + vec2(0.17, 0.11);
    amplitude *= 0.5;
  }

  return value;
}

mat2 rotate(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine);
}

float ellipse(vec2 point, vec2 center, vec2 radius) {
  vec2 distanceFromCenter = (point - center) / radius;
  return exp(-dot(distanceFromCenter, distanceFromCenter) * 1.7);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float time = uTime;

  float idleBreath = sin(time * 1.35) * 0.012;
  float phrase = 0.5 + 0.5 * sin(time * 2.15 + sin(time * 0.61));
  float syllable = 0.5 + 0.5 * sin(time * 9.2 + sin(time * 3.7) * 0.8);
  float texture = 0.5 + 0.5 * sin(time * 16.7 + 1.4);
  float voiceEnvelope =
    0.18 + phrase * 0.22 + pow(syllable, 1.8) * 0.48 + texture * 0.12;
  float voiceScale = uSpeak * voiceEnvelope * 0.075;
  float radius = 0.70 + idleBreath + voiceScale - uThink * 0.018;
  float distanceToCenter = length(uv);
  float bodyAlpha = 1.0 - smoothstep(radius - 0.009, radius + 0.009, distanceToCenter);

  vec2 gradientUv = rotate(-0.72 + sin(time * 0.16) * 0.06) * uv;
  float gradientMix = smoothstep(-0.68, 0.68, gradientUv.x + gradientUv.y * 0.42);
  vec3 coral = vec3(1.0, 0.51, 0.514);
  vec3 blue = vec3(0.29, 0.537, 0.91);
  vec3 color = mix(coral, blue, gradientMix);

  vec2 cloudUv = rotate(-0.38 + sin(time * 0.22) * 0.15) * uv;
  float broadFlow = fbm(cloudUv * 1.55 + vec2(time * 0.105, -time * 0.072));
  float fineFlow = fbm(cloudUv * 2.7 - vec2(time * 0.082, time * 0.096));
  cloudUv += vec2(broadFlow - 0.5, fineFlow - 0.5) * 0.26;
  cloudUv += vec2(sin(time * 0.43), cos(time * 0.36)) * 0.055;

  vec2 cloudOne = vec2(
    -0.22 + sin(time * 0.52) * 0.075,
    -0.08 + cos(time * 0.41) * 0.055
  );
  vec2 cloudTwo = vec2(
    0.08 + cos(time * 0.37) * 0.065,
    0.12 + sin(time * 0.47) * 0.07
  );
  vec2 cloudThree = vec2(
    0.26 + sin(time * 0.33 + 1.7) * 0.07,
    -0.18 + cos(time * 0.49 + 0.8) * 0.055
  );

  float cloud =
    ellipse(cloudUv, cloudOne, vec2(0.39, 0.28)) * 0.88 +
    ellipse(cloudUv, cloudTwo, vec2(0.36, 0.42)) * 0.78 +
    ellipse(cloudUv, cloudThree, vec2(0.30, 0.25)) * 0.56;
  cloud *= 0.78 + broadFlow * 0.38;
  cloud = smoothstep(0.12, 1.0, cloud);
  color = mix(color, vec3(1.0, 0.985, 0.975), cloud * 0.96);

  float innerLight = 1.0 - smoothstep(0.0, radius, distanceToCenter);
  color += innerLight * 0.035;
  color *= 1.0 - uListen * 0.025;

  vec2 shadowUv = uv + vec2(0.0, 0.19);
  float shadowDistance = length(shadowUv / vec2(1.05, 0.74));
  float shadow = (1.0 - smoothstep(radius * 0.62, radius * 1.22, shadowDistance)) * 0.22;
  shadow *= 1.0 - bodyAlpha;
  vec3 shadowColor = mix(vec3(0.19, 0.35, 0.64), vec3(0.74, 0.31, 0.31), 0.42);

  float alpha = bodyAlpha + shadow * (1.0 - bodyAlpha);
  vec3 premultipliedColor =
    color * bodyAlpha + shadowColor * shadow * (1.0 - bodyAlpha);

  gl_FragColor = vec4(premultipliedColor, alpha);
}
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
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
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      FRAGMENT_SHADER,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const timeUniform = gl.getUniformLocation(program, 'uTime');
    const speakUniform = gl.getUniformLocation(program, 'uSpeak');
    const listenUniform = gl.getUniformLocation(program, 'uListen');
    const thinkUniform = gl.getUniformLocation(program, 'uThink');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(program);

    let speak = 0;
    let listen = 0;
    let think = 0;
    let animationFrame = 0;
    let isRunning = true;
    const startedAt = performance.now();
    const renderingCanvas = canvas;
    const renderingContext = gl;

    function resize() {
      const width = Math.max(1, renderingCanvas.clientWidth);
      const height = Math.max(1, renderingCanvas.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * pixelRatio);
      const pixelHeight = Math.round(height * pixelRatio);

      if (
        renderingCanvas.width === pixelWidth &&
        renderingCanvas.height === pixelHeight
      ) {
        return;
      }
      renderingCanvas.width = pixelWidth;
      renderingCanvas.height = pixelHeight;
      renderingContext.viewport(0, 0, pixelWidth, pixelHeight);
    }

    function render(now: number) {
      if (!isRunning) return;
      resize();

      const currentMood = moodRef.current;
      speak += ((currentMood === 'speak' ? 1 : 0) - speak) * 0.075;
      listen += ((currentMood === 'listen' ? 1 : 0) - listen) * 0.075;
      think += ((currentMood === 'think' ? 1 : 0) - think) * 0.075;

      renderingContext.uniform1f(timeUniform, (now - startedAt) / 1000);
      renderingContext.uniform1f(speakUniform, speak);
      renderingContext.uniform1f(listenUniform, listen);
      renderingContext.uniform1f(thinkUniform, think);
      renderingContext.drawArrays(renderingContext.TRIANGLES, 0, 6);

      animationFrame = requestAnimationFrame(render);
    }

    animationFrame = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrame);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{
        display: 'block',
        height: '140%',
        width: '140%',
        margin: '-20%',
      }}
    />
  );
}
