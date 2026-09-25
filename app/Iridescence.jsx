'use client';

// React Bits Iridescence shader, adapted to pause outside the viewport and release WebGL on unmount.
// Source: https://github.com/DavidHDev/react-bits/blob/main/src/content/Backgrounds/Iridescence/Iridescence.jsx
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;
varying vec2 vUv;
void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;
  uv += (uMouse - vec2(0.5)) * uAmplitude;
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}`;

export default function Iridescence({ color = [0.08, 0.22, 0.15], mouseReact = false, amplitude = 0.04, speed = 0.25 }) {
  const containerRef = useRef(null);
  const colorKey = color.join(',');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallScreen = window.matchMedia('(max-width: 760px)');
    let renderer;
    let gl;
    let program;
    let mesh;
    let frame = 0;
    let observer;
    let resizeObserver;
    let visible = false;

    function resize() {
      if (!renderer || !program) return;
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(Math.round(width * 0.65), Math.round(height * 0.65));
      program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    function update(time) {
      frame = 0;
      if (!visible || document.hidden || !renderer) return;
      program.uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(update);
    }
    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    function start() {
      if (frame || !visible || document.hidden || reducedMotion.matches || smallScreen.matches) return;
      if (!renderer) {
        try {
          renderer = new Renderer({ dpr: 1, alpha: true });
          gl = renderer.gl;
          const geometry = new Triangle(gl);
          program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
              uTime: { value: 0 },
              uColor: { value: new Color(...colorKey.split(',').map(Number)) },
              uResolution: { value: new Color(1, 1, 1) },
              uMouse: { value: new Float32Array([0.5, 0.5]) },
              uAmplitude: { value: amplitude },
              uSpeed: { value: speed }
            }
          });
          mesh = new Mesh(gl, { geometry, program });
          container.appendChild(gl.canvas);
          resize();
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(container);
        } catch {
          if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
          renderer = null;
          return;
        }
      }
      frame = requestAnimationFrame(update);
    }
    function sync() { if (reducedMotion.matches || smallScreen.matches) stop(); else start(); }
    function onVisibility() { if (document.hidden) stop(); else start(); }
    observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: '100px' });
    observer.observe(container);
    reducedMotion.addEventListener('change', sync);
    smallScreen.addEventListener('change', sync);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      observer.disconnect();
      resizeObserver?.disconnect();
      reducedMotion.removeEventListener('change', sync);
      smallScreen.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibility);
      if (gl) {
        gl.canvas.remove();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, [colorKey, amplitude, speed, mouseReact]);

  return <div className="iridescence-container" ref={containerRef} aria-hidden="true" />;
}
