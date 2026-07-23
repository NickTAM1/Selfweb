import Reveal from "../components/Reveal.jsx";

const GITHUB_PROFILE = "https://github.com/NickTAM1";

function MediaPlaceholder({ label }) {
  return (
    <div className="media-container media-placeholder">
      <p>No gameplay clip or screenshot added yet</p>
      <div className="media-overlay">
        <span className="badge-emerald">{label}</span>
        <div className="media-controls">
          <button className="btn-glass" disabled>
            ▶ Play Clip
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaVideo({ src, label }) {
  return (
    <div className="media-container">
      <span className="badge-emerald media-caption">{label}</span>
      <video className="project-video" src={src} controls preload="metadata" />
    </div>
  );
}

export default function Projects() {
  return (
    <div className="container">
      <h1>Projects</h1>
      <p>
        Möbius Fish has a real gameplay capture below. Radswing and the FFT
        generator are still placeholders until clips are added.
      </p>

      <Reveal className="box" index={0}>
        <h2>Möbius Fish (UE5 3D Water-Based Tower Defense Roguelike)</h2>
        <p className="project-summary">
          A 3D top-down tower defense roguelike built around real fluid
          dynamics: a physically simulated boat has to survive waves of
          water-based enemies with their own StateTree-driven AI.
        </p>

        <div className="badge-row">
          <span className="badge-emerald">Unreal Engine 5</span>
          <span className="badge-emerald">C++</span>
          <span className="badge-emerald">State Tree</span>
          <span className="badge-emerald">Physics Simulation</span>
          <span className="badge-emerald">Firebase</span>
        </div>

        <MediaVideo src="/Selfweb/media/mobius-gameplay.mp4" label="UE5 Gameplay Capture" />

        <p className="project-section-label">Highlights</p>
        <ul className="highlights">
          <li>C++ StateTree AI with a direct-velocity + NavMesh hybrid movement model</li>
          <li>Custom boat buoyancy with smooth roll correction and self-righting torque</li>
          <li>
            Chose plain C++ StateTree over Mass Entity for lower setup overhead and lower
            CPU cost at this enemy count
          </li>
          <li>Firebase backend integration for a real-time online leaderboard</li>
          <li>Scalable core systems, custom game modes, and UI save logic</li>
        </ul>

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

        <div className="project-actions">
          <a className="btn-glass" href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
            View Source on GitHub
          </a>
        </div>
      </Reveal>

      <Reveal className="box" index={1}>
        <h2>Radswing (Fast-Paced First-Person Kick Fighter)</h2>
        <p className="project-summary">
          A first-person kick fighter where momentum is the weapon: sprint,
          slide, and double-jump into enemies, kicking them back harder the
          faster you&apos;re moving.
        </p>

        <div className="badge-row">
          <span className="badge-emerald">Unity</span>
          <span className="badge-emerald">C#</span>
          <span className="badge-emerald">Physics Mechanics</span>
          <span className="badge-emerald">AI Behavior</span>
        </div>

        <MediaPlaceholder label="Unity Gameplay Capture" />

        <p className="project-section-label">Highlights</p>
        <ul className="highlights">
          <li>Momentum-based kick (F) that scales knockback with player speed</li>
          <li>Three distinct enemy archetypes: Melee, Range, and Tank</li>
          <li>
            NavMesh warp fix so enemies resume pathing from their real
            position after a knockback, instead of snapping back
          </li>
        </ul>

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

        <div className="project-actions">
          <a className="btn-glass" href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
            View Source on GitHub
          </a>
        </div>
      </Reveal>

      <Reveal className="box" index={2}>
        <h2>FFT Ocean Wave Generator</h2>
        <p className="project-summary">
          Simulates realistic ocean waves using FFT and the Phillips spectrum,
          exporting the results as animated 3D meshes for Blender.
        </p>

        <div className="badge-row">
          <span className="badge-emerald">C++</span>
          <span className="badge-emerald">Fast Fourier Transform</span>
          <span className="badge-emerald">Phillips Spectrum</span>
          <span className="badge-emerald">3D Mesh Export</span>
        </div>

        <MediaPlaceholder label="Blender Wave Render" />

        <p className="project-section-label">Highlights</p>
        <ul className="highlights">
          <li>
            Radix-2 Cooley-Tukey IFFT brings a per-frame heightmap from
            O(N⁴) down to O(N log N), making real-time generation practical
          </li>
          <li>Implemented the Phillips spectrum (wave scale, wind direction, frequency domain) from research papers</li>
          <li>Exported animated OBJ sequences (positions, normals, faces) for Blender</li>
        </ul>

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

        <div className="project-actions">
          <a className="btn-glass" href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
            View Source on GitHub
          </a>
        </div>
      </Reveal>

      <Reveal className="box" index={3}>
        <h2>Beyond Games</h2>
        <p>
          Outside of game systems, I keep building smaller self-development
          projects to stay sharp on the web and backend side: web scrapers,
          image-search tools, automation scripts, and AI-powered
          applications. It&apos;s ongoing, hands-on practice with the same
          problem-solving habits &mdash; reading unfamiliar systems, breaking
          problems down, and shipping something that works.
        </p>
        <div className="badge-row">
          <span className="badge-emerald">Python</span>
          <span className="badge-emerald">Web Scraping</span>
          <span className="badge-emerald">Automation</span>
          <span className="badge-emerald">AI Apps</span>
        </div>
      </Reveal>
    </div>
  );
}
