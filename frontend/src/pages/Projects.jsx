export default function Projects() {
  return (
    <div className="container">
      <h1>Projects</h1>

      <div className="box">
        <h2>Möbius Fish (UE5 3D Water-Based Tower Defense Roguelike)</h2>
        <p>Unreal Engine 5, C++, State Tree, Physics Simulation, Firebase</p>
        <p>
          Core C++ systems engineering for a 3D top down tower defense game
          featuring dynamic fluid dynamics, custom boat buoyancy, and
          multi priority AI enemies.
        </p>
        <ul>
          <li>
            Boat rolling: past 30° the roll is smoothly corrected back into
            range every frame with FMath::Lerp, instead of a hard snap.
          </li>
          <li>
            Auto-right if flipped: dot product between the boat&apos;s up
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
            Player-contact detection used to fail because Blueprint cached
            stale actor tags; switched to IsA(BoatClass) checks instead.
          </li>
          <li>
            Jumper fish kept jumping away from the boat: the math was right,
            the mesh just faced backwards. Fixed by disabling
            bOrientRotationToMovement during the jump and rotating the mesh
            180° in Blueprint.
          </li>
          <li>
            Evaluated Mass State Tree for performance but it&apos;s
            incompatible with ACharacter, animations, and Blueprint
            subclasses, so stayed with regular State Tree.
          </li>
        </ul>
      </div>

      <div className="box">
        <h2>Radswing (Fast-Paced First-Person Kick Fighter)</h2>
        <p>Unity, C#, Physics Mechanics, AI Behavior</p>
        <p>
          A first person kick fighter: walk, run, slide, double jump, and
          kick (F) to knock enemies back, the faster you&apos;re moving, the
          harder the kick hits. Three enemy types: Melee (chases and
          punches), Range (shoots from afar), and Tank (slow, heavy, takes
          many kicks to kill).
        </p>
        <ul>
          <li>
            NavMesh snapback: after a kick knockback, enemies teleported back
            onto their path. Fixed with
            navAgent.Warp(transform.position) when re-enabling the NavMesh
            agent, so it starts from where the enemy actually is.
          </li>
          <li>
            Hit animations stuck on loop from a Bool parameter that needed
            manual resetting. Switched to a Trigger parameter, which fires
            once and resets itself.
          </li>
        </ul>
      </div>

      <div className="box">
        <h2>FFT Ocean Wave Generator</h2>
        <p>C++, Fast Fourier Transform, Phillips Spectrum, 3D Mesh Export</p>
        <p>
          Simulates realistic ocean waves using FFT and the Phillips
          spectrum, exporting the results as animated 3D meshes for Blender.
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
            Exported results as OBJ files (vertex positions, normals, faces)
            and combined them into an animation sequence in Blender.
          </li>
        </ul>
      </div>
    </div>
  );
}
