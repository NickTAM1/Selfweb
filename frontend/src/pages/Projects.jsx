import { useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

const FILTERS = ["All", "UE5", "Unity", "Graphics", "Tools", "Web"];

// Exported so Home.jsx can derive the "SHIPPED PROJECTS" stat from
// PROJECTS.length instead of a hardcoded number that goes stale. This is a
// plain data array, not a component, so it's exempt from the fast-refresh
// component-only-exports rule.
// eslint-disable-next-line react-refresh/only-export-components
export const PROJECTS = [
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
      { type: "image", src: "/Selfweb/media/mobius-menu.png", label: "Main Menu" },
      { type: "image", src: "/Selfweb/media/mobius-level-1.jpg", label: "Level 1 Gameplay" },
      { type: "image", src: "/Selfweb/media/mobius-level-3.jpg", label: "Level 3 Combat" },
      { type: "image", src: "/Selfweb/media/mobius-level-4.jpg", label: "Level 4 Combat" },
      { type: "image", src: "/Selfweb/media/mobius-boat-closeup.jpg", label: "Boat Buoyancy Close-up" },
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
      "Chose the Phillips spectrum over JONSWAP for its longer track record of published verification on a solo, time-boxed project",
      "Exported animated OBJ sequences (positions, normals, faces) that composite into an animation in Blender, no plugins required",
    ],
    detail: (
      <details className="deep-dive">
        <summary>Engineering deep-dive</summary>
        <div className="deep-dive-body">
          <p>
            <strong>Problem:</strong> wave generation is a key feature in
            games and film, but true fluid-dynamics simulation is too
            computationally expensive to run in real time on ordinary
            hardware. The goal was a realistic, animatable ocean surface
            without a full fluid solver, and without requiring the end user
            to own high-spec equipment.
          </p>

          <p className="deep-dive-subhead">
            <strong>Key decisions</strong>
          </p>
          <ul>
            <li>
              <strong>Phillips spectrum over JONSWAP.</strong> JONSWAP is
              built from real North Sea wave observation data and is the
              more modern choice in recent research, but Phillips spectrum
              has been in use since 2003 and has a longer track record of
              published verification, which mattered more for a solo,
              time-boxed project than using the newest method.
            </li>
            <li>
              <strong>FFT/IFFT over direct spatial summation.</strong>{" "}
              Direct summation of the wave field is O(N⁴) and unusable in
              real time. A Radix-2 Cooley-Tukey IFFT over a bit-reversed
              butterfly diagram brings that down to O(N log N), which is
              what makes generating a full heightmap per frame practical at
              all.
            </li>
            <li>
              <strong>Offline OBJ export over a live in-engine solver.</strong>{" "}
              Building a real-time GPU solver was outside the scope and
              hardware constraints of a solo project, so the tool exports
              animated OBJ mesh sequences that get composited into an
              animation in Blender afterward. That traded real-time
              interactivity for something that reliably works on ordinary
              hardware and any standard 3D package, no plugins required.
            </li>
          </ul>

          <p>
            <strong>Result:</strong> the generator successfully produces 3D
            animated ocean wave meshes that import cleanly into standard 3D
            software with no plugins, on ordinary hardware. It reports real
            per-frame output at runtime, confirmed empirically rather than
            just visually, e.g. a console run reported "Max Displacement =
            0.94244" at t = 0.
          </p>
          <p>
            <strong>Honest limitation / what&apos;s next:</strong> given
            more time, the next steps would be moving to the JONSWAP
            spectrum for more accurate real-world grounding, porting the
            generation to GPU compute for real-time speed (it currently runs
            offline / pre-baked, not live), and generating the animation
            directly instead of manually compositing OBJ sequences in
            Blender afterward.
          </p>

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

          <details className="code-viewer panel">
            <summary>View IFFT butterfly step (illustrative, reconstructed)</summary>
            <pre>{`// IFFT butterfly step (illustrative, reconstructed)
// A0 = (B0 + B1) * 0.5      -- FFT butterfly combine
// A1 = (B0 - B1) * 0.5
// B0 = (A0 + A1)            -- IFFT butterfly combine
// B1 = (A0 - A1)
double Trager0 = (inputR1 + X * inputR2 + Y * inputI2) * 0.5;
double Trager1 = (inputI1 - Y * inputR2 + X * inputI2) * 0.5;`}</pre>
          </details>
        </div>
      </details>
    ),
  },
  {
    id: "unreal-devtool",
    category: "Tools",
    categoryLabel: "RUST // DEV TOOLING",
    title: "Unreal DevTool",
    summary:
      "A Windows desktop app that consolidates UE5 packaging, VS project regeneration, Git management, and build diagnostics into a single GUI, with a local-LLM chat assistant built in.",
    badges: ["Rust", "egui", "Unreal Engine 5", "Git Automation", "Local LLM"],
    media: [
      { type: "video", src: "/Selfweb/media/unrealdevtool-demo.mp4", label: "Live Demo" },
      {
        type: "image",
        src: "/Selfweb/media/unrealdevtool-1.jpg",
        label: "Dashboard",
      },
      {
        type: "image",
        src: "/Selfweb/media/unrealdevtool-2.jpg",
        label: "Package",
      },
      {
        type: "image",
        src: "/Selfweb/media/unrealdevtool-3.jpg",
        label: "Git",
      },
      {
        type: "image",
        src: "/Selfweb/media/unrealdevtool-4.jpg",
        label: "Chat",
      },
    ],
    highlights: [
      "Automated fix for a real UE5 UAT/UBT bug -- spaces in file paths -- via NTFS directory junctions",
      "Built-in AI chat assistant that auto-detects local Ollama/LM Studio servers",
      "One tool for packaging, Git, and build diagnostics, self-updating via GitHub Actions releases",
    ],
    detail: (
      <details className="deep-dive">
        <summary>Engineering deep-dive</summary>
        <div className="deep-dive-body">
          <p>
            <strong>Problem:</strong> UE5 developers juggle several
            disconnected tools and manual steps: regenerating Visual Studio
            project files, manually tracking build versions and packaging,
            running Git operations, and hunting through build logs when
            something breaks, with no single place to see project health or
            get unblocked.
          </p>

          <p className="deep-dive-subhead">
            <strong>Key decisions</strong>
          </p>
          <ul>
            <li>
              <strong>Rust + egui for the UI.</strong> A deliberate choice to
              learn a systems language and an immediate-mode GUI framework
              rather than staying in a comfort-zone stack.
            </li>
            <li>
              <strong>NTFS directory junctions to solve the UAT/UBT
              spaces-in-path build failure.</strong> Unreal&apos;s build
              tooling has a real, documented limitation where file paths
              containing spaces cause build failures. Instead of just telling
              users to avoid spaces in their folder names, the tool
              automatically creates space-free NTFS directory junctions as
              path aliases so the build system never sees the problematic
              path.
            </li>
            <li>
              <strong>Local-LLM chat (Ollama/LM Studio auto-detection) over a
              cloud AI API.</strong> Keeps the assistant free and usable
              offline for anyone running the tool, at the cost of needing a
              local model server running.
            </li>
          </ul>

          <p>
            <strong>Result:</strong> ships as a self-updating ~75MB Windows
            executable (bundling rclone for its Google Drive-based
            distribution), with GitHub Actions automating release builds and
            the app checking for updates on startup and every 5 minutes
            after, replacing itself in place. MIT licensed.
          </p>
          <p>
            <strong>Honest note:</strong> this was my first real project in
            Rust, and my first time writing PowerShell/cmd automation and
            working with Unreal&apos;s UAT/UBT internals closely enough to
            work around one of its real bugs. A deliberate stretch, not a
            comfort-zone project.
          </p>

          <div className="project-actions">
            <a
              className="btn-glass"
              href="https://github.com/HUKLIA/UnrealDevtool"
              target="_blank"
              rel="noreferrer"
            >
              View Source on GitHub
            </a>
          </div>
        </div>
      </details>
    ),
  },
  {
    id: "shopping-mall",
    category: "Web",
    categoryLabel: "PHP // FULL-STACK WEB",
    title: "Shopping Mall",
    summary:
      "\"Mobile Shop\": an online shopping platform for smartphones across four brands (Samsung, Sony, Huawei, Xiaomi), built with two teammates for a university systems course. User auth, a brand-filtered product catalog with image uploads, a shopping cart, and purchase order tracking.",
    badges: ["PHP", "Laravel", "MySQL", "Vue 2", "Bootstrap"],
    media: [
      { type: "image", src: "/Selfweb/media/shoppingmall-1.jpg", label: "Storefront (guest view)" },
      { type: "image", src: "/Selfweb/media/shoppingmall-2.jpg", label: "Storefront (logged in)" },
      { type: "image", src: "/Selfweb/media/shoppingmall-3.jpg", label: "Product Detail" },
      { type: "image", src: "/Selfweb/media/shoppingmall-4.jpg", label: "Purchase Orders" },
    ],
    highlights: [
      "21 defined requirements across catalog, accounts, cart, and order tracking, built and demoed as a 3-person team",
      "Brand-filtered product catalog (Samsung, Sony, Huawei, Xiaomi) with an admin-managed image upload flow",
      "Shopping cart and purchase order tracking with order status (Pending/Hold) visible to the customer",
    ],
    detail: (
      <details className="deep-dive">
        <summary>Engineering deep-dive</summary>
        <div className="deep-dive-body">
          <p>
            &quot;Mobile Shop&quot; was a 3-person team project for COMP321
            (Information System Implementation), a university course on
            information system design and delivery. Working with two
            teammates, I helped build an online shopping platform for
            smartphones across four brands, Samsung, Sony, Huawei, and
            Xiaomi, covering 21 defined requirements across six areas:
            product listing, customer accounts, the shopping cart, purchase
            order tracking, catalog maintenance, and order processing, the
            features you can see across the screenshots below (brand
            filtering on the storefront, a logged-in customer view with
            pricing, a product detail page with an Add to Cart flow, and
            purchase order history with Pending/Hold status tracking).
          </p>
          <p>
            The version submitted for the course ran on WampServer locally
            with PHP, MySQL, and phpMyAdmin for schema/data management. The
            codebase itself is a Laravel 8 app: Auth, Cart, Product, and Home
            controllers; Product, Cart, CartItem, File, and User models;
            Blade templates for the storefront, cart, and admin views; and
            frontend assets (JS/CSS/Sass) compiled through Laravel Mix with a
            Vue 2-driven frontend.
          </p>
          <p>
            <strong>Stack:</strong> PHP 7.3+/8.0, Laravel 8, MySQL,
            phpMyAdmin, WampServer (local dev), Laravel Mix, Sass, Bootstrap
            4, Vue 2.
          </p>

          <details className="code-viewer panel">
            <summary>View product upload handler (real source)</summary>
            <pre>{`// Real source: app/Http/Controllers/ProductController.php
public function add() {
    $file = Request::file('file');
    $extension = $file->getClientOriginalExtension();
    Storage::disk('local')->put($file->getFilename().'.'.$extension,  File::get($file));

    $entry = new \\App\\File();
    $entry->mime = $file->getClientMimeType();
    $entry->original_filename = $file->getClientOriginalName();
    $entry->filename = $file->getFilename().'.'.$extension;

    $entry->save();

    $product  = new Product();
    $product->file_id=$entry->id;
    $product->name =Request::input('name');
    $product->description =Request::input('description');
    $product->price =Request::input('price');
    $product->imageurl =Request::input('imageurl');

    $product->save();

    return redirect('/admin/products');
}`}</pre>
          </details>
        </div>
      </details>
    ),
  },
];

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const triggerRefs = useRef({});

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProjects = PROJECTS.filter((project) => {
    const matchesFilter = filter === "All" || project.category === filter;
    const searchableText = [
      project.title,
      project.summary,
      project.categoryLabel,
      ...project.badges,
    ]
      .join(" ")
      .toLowerCase();
    return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
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
    <div className="container page-container projects-container">
      <div className="page-intro">
        <span className="mono-label accent">WORKLOG // 02</span>
        <h1>Projects</h1>
      <p>
        Möbius Fish, the FFT generator, and Unreal DevTool have real capture
        footage; Radswing and Shopping Mall are placeholders until clips are
        added. Tap a project for the full engineering breakdown.
        </p>
      </div>

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

      <div className="project-discovery-controls">
        <div className="project-search-wrap">
          <label className="sr-only" htmlFor="project-search">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            placeholder="Search systems, tools, stacks..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="project-search-clear"
              aria-label="Clear project search"
              onClick={() => setQuery("")}
            >
              &times;
            </button>
          ) : null}
        </div>
        <p className="project-result-summary" aria-live="polite">
          {visibleProjects.length} of {PROJECTS.length} case studies visible
        </p>
      </div>

      <div className="project-grid">
        {visibleProjects.map((project, i) => (
          <Reveal
            key={project.id}
            className="box project-card-compact"
            index={i}
            onClick={() => openProject(project.id)}
          >
            <div className="project-card-topline">
              <span className="project-index">{String(i + 1).padStart(2, "0")}</span>
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
            <div className="project-card-footer">
              <span className="mono-label">CASE STUDY</span>
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
            </div>
          </Reveal>
        ))}
      </div>

      {visibleProjects.length === 0 ? (
        <div className="project-empty-state" role="status">
          <span className="mono-label accent">NO_MATCH_FOUND</span>
          <h2>Nothing fits that query yet.</h2>
          <p>Try a project title, technology, or a broader category.</p>
          <button
            type="button"
            className="btn-glass"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
          >
            Reset discovery
          </button>
        </div>
      ) : null}

      <Reveal className="box beyond-games" index={visibleProjects.length}>
        <div className="section-heading-row">
          <div>
            <span className="mono-label accent">EXPLORATION_NODE</span>
            <h2>Beyond Games</h2>
          </div>
          <span className="section-count">SIDE PROJECTS</span>
        </div>
        <p className="section-intro">
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
