import Link from "next/link"
import { cookies } from "next/headers"
import { getAuthFromCookies } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/models/User"
import UserPayment from "@/models/UserPayment"
import EventDetailsClient from "./EventDetailsClient"

// Event data mapping
const eventData: Record<
  string,
  {
    title: string
    description: string[]
    rounds: { name: string; description: string }[]
    venue: string
    dateTime: string
    rules: string[]
    coordinators: { name: string; phone: string }[]
    fileCode: string
  }
> = {
  "workshop-1": {
    title: "WORKSHOP 1",
    description: [
      "Venture into the unknown depths of emerging technology where reality bends and possibilities are limitless.",
      "This classified briefing will expose you to advanced systems that exist beyond conventional understanding.",
      "Only those brave enough to face the shadows of innovation will emerge with knowledge from the other side.",
    ],
    rounds: [
      { name: "Round 1", description: "Exploration Phase - Navigate the foundational concepts" },
      { name: "Round 2", description: "Final Showdown - Apply your knowledge in the ultimate test" },
    ],
    venue: "E-Block Lab 204",
    dateTime: "February 28, 2025 — 10:00 AM to 1:00 PM",
    rules: [
      "Participants must arrive 15 minutes before the scheduled time",
      "Bring your own laptop with required software pre-installed",
      "Team size: 2-3 members",
      "No external assistance or internet access during rounds",
    ],
    coordinators: [
      { name: "John Doe", phone: "9876543210" },
      { name: "Jane Doe", phone: "9876543211" },
    ],
    fileCode: "FILE-001",
  },
  "workshop-2": {
    title: "WORKSHOP 2",
    description: [
      "Explore the parallel dimensions of innovation where technology transcends its earthly limitations.",
      "Hands-on experiments with cutting-edge tools that blur the line between science and the supernatural.",
      "The veil between worlds grows thin as you master techniques from realms unknown.",
    ],
    rounds: [
      { name: "Round 1", description: "Discovery Phase - Uncover hidden technological secrets" },
      { name: "Round 2", description: "Implementation Phase - Build something extraordinary" },
    ],
    venue: "Tech Hub - Room 302",
    dateTime: "February 28, 2025 — 2:00 PM to 5:00 PM",
    rules: [
      "Individual participation only",
      "Basic programming knowledge required",
      "Materials will be provided on-site",
      "Certificates awarded to all participants",
    ],
    coordinators: [
      { name: "Mike Wheeler", phone: "9876543212" },
      { name: "Eleven", phone: "9876543213" },
    ],
    fileCode: "FILE-002",
  },
  "workshop-3": {
    title: "WORKSHOP 3",
    description: [
      "Unlock hidden potentials in the realm of tech where the impossible becomes inevitable.",
      "Secrets from the Upside Down revealed to those who dare to look beyond the surface.",
      "Transform your understanding of technology in ways that defy conventional explanation.",
    ],
    rounds: [
      { name: "Round 1", description: "Initiation - Enter the realm of advanced concepts" },
      { name: "Round 2", description: "Mastery - Prove your worth in the final challenge" },
    ],
    venue: "Innovation Center - Hall A",
    dateTime: "March 1, 2025 — 9:00 AM to 12:00 PM",
    rules: [
      "Pre-registration mandatory",
      "Bring government-issued ID for verification",
      "Limited seats available - first come, first served",
      "No photography or recording allowed",
    ],
    coordinators: [
      { name: "Dustin Henderson", phone: "9876543214" },
      { name: "Lucas Sinclair", phone: "9876543215" },
    ],
    fileCode: "FILE-003",
  },
  hackathon: {
    title: "HACKATHON",
    description: [
      "48 hours in the Upside Down. Build or be consumed by the void of infinite possibilities.",
      "Push the boundaries of creation as time warps around you in this ultimate coding challenge.",
      "Only the strongest minds will survive the darkness and emerge with solutions to save the world.",
    ],
    rounds: [
      { name: "Round 1", description: "Ideation Phase - Pitch your concept to the council" },
      { name: "Round 2", description: "Development Sprint - 24 hours of intense building" },
      { name: "Round 3", description: "Final Presentation - Showcase your creation" },
    ],
    venue: "Main Auditorium & Computer Labs",
    dateTime: "February 28-29, 2025 — 48 Hours Non-Stop",
    rules: [
      "Team size: 3-4 members",
      "Original work only - no pre-built solutions",
      "Must use at least one API from sponsors",
      "Sleeping bags and refreshments allowed",
      "Mentors available throughout the event",
    ],
    coordinators: [
      { name: "Steve Harrington", phone: "9876543216" },
      { name: "Nancy Wheeler", phone: "9876543217" },
    ],
    fileCode: "FILE-004",
  },
  codeathon: {
    title: "CODEATHON",
    description: [
      "Race against time in the shadow realm of algorithms where every second counts.",
      "Solve puzzles that twist reality and challenge your perception of what's possible.",
      "The clock ticks down as you navigate through increasingly complex challenges.",
    ],
    rounds: [
      { name: "Round 1", description: "Warm-up Challenges - Easy to Medium difficulty" },
      { name: "Round 2", description: "Final Battle - Hard problems only" },
    ],
    venue: "Computer Science Lab 101",
    dateTime: "March 1, 2025 — 2:00 PM to 6:00 PM",
    rules: [
      "Individual participation",
      "Languages allowed: C, C++, Java, Python",
      "Internet access prohibited during contest",
      "Plagiarism results in immediate disqualification",
    ],
    coordinators: [
      { name: "Robin Buckley", phone: "9876543218" },
      { name: "Eddie Munson", phone: "9876543219" },
    ],
    fileCode: "FILE-005",
  },
  "bot-lf": {
    title: "BOT LF",
    description: [
      "Line following automatons navigate the dark corridors of the Upside Down.",
      "Program your creation to sense the path through shadow and light.",
      "Only the most precise machines will find their way through the maze.",
    ],
    rounds: [
      { name: "Round 1", description: "Time Trials - Complete the track" },
      { name: "Round 2", description: "Final Race - Head-to-head competition" },
    ],
    venue: "Robotics Arena - Ground Floor",
    dateTime: "March 1, 2025 — 10:00 AM to 2:00 PM",
    rules: [
      "Bot dimensions: Max 20cm x 20cm",
      "Pre-built bots allowed",
      "Maximum 2 attempts per round",
      "No wireless controllers",
    ],
    coordinators: [
      { name: "Jonathan Byers", phone: "9876543220" },
      { name: "Argyle", phone: "9876543221" },
    ],
    fileCode: "FILE-006",
  },
  "bot-ba": {
    title: "BOT BA",
    description: [
      "Battle arena where machines clash in supernatural combat from another dimension.",
      "Build your warrior to dominate the arena and destroy all opposition.",
      "Only one will emerge victorious from the chaos of the Upside Down battleground.",
    ],
    rounds: [
      { name: "Round 1", description: "Qualifying Battles - Prove your bot's worth" },
      { name: "Round 2", description: "Semi-Finals - The survivors clash" },
      { name: "Round 3", description: "Grand Final - Champion crowned" },
    ],
    venue: "Robotics Arena - Ground Floor",
    dateTime: "March 1, 2025 — 3:00 PM to 7:00 PM",
    rules: [
      "Weight limit: 5kg maximum",
      "No projectiles or flammable materials",
      "Wireless control mandatory",
      "Safety inspection required before competition",
    ],
    coordinators: [
      { name: "Murray Bauman", phone: "9876543222" },
      { name: "Dmitri Antonov", phone: "9876543223" },
    ],
    fileCode: "FILE-007",
  },
  "design-event": {
    title: "DESIGN EVENT",
    description: [
      "Create visuals that transcend dimensions and bend reality to your artistic will.",
      "Channel the supernatural energy of the Upside Down into your designs.",
      "Show us visions that exist beyond the veil of ordinary perception.",
    ],
    rounds: [
      { name: "Round 1", description: "Theme Reveal - 2 hours to create" },
      { name: "Round 2", description: "Presentation - Defend your vision" },
    ],
    venue: "Design Studio - Block C",
    dateTime: "February 28, 2025 — 11:00 AM to 3:00 PM",
    rules: [
      "Software: Adobe Suite or Figma only",
      "Original artwork required",
      "Submit in PNG/PDF format",
      "Theme revealed at event start",
    ],
    coordinators: [
      { name: "Max Mayfield", phone: "9876543224" },
      { name: "Erica Sinclair", phone: "9876543225" },
    ],
    fileCode: "FILE-008",
  },
  quiz: {
    title: "QUIZ",
    description: [
      "Test your knowledge of the mysteries that lurk beyond ordinary understanding.",
      "Questions that probe the depths of technology, science, and the unknown.",
      "Only those with minds sharp as Demogorgon claws will prevail.",
    ],
    rounds: [
      { name: "Round 1", description: "Written Prelims - Top 20 qualify" },
      { name: "Round 2", description: "Buzzer Round - Quick-fire questions" },
      { name: "Round 3", description: "Final Showdown - The ultimate test" },
    ],
    venue: "Seminar Hall 2",
    dateTime: "March 1, 2025 — 11:00 AM to 1:00 PM",
    rules: [
      "Team size: 2 members",
      "No electronic devices allowed",
      "Questions in English only",
      "Judge's decision is final",
    ],
    coordinators: [
      { name: "Will Byers", phone: "9876543226" },
      { name: "Joyce Byers", phone: "9876543227" },
    ],
    fileCode: "FILE-009",
  },
  "non-tech-1": {
    title: "NON TECH 1",
    description: [
      "Activities from another dimension where technology takes a back seat.",
      "Challenge your mind and body in ways that defy conventional competition.",
      "The Upside Down has more mysteries than just circuits and code.",
    ],
    rounds: [
      { name: "Round 1", description: "Elimination Games" },
      { name: "Round 2", description: "Finals" },
    ],
    venue: "Open Air Theatre",
    dateTime: "February 28, 2025 — 4:00 PM to 6:00 PM",
    rules: ["Individual participation", "Comfortable clothing recommended", "Rules explained at venue", "Have fun!"],
    coordinators: [
      { name: "Hopper", phone: "9876543228" },
      { name: "Karen Wheeler", phone: "9876543229" },
    ],
    fileCode: "FILE-010",
  },
  "non-tech-2": {
    title: "NON TECH 2",
    description: [
      "More supernatural challenges await the brave souls who venture here.",
      "Leave your laptops behind and embrace the chaos of the unknown.",
      "Sometimes the greatest adventures require no technology at all.",
    ],
    rounds: [
      { name: "Round 1", description: "Team Challenges" },
      { name: "Round 2", description: "Individual Finals" },
    ],
    venue: "Sports Complex",
    dateTime: "March 1, 2025 — 4:00 PM to 6:00 PM",
    rules: ["Team size: 4 members", "Sportswear mandatory", "ID cards required", "Spirit of sportsmanship expected"],
    coordinators: [
      { name: "Bob Newby", phone: "9876543230" },
      { name: "Barb Holland", phone: "9876543231" },
    ],
    fileCode: "FILE-011",
  },
  tech: {
    title: "TECH",
    description: [
      "Technical challenges that push the boundaries of reality and possibility.",
      "Prove your mastery over machines and code in this ultimate test.",
      "The Upside Down rewards those who understand its technological secrets.",
    ],
    rounds: [
      { name: "Round 1", description: "Technical Quiz" },
      { name: "Round 2", description: "Hands-on Challenge" },
    ],
    venue: "Tech Hub - Main Hall",
    dateTime: "February 28, 2025 — 1:00 PM to 4:00 PM",
    rules: [
      "Individual participation",
      "Bring your own laptop",
      "Internet access provided",
      "Multiple domains covered",
    ],
    coordinators: [
      { name: "Dr. Brenner", phone: "9876543232" },
      { name: "Dr. Owens", phone: "9876543233" },
    ],
    fileCode: "FILE-012",
  },
  flagship: {
    title: "FLAGSHIP",
    description: [
      "The ultimate event. Face the Demogorgon of all challenges and emerge victorious.",
      "Every skill you possess will be tested in this legendary competition.",
      "Only the chosen ones will conquer the flagship and claim eternal glory.",
    ],
    rounds: [
      { name: "Round 1", description: "Qualifier - Survival of the fittest" },
      { name: "Round 2", description: "Semi-Final - The elite clash" },
      { name: "Round 3", description: "Grand Finale - Legend is born" },
    ],
    venue: "Main Auditorium",
    dateTime: "March 1, 2025 — All Day Event",
    rules: [
      "Team size: 3-5 members",
      "Multi-disciplinary challenges",
      "Surprise elements throughout",
      "Flagship trophy + cash prize for winners",
      "Registration closes 24 hours before event",
    ],
    coordinators: [
      { name: "Vecna", phone: "9876543234" },
      { name: "Mind Flayer", phone: "9876543235" },
    ],
    fileCode: "FILE-013",
  },
  "paper-presentation-1": {
    title: "PAPER PRESENTATION 1",
    description: [
      "Present your research findings from the depths of the unknown scientific frontier.",
      "Share discoveries that challenge conventional understanding of our world.",
      "The brightest minds gather to illuminate the darkness with knowledge.",
    ],
    rounds: [
      { name: "Round 1", description: "Abstract Submission Review" },
      { name: "Round 2", description: "Presentation & Q&A" },
    ],
    venue: "Conference Room - Block A",
    dateTime: "February 28, 2025 — 9:00 AM to 12:00 PM",
    rules: [
      "Team size: 1-2 members",
      "10 minutes presentation + 5 minutes Q&A",
      "PPT format only",
      "Original research preferred",
    ],
    coordinators: [
      { name: "Scott Clarke", phone: "9876543236" },
      { name: "Principal Coleman", phone: "9876543237" },
    ],
    fileCode: "FILE-014",
  },
  "paper-presentation-2": {
    title: "PAPER PRESENTATION 2",
    description: [
      "Share discoveries that defy conventional understanding and open new portals of thought.",
      "Your research could be the key to unlocking mysteries yet unsolved.",
      "Present to the council and change the course of technological history.",
    ],
    rounds: [
      { name: "Round 1", description: "Paper Screening" },
      { name: "Round 2", description: "Live Presentation" },
    ],
    venue: "Conference Room - Block B",
    dateTime: "March 1, 2025 — 9:00 AM to 12:00 PM",
    rules: [
      "IEEE format required",
      "Plagiarism check mandatory",
      "Domain: AI/ML, IoT, Cybersecurity",
      "Best paper award available",
    ],
    coordinators: [
      { name: "Alexei", phone: "9876543238" },
      { name: "Yuri", phone: "9876543239" },
    ],
    fileCode: "FILE-015",
  },
}

// Default event for unknown IDs
const defaultEvent = {
  title: "CLASSIFIED EVENT",
  description: [
    "This event file has been sealed by Hawkins National Laboratory.",
    "The contents remain classified until further notice from the Department.",
    "Unauthorized access will result in immediate termination of clearance.",
  ],
  rounds: [
    { name: "Round 1", description: "Information Redacted" },
    { name: "Round 2", description: "Information Redacted" },
  ],
  venue: "Location Classified",
  dateTime: "Date & Time TBD",
  rules: ["Clearance Level 4 required", "Non-disclosure agreement mandatory", "Await further instructions"],
  coordinators: [{ name: "Agent [REDACTED]", phone: "CLASSIFIED" }],
  fileCode: "FILE-XXX",
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = eventData[id] || defaultEvent

  // Server-side: Fetch session and user data using JWT
  const cookieStore = await cookies()
  const auth = getAuthFromCookies(cookieStore)
  let isRegistered = false
  let eventFeePaid = false
  const isAuthenticated = !!auth

  if (isAuthenticated && auth) {
    try {
      await connectDB()

      // Fetch user data by userId from JWT
      const user = await User.findById(auth.userId)
      
      if (user) {
        // Check if user is registered for this event
        isRegistered = user.eventsRegistered?.includes(id) || false

        // Fetch payment status
        const userPayment = await UserPayment.findOne({ userId: auth.userId })
        if (userPayment) {
          eventFeePaid = userPayment.eventFeePaid
        }
      }
    } catch (error) {
      console.error("[EventDetailsPage] Error fetching user data:", error)
      // Continue with default values on error
    }
  }

  return (
    <EventDetailsClient
      eventId={id}
      event={event}
      isRegistered={isRegistered}
      eventFeePaid={eventFeePaid}
      isAuthenticated={isAuthenticated}
    />
  )
}
