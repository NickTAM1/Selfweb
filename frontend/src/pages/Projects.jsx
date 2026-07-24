import { useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

const FILTERS = ["All", "UE5", "Unity", "Graphics"];

const PROJECTS = [
  {
    id: "mobius-fish",
    category: "UE5",
    categoryLabel: "UE5 // GAME SYSTEMS",
    title: "Möbius Fish (UE5 3D Water-Based Tower Defense Roguelike)",
    summary:
      "A 3D top-down tower defense roguelike built around real fluid dynamics: a physically simulated boat has to survive waves of water-based enemies with their own StateTree-driven AI.",
    badges: ["Unreal Engine 5", "C++", "State Tree", "Physics Simulation", "Firebase"],
    media: [
      { type: "video", src: "/Selfweb/media/mobius-gameplay.mp4", label: "UE5 Gameplay Capture" },
      { type: "image", src: "/Selfweb/media/mobius-1.jpg", label: "Möbius Fish Screenshot 1" },
      { type: "image", src: "/Selfweb/media/mobius-2.jpg", label: "Möbius Fish Screenshot 2" },
      { type: "image", src: "/Selfweb/media/mobius-3.jpg", label: "Möbius Fish Screenshot 3" },
      { type: "image", src: "/Selfweb/media/mobius-4.jpg", label: "Möbius Fish Screenshot 4" },
    ],
    highlights: [
      "C++ StateTree AI with a direct-velocity + NavMesh hybrid movement model",
      "Custom boat buoyancy with smooth roll correction and self-righting torque",
      "Chose plain C++ StateTree over Mass Entity for lower setup overhead and lower CPU cost at this enemy count",
      "Firebase backend integration for a real-time online leaderboard",
      "Scalable core systems, custom game modes, and UI save logic",
    ],
    detail: (
      <details className="deep-dive">
        <summary>Engineering deep-dive</summary>
        <div className="deep-dive-body">
          <p>
            Core C++ systems engineering for a 3D top-down tower defense game
            featuring dynamic fluid dynamics, custom boat buoyancy, and
            multi-priority AI enemies.
          </p>
          <ul>
            <li>
              Boat rolling: past 30° the roll is smoothly corrected back into
              range every frame with FMath::Lerp, instead of a hard snap.
            </li>
            <li>
              Auto right if flipped: dot product between the boat&apos;s up
              vector and world up detects a bad tilt, then a torque from
              CrossProduct(BoatUp, WorldUp) rights the boat.
            </li>
            <li>
              Endless spin fix: yaw angular velocity is clamped past
              MaxTurnAngleFromForward (80°/s) so turning stays snappy but
              controlled.
            </li>
            <li>
              Fish AI built with UE5 State Tree in C++ (no Mass Entity).
              AddMovementInput was silently ignored by the AIController, so
              velocity is assigned directly via
              GetCharacterMovement()-&gt;Velocity, switching to NavMesh at
              longer range and direct velocity up close.
            </li>
            <li>
              Player contact detection used to fail because Blueprint cached
              stale actor tags; switched to IsA(BoatClass) checks instead.
            </li>
            <li>
              Jumper fish kept jumping away from the boat: the math was right,
              the mesh just faced backwards. Fixed by disabling
              bOrientRotationToMovement during the jump and rotating the mesh
              180° in Blueprint.
            </li>
          </ul>
          <p>
            <strong>Trade-off:</strong> evaluated Mass State Tree for the AI
            layer, but rejected it since it is incompatible with ACharacter,
            animation Blueprints, and adds architectural setup overhead that
            does not pay off at this enemy count. Stayed with regular C++
            State Tree for clean, modular, low CPU overhead transitions.
          </p>

          <details className="code-viewer panel">
            <summary>View self righting torque (illustrative, reconstructed)</summary>
            <pre>{`// Reconstructed from the described behavior, not the original source file
FVector BoatUp = GetActorUpVector();
FVector WorldUp = FVector::UpVector;

if (FVector::DotProduct(BoatUp, WorldUp) < 0.8f)
{
    FVector CorrectiveTorque = FVector::CrossProduct(BoatUp, WorldUp) * StabilizationStrength;
    BoatMesh->AddTorqueInDegrees(CorrectiveTorque, NAME_None, true);
}

// Clamp yaw spin so turning stays snappy but controlled
FVector AngularVelocity = BoatMesh->GetPhysicsAngularVelocityInDegrees();
AngularVelocity.Z = FMath::Clamp(AngularVelocity.Z, -MaxTurnAngleFromForward, MaxTurnAngleFromForward);
BoatMesh->SetPhysicsAngularVelocityInDegrees(AngularVelocity);`}</pre>
          </details>
        </div>
      </details>
    ),
  },
  {
    id: "radswing",
    category: "Unity",
    categoryLabel: "UNITY // GAME SYSTEMS",
    title: "Radswing (Fast-Paced First-Person Kick Fighter)",
    summary:
      "A first-person kick fighter where momentum is the weapon: sprint, slide, and double-jump into enemies, kicking them back harder the faster you're moving.",
    badges: ["Unity", "C#", "Physics Mechanics", "AI Behavior"],
    media: [
      { type: "video", src: "/Selfweb/media/radswing-demo.mp4", label: "Radswing Gameplay Capture" },
      { type: "image", src: "/Selfweb/media/radswing-1.jpg", label: "Radswing Screenshot 1" },
      { type: "image", src: "/Selfweb/media/radswing-2.jpg", label: "Radswing Screenshot 2" },
      { type: "image", src: "/Selfweb/media/radswing-3.jpg", label: "Radswing Screenshot 3" },
      { type: "image", src: "/Selfweb/media/radswing-4.jpg", label: "Radswing Screenshot 4" },
    ],
    highlights: [
      "Momentum-based kick (F) that scales knockback with player speed",
      "Three distinct enemy archetypes: Melee, Range, and Tank",
      "NavMesh warp fix so enemies resume pathing from their real position after a knockback, instead of snapping back",
    ],
    detail: (
      <details className="deep-dive">
        <summary>Engineering deep-dive</summary>
        <div className="deep-dive-body">
          <p>
            A first person kick fighter: walk, run, slide, double jump, and
            kick (F) to knock enemies back, the faster you&apos;re moving,
            the harder the kick hits. Three enemy types: Melee (chases and
            punches), Range (shoots from afar), and Tank (slow, heavy, takes
            many kicks to kill).
          </p>
          <ul>
            <li>
              NavMesh snapback: after a kick knockback, enemies teleported
              back onto their path. Fixed with
              navAgent.Warp(transform.position) when re-enabling the NavMesh
              agent, so it starts from where the enemy actually is.
            </li>
            <li>
              Hit animations stuck on loop from a Bool parameter that needed
              manual resetting. Switched to a Trigger parameter, which fires
              once and resets itself.
            </li>
          </ul>

          <details className="code-viewer panel">
            <summary>View NavMesh warp fix (illustrative, reconstructed)</summary>
            <pre>{`// Reconstructed from the described behavior, not the original source file
void OnKnockbackRecover()
{
    navAgent.Warp(transform.position); // tell NavMesh to resume from HERE
    navAgent.enabled = true;
}

// Hit reaction fix: Bool -> Trigger
animator.SetTrigger("Hit"); // fires once and resets itself automatically`}</pre>
          </details>
        </div>
      </details>
    ),
  },
  {
    id: "fft-ocean",
    category: "Graphics",
    categoryLabel: "GRAPHICS // SIMULATION",
    title: "FFT Ocean Wave Generator",
    summary:
      "Simulates realistic ocean waves using FFT and the Phillips spectrum, exporting the results as animated 3D meshes for Blender.",
    badges: ["C++", "Fast Fourier Transform", "Phillips Spectrum", "3D Mesh Export"],
    media: [
      { type: "video", src: "/Selfweb/media/fft-demo.mp4", label: "FFT Ocean Wave Render" },
      { type: "image", src: "/Selfweb/media/fft-1.jpg", label: "FFT Ocean Screenshot 1" },
      { type: "image", src: "/Selfweb/media/fft-2.jpg", label: "FFT Ocean Screenshot 2" },
      { type: "image", src: "/Selfweb/media/fft-3.jpg", label: "FFT Ocean Screenshot 3" },
      { type: "image", src: "/Selfweb/media/fft-4.jpg", label: "FFT Ocean Screenshot 4" },
    ],
    highlights: [
      "Radix-2 Cooley-Tukey IFFT brings a per-frame heightmap from O(N⁴) down to O(N log N), making real-time generation practical",
      "Implemented the Phillips spectrum (wave scale, wind direction, frequency domain) from research papers",
      "Exported animated OBJ sequences (positions, normals, faces) for Blender",
    ],
    detail: (
      <details className="deep-dive">
        <summary>Engineering deep-dive</summary>
        <div className="deep-dive-body">
          <p>
            <strong>Complexity:</strong> direct spatial wave summation is
            O(N^4) and unusable in real time. Replacing it with a Radix 2
            Cooley Tukey IFFT over a bit reversed butterfly diagram brings it
            down to O(N log N), which is what makes generating a full
            heightmap per frame practical at all.
          </p>
          <ul>
            <li>
              Understanding the Phillips spectrum formula (wave scale, wind
              direction, frequency domain) took reading through research
              papers and conference talks.
            </li>
            <li>
              Implemented in C++ with almost no prior C++ experience.
              std::complex helped with the complex number math, and getting
              the FFT butterfly diagram (bit reversal especially) right was
              the hardest part.
            </li>
            <li>
              Exported results as OBJ files (vertex positions, normals,
              faces) and combined them into an animation sequence in
              Blender.
            </li>
          </ul>

          <details className="code-viewer panel">
            <summary>View Phillips spectrum formula (illustrative, reconstructed)</summary>
            <pre>{`// P(k) = A * exp(-1 / (k^2 * L^2)) / k^4 * |k . w|^2
double PhillipsSpectrum(FVector2 k, FVector2 windDir, double windSpeed, double A, double L)
{
    double kLen = k.Length();
    if (kLen < 1e-6) return 0.0;

    double kDotW = Dot(Normalize(k), windDir);
    double base = std::exp(-1.0 / (kLen * kLen * L * L)) / std::pow(kLen, 4);
    return A * base * kDotW * kDotW;
}`}</pre>
          </details>
        </div>
      </details>
    ),
  },
];

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [activeId, setActiveId] = useState(null);
  const triggerRefs = useRef({});

  const visibleProjects = PROJECTS.filter((p) => filter === "All" || p.category === filter);
  const activeProject = PROJECTS.find((p) => p.id === activeId) || null;

  function openProject(id) {
    setActiveId(id);
  }

  function closeProject() {
    const previousId = activeId;
    setActiveId(null);
    triggerRefs.current[previousId]?.focus();
  }

  return (
    <div className="container">
      <h1>Projects</h1>
      <p>
        Möbius Fish has a real gameplay capture; Radswing and the FFT
        generator are placeholders until clips are added. Tap a project for
        the full engineering breakdown.
      </p>

      <Reveal
        as="div"
        className="filter-tabs"
        role="group"
        aria-label="Filter projects by category"
        index={0}
      >
        {FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            className={`filter-tab${filter === label ? " active" : ""}`}
            aria-pressed={filter === label}
            onClick={() => setFilter(label)}
          >
            {label}
          </button>
        ))}
      </Reveal>

      <div className="project-grid">
        {visibleProjects.map((project, i) => (
          <Reveal
            key={project.id}
            className="box project-card-compact"
            index={i}
            onClick={() => openProject(project.id)}
          >
            <div className="project-category-row">
              <span className="mono-label accent project-category">
                {project.categoryLabel}
              </span>
              <span className="mono-label media-gallery-badge">
                ▶ {project.media.length} MEDIA
              </span>
            </div>
            <h2>{project.title}</h2>
            <p className="project-summary">{project.summary}</p>
            <div className="badge-row">
              {project.badges.map((badge) => (
                <span className="badge-emerald" key={badge}>
                  {badge}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="btn-glass view-details-btn"
              aria-haspopup="dialog"
              ref={(el) => {
                triggerRefs.current[project.id] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                openProject(project.id);
              }}
            >
              View details →
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal className="box" index={visibleProjects.length}>
        <h2>Beyond Games</h2>
        <p>
          Outside of game systems, I keep building smaller self-development
          projects to stay sharp on the web and backend side: web scrapers,
          image-search tools, automation scripts, and AI-powered
          applications. It&apos;s ongoing, hands-on practice with the same
          problem-solving habits: reading unfamiliar systems, breaking
          problems down, and shipping something that works.
        </p>
        <div className="badge-row">
          <span className="badge-emerald">Python</span>
          <span className="badge-emerald">Web Scraping</span>
          <span className="badge-emerald">Automation</span>
          <span className="badge-emerald">AI Apps</span>
        </div>
      </Reveal>

      <ProjectModal project={activeProject} onClose={closeProject} />
    </div>
  );
}
