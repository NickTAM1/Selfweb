import { useEffect, useState } from "react";

export default function TelemetryLoader({ children }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 450);
    const removeTimer = setTimeout(() => setVisible(false), 750);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {visible && (
        <div id="telemetry-loader" className={fading ? "fade-out" : ""}>
          <div className="loader-terminal">
            <span className="text-emerald">[SYS_INIT]</span> Allocating VFS C++
            StateTree Memory...
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <span className="text-dim">FFT Ocean Wave Mesh Generator: READY</span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
