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
// u_mouse is normalized 0..1 canvas space; (-1,-1) means "no cursor yet" (or
// reduced-motion, where interaction is intentionally disabled) and is pushed
// far enough outside the unit square that the ripple term below is always ~0.
const FRAGMENT_SRC = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

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
  float aspect = u_resolution.x / u_resolution.y;

  // Aspect-corrected distance from the cursor so the ripple rings are
  // circular rather than stretched to the viewport's aspect ratio.
  vec2 uvAspect = vec2(uv.x * aspect, uv.y);
  vec2 mouseAspect = vec2(u_mouse.x * aspect, u_mouse.y);
  float mouseDist = length(uvAspect - mouseAspect);

  vec2 p = uv * 3.0;
  // Flow speed moderately increased over the original 0.035 -- still slow
  // and organic, but with clearly perceptible ambient drift.
  float t = u_time * 0.055;

  // Gentle warp of the sample point near the cursor -- pulls the fbm field
  // outward/inward slightly so the wave visibly reacts, on top of the ripple
  // rings below. Falls off smoothly with distance and fades to nothing when
  // u_mouse is parked off-screen. Displacement strengthened (0.12 -> 0.18)
  // so the cursor reads as clearly interactive.
  float warpFalloff = smoothstep(0.55, 0.0, mouseDist);
  vec2 warpDir = normalize(uvAspect - mouseAspect + 1e-4);
  p += warpDir * warpFalloff * 0.18;

  float wave = fbm(p + vec2(t, -t * 0.6));
  wave += 0.6 * sin(uv.x * 3.0 + t * 1.5) * sin(uv.y * 2.0 - t * 1.2);

  // Soft concentric ripple rings expanding from the cursor, faded by distance
  // and by time-since-last-move via u_mouse itself going stale/off-screen.
  // Slightly faster and stronger than before so the ripple reads clearly.
  float ripple = sin(mouseDist * 36.0 - u_time * 3.0) * smoothstep(0.6, 0.0, mouseDist);
  wave += ripple * 0.11;

  vec3 obsidian = vec3(0.024, 0.035, 0.055);
  vec3 emerald = vec3(0.063, 0.725, 0.506);

  // Overall glow strength kept close to the original -- flow/ripple carry the
  // extra "aliveness" so the canvas stays dark and low-contrast under glass
  // panels and text.
  float glow = smoothstep(0.2, 0.85, wave) * 0.22;
  glow += warpFalloff * 0.07;
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
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    let rafId = null;
    let disposed = false;
    const startTime = performance.now();

    // Cursor position, normalized to 0..1 canvas space. `mouseTarget` is the
    // raw latest pointer position (written by the pointermove listener below,
    // read once per rendered frame -- never used to trigger GL work directly
    // so a very high pointermove frequency still costs just a couple of
    // float writes). `mouseSmooth` is lerped toward it once per frame in the
    // render loop so the ripple follows fluidly instead of jumping. Both
    // start off-screen (-1,-1) so no ripple is visible until the user
    // actually moves the cursor.
    const mouseTarget = { x: -1, y: -1 };
    const mouseSmooth = { x: -1, y: -1 };

    function handlePointerMove(e) {
      mouseTarget.x = e.clientX / window.innerWidth;
      mouseTarget.y = 1 - e.clientY / window.innerHeight;
    }

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
      gl.uniform2f(mouseLoc, mouseSmooth.x, mouseSmooth.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function renderLoop(now) {
      if (disposed) return;
      // Lerp the smoothed cursor position toward the latest raw pointer
      // position once per frame -- this is the only per-frame mouse work,
      // keeping the pointermove handler itself trivial.
      mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.08;
      mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.08;
      drawFrame((now - startTime) / 1000);
      rafId = requestAnimationFrame(renderLoop);
    }

    resize();

    if (reduceMotion) {
      // Single static frame -- no rAF loop at all, and no mouse listener is
      // ever attached (see below), so u_mouse stays at its off-screen default.
      drawFrame(0);
    } else {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
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
      window.removeEventListener("pointermove", handlePointerMove);
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
