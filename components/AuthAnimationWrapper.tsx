"use client";

import Particles from "@/components/Particles";

export default function AuthAnimationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">

      {/* Background animation ONLY for (auth) pages */}
      <div className="absolute inset-0 -z-10">
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={80}
          sizeRandomness={1}
          moveParticlesOnHover={true}
          alphaParticles={false}
        />
      </div>

      {/* Auth content */}
      <main className="relative z-10 flex items-center justify-center min-h-screen">
        {children}
      </main>
    </div>
  );
}
