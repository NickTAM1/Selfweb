import { useEffect, useRef } from "react";

const VERTEX_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Layered fbm-style noise drifting slowly over time, tinted obsidian ->
// emerald. Kept deliberately low-contrast so glass panels on top stay
// readable.
const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 3.0;
  float t = u_time * 0.035;

  float wave = fbm(p + vec2(t, -t * 0.6));
  wave += 0.5 * sin(uv.x * 3.0 + t * 1.3) * sin(uv.y * 2.0 - t);

  vec3 obsidian = vec3(0.024, 0.035, 0.055);
  vec3 emerald = vec3(0.063, 0.725, 0.506);

  float glow = smoothstep(0.2, 0.85, wave) * 0.22;
  vec3 color = obsidian + emerald * glow;

  float vignette = smoothstep(1.1, 0.3, length(uv - 0.5));
  color *= mix(0.75, 1.0, vignette);

  gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexSrc, fragmentSrc) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Ambient, dependency-free WebGL background: a single fullscreen triangle
 * shaded by a slow-moving fbm noise field. Purely decorative -- fixed behind
 * all content, never intercepts pointer events. Renders nothing (leaving the
 * existing CSS blob background as fallback) if WebGL is unavailable.
 */
export default function WaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const contextOptions = { antialias: false, alpha: false, powerPreference: "low-power" };
    const gl =
      canvas.getContext("webgl", contextOptions) ||
      canvas.getContext("experimental-webgl", contextOptions);

    if (!gl) return undefined;

    const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
    if (!program) return undefined;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // A single triangle that overshoots the viewport on every side -- cheaper
    // than a quad (no second triangle, no index buffer) and avoids the seam.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "a_position");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");

    let rafId = null;
    let disposed = false;
    const startTime = performance.now();

    // Internal render resolution is capped and downscaled: this is a soft,
    // blurred backdrop, so it never needs to be pixel-crisp.
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const downscale = 0.75;
      const width = Math.max(1, Math.floor(window.innerWidth * dpr * downscale));
      const height = Math.max(1, Math.floor(window.innerHeight * dpr * downscale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function drawFrame(time) {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function renderLoop(now) {
      if (disposed) return;
      drawFrame((now - startTime) / 1000);
      rafId = requestAnimationFrame(renderLoop);
    }

    resize();

    if (reduceMotion) {
      // Single static frame -- no rAF loop at all.
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(renderLoop);
    }

    function handleVisibility() {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!reduceMotion && rafId === null && !disposed) {
        rafId = requestAnimationFrame(renderLoop);
      }
    }

    function handleResize() {
      resize();
      if (reduceMotion) drawFrame((performance.now() - startTime) / 1000);
    }

    function handleContextLost(e) {
      e.preventDefault();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function handleContextRestored() {
      // Resources (buffers/program) were invalidated with the old context.
      // Re-creating them safely needs a fresh mount; leaving the canvas
      // blank here is the graceful, crash-free option.
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);

      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      const loseContext = gl.getExtension("WEBGL_lose_context");
      if (loseContext) loseContext.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="wave-background" aria-hidden="true" />;
}
