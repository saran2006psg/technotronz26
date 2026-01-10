"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FloatingParticles } from "./floating-particles"

export default function StrangerHero() {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    setMounted(true)

    const targetDate = new Date("February 28, 2025 00:00:00").getTime()

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center pt-24 pb-12 sm:pt-32 sm:pb-20">
      <div className="absolute top-4 left-0 right-0 sm:left-8 sm:right-auto z-50 flex flex-col items-center sm:items-start gap-2 w-full max-w-7xl px-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 sm:w-10 sm:h-10 bg-white/5 rounded-full p-1 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Image
              src="/images/psg-logo.png"
              alt="PSG College of Technology"
              width={40}
              height={40}
              className="object-contain filter brightness-110 contrast-125"
            />
          </div>
          <div className="relative w-7 h-7 sm:w-10 sm:h-10 bg-white/5 rounded-full p-1 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Image
              src="/images/iete-logo.png"
              alt="IETE Students' Chapter"
              width={40}
              height={40}
              className="object-contain filter brightness-110 contrast-125"
            />
          </div>
        </div>
        <div className="text-center sm:text-left space-y-0.5 max-w-[90%] mx-auto sm:mx-0">
          <p className="text-[8px] sm:text-[11px] font-bold tracking-[0.15em] sm:tracking-[0.2em] text-white/90 uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            PSG COLLEGE OF TECHNOLOGY
          </p>
          <p className="text-[7px] sm:text-[9px] font-medium tracking-[0.1em] sm:tracking-[0.15em] text-red-200/70 uppercase leading-tight sm:leading-relaxed max-w-[240px] sm:max-w-md drop-shadow-[0_0_5px_rgba(220,38,38,0.2)]">
            THE INSTITUTION OF ELECTRONICS AND TELECOMMUNICATION ENGINEERS (IETE) – STUDENTS’ CHAPTER
          </p>
        </div>
      </div>

      {/* Base dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0000] to-[#1a0505]" />

      {/* VHS Noise overlay */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-50 animate-grain bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noise%29%22%2F%3E%3C%2Fsvg%3E')]" />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-40 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]" />

      {/* Fog layers with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Far fog layer - slowest */}
        <div className="absolute inset-0 animate-fog-slow opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-950/20 to-transparent blur-3xl" />
        </div>

        {/* Mid fog layer */}
        <div className="absolute inset-0 animate-fog-mid opacity-20">
          <div className="absolute top-1/4 left-0 right-0 h-96 bg-gradient-to-r from-transparent via-red-900/30 to-transparent blur-[100px] transform -skew-y-2" />
        </div>

        {/* Near fog layer - fastest */}
        <div className="absolute inset-0 animate-fog-fast opacity-25">
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-red-950/40 via-red-950/20 to-transparent blur-2xl" />
        </div>

        <div className="absolute inset-0 animate-fog-drift opacity-15">
          <div className="absolute top-1/2 left-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-red-950/30 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-red-800/20 rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />
        </div>
      </div>

      {/* Floating particles */}
      {mounted && <FloatingParticles />}

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.9)_100%)] pointer-events-none z-30" />

      {/* Centered main content container with refined font scaling for mobile */}
      <div className="relative z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="relative mb-6 sm:mb-12 flex flex-col items-center w-full">
          <div className="relative w-full max-w-sm sm:max-w-3xl lg:max-w-5xl mx-auto">
            <span
              className="absolute inset-0 animate-glitch-1 text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-bold font-serif tracking-[0.15em] text-red-600 opacity-60 blur-[2px] select-none leading-none"
              aria-hidden="true"
            >
              TECHNOTRONZ
            </span>
            <span
              className="absolute inset-0 animate-glitch-2 text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-bold font-serif tracking-[0.15em] text-cyan-600 opacity-40 blur-[2px] select-none leading-none"
              aria-hidden="true"
            >
              TECHNOTRONZ
            </span>

            <h1 className="relative block text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-bold font-serif tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-800 animate-flicker drop-shadow-[0_0_20px_rgba(220,38,38,0.9)] leading-none py-2">
              TECHNOTRONZ
            </h1>
          </div>

          <p className="mt-6 sm:mt-10 md:mt-12 text-[9px] sm:text-sm md:text-base lg:text-lg font-light tracking-[0.2em] sm:tracking-[0.5em] text-red-100/90 uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] px-4 max-w-2xl mx-auto text-balance">
            A ZEALOUS INTERCOLLEGIATE SYMPOSIUM
          </p>

          <div className="absolute -inset-10 bg-red-600/5 blur-[80px] rounded-full animate-pulse-slow -z-10" />
        </div>

        {/* Simplified countdown grid for better mobile stacking */}
        <div className="mt-4 sm:mt-8 flex flex-col items-center gap-6 sm:gap-8">
          <p className="text-[9px] sm:text-[11px] font-bold tracking-[0.4em] text-red-500/80 uppercase animate-flicker">
            THE GATE OPENS IN
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-6 md:gap-8">
            {[
              { label: "DD", value: timeLeft.days },
              { label: "HH", value: timeLeft.hours },
              { label: "MM", value: timeLeft.minutes },
              { label: "SS", value: timeLeft.seconds },
            ].map((unit, i) => (
              <div key={unit.label} className="flex items-center gap-2 sm:gap-6 md:gap-8">
                <div className="flex flex-col items-center gap-3 group">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center bg-red-950/20 border border-red-900/40 rounded-lg backdrop-blur-md group-hover:border-red-600/60 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse-glow" />
                    <span className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[7px] sm:text-[10px] tracking-[0.2em] text-red-200/50 uppercase font-light">
                    {unit.label}
                  </span>
                </div>
                {i < 3 && (
                  <span className="text-lg sm:text-3xl md:text-4xl font-serif text-red-600/50 animate-flicker self-start mt-4 sm:mt-8 md:mt-10">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 sm:mt-16 lg:mt-20">
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center px-8 py-3 sm:px-14 sm:py-4 overflow-hidden rounded-full transition-all duration-500 active:scale-95 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)]"
          >
            <div className="absolute inset-0 rounded-full border-2 border-red-600/40 group-hover:border-red-500 transition-colors" />

            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />

            <span className="relative text-[10px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.25em] text-red-500 group-hover:text-red-400 uppercase transition-colors">
              Unlock the Mysteries
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom fog gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 bg-gradient-to-t from-red-950/20 to-transparent pointer-events-none" />
    </section>
  )
}
