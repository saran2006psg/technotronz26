"use client"

import { FloatingParticles } from "@/components/floating-particles"

export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Fog Layers */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 animate-fog-slow"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 20% 80%, rgba(127, 29, 29, 0.3) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 animate-fog-mid"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(153, 27, 27, 0.25) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 animate-fog-drift"
          style={{
            background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(127, 29, 29, 0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* VHS Grain Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] animate-grain"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Scanline Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-40 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)",
        }}
      />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Glitching Border Effect */}
      <div className="pointer-events-none fixed inset-0 z-30">
        <div className="absolute inset-0 border-2 border-red-900/20 animate-border-pulse" />
        <div className="absolute inset-2 border border-red-800/10 animate-flicker" />
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        {/* Section Title */}}
        <div className="text-center mb-8 sm:mb-12 animate-content-fade-in w-full">
          <h1
            className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-red-600 tracking-widest animate-flicker text-balance max-w-[90%] mx-auto"
            style={{
              textShadow:
                "0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.4), 0 0 80px rgba(220, 38, 38, 0.2)",
            }}
          >
            What Lies Beyond the Portal?
          </h1>

          {/* Glowing Animated Divider */}
          <div className="flex items-center justify-center mt-6 sm:mt-8">
            <div className="relative h-1 w-48 sm:w-64 md:w-80 overflow-hidden rounded-full">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-energy-beam"
                style={{
                  boxShadow: "0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 animate-energy-beam-delay" />
            </div>
          </div>
        </div>

        {/* Classified File Card */}
        <div
          className="relative max-w-3xl w-full animate-content-fade-in-delay group"
          style={{ animationDelay: "0.3s" }}
        >
          {/* Card Container */}
          <div
            className="relative bg-black/90 border border-red-900/50 rounded-sm p-5 sm:p-8 md:p-10 transition-all duration-500 hover:border-red-700/70 animate-border-pulse"
            style={{
              boxShadow: "0 0 30px rgba(127, 29, 29, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Scanline effect on card */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03] animate-scanline-scroll rounded-sm overflow-hidden"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)",
              }}
            />

            {/* Grain texture on card */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08] rounded-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* TOP SECRET Label */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
              <span
                className="inline-block px-2 py-1 text-[10px] sm:text-xs font-mono font-bold text-red-500 border border-red-800/60 bg-black/80 tracking-wider animate-flicker"
                style={{
                  textShadow: "0 0 8px rgba(220, 38, 38, 0.6)",
                }}
              >
                TOP SECRET // FILE 001
              </span>
            </div>

            {/* Content */}
            <div className="mt-8 sm:mt-10 space-y-5 sm:space-y-8">
              {/* About Paragraphs */}
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed font-sans text-pretty">
                <span className="text-red-500 font-semibold">Technotronz</span> is PSG Tech&apos;s annual
                intercollegiate symposium, born from curiosity and engineered in the shadows of innovation. Within these
                walls, technology bends, rules break, and the brave step forward to test their minds.
              </p>

              <p className="text-gray-400 text-sm sm:text-base md:text-lg leading-relaxed font-sans">
                We challenge you to dive deeper — decode the unexpected, confront the unknown, and experience
                competitions that push your limits.{" "}
                <span className="text-red-400 italic">The deeper you go, the stranger it becomes.</span>
              </p>

              {/* What Awaits You Section */}
              <div className="pt-4 sm:pt-6 border-t border-red-900/30">
                <h3
                  className="font-serif text-lg sm:text-xl md:text-2xl text-red-500 mb-4 tracking-wide"
                  style={{
                    textShadow: "0 0 10px rgba(220, 38, 38, 0.5)",
                  }}
                >
                  What Awaits You?
                </h3>

                <ul className="space-y-3">
                  {[
                    "Technical events forged in mystery",
                    "Workshops from another dimension",
                    "Challenges that distort logic",
                    "A portal only the curious dare to cross",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 text-gray-300 text-sm sm:text-base animate-list-item-fade"
                      style={{ animationDelay: `${0.5 + index * 0.15}s` }}
                    >
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full bg-red-600 animate-pulse-glow"
                        style={{
                          boxShadow: "0 0 8px rgba(220, 38, 38, 0.8), 0 0 16px rgba(220, 38, 38, 0.4)",
                        }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Corner Distress Marks */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-800/40 rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-800/40 rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-800/40 rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-800/40 rounded-br-sm" />
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-900/0 via-red-600/10 to-red-900/0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
        </div>

        {/* Back to Portal Button */}
        <div className="mt-8 sm:mt-14 animate-content-fade-in-delay" style={{ animationDelay: "0.6s" }}>
          <a
            href="/events"
            className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-5 text-sm sm:text-lg font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="absolute inset-0 rounded-lg bg-red-600/40 blur-lg group-hover:bg-red-500/60 transition-all duration-500 animate-pulse-slow" />
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-800 via-red-600 to-red-800 opacity-90" />
            <span className="absolute inset-[2px] rounded-md bg-gradient-to-b from-red-950 via-black to-red-950" />

            <span className="absolute inset-0 rounded-lg border-2 border-red-500 group-hover:border-red-400 transition-colors duration-300 animate-border-pulse" />

            <span
              className="relative z-10 flex items-center gap-2 text-red-100 group-hover:text-white transition-colors duration-300"
              style={{
                textShadow: "0 0 15px rgba(220, 38, 38, 0.9)",
              }}
            >
              <span>Unlock the Mysteries</span>
              <span className="text-red-400 group-hover:text-red-300 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </div>
      </div>
    </main>
  )
}
