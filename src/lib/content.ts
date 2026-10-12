/**
 * Every fact and every line of copy on the site.
 *
 * Sources: the v2 site (github.com/krishnasharma2212), the reel build notes in
 * D:/Basic/davinci/reel*\/PLAN.md, and Leadline's config/settings.yaml (the
 * offer and specialty wording Krishna already uses in outreach). Nothing here
 * is invented — where a number is unknown the field is left empty and the UI
 * hides it.
 */

export const site = {
  /** Canonical origin — www, no trailing slash. The apex 301s here (worker/apex.ts). */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.krishnasharma.online").replace(/\/$/, ""),
  version: "V3",
  year: 2026,
  /** Bump when the copy changes: the sitemap's lastmod and the pages' dateModified. */
  updated: "2026-10-12",
} as const;

export const profile = {
  name: "Krishna Sharma",
  first: "Krishna",
  location: "Noida, India",
  timezone: "Asia/Kolkata",
  tzLabel: "IST",
  email: "krishnasharma.active@gmail.com",
  whatsapp: "917906839138",
  phoneDisplay: "+91 79068 39138",
  resume: "/doc/KrishnaSharmaResume.pdf",
  links: {
    github: "https://github.com/krishnasharma2212",
    linkedin: "https://www.linkedin.com/in/krishnasharma2212",
    // Fill these in and they appear in the contact block and the credits.
    instagram: "",
    youtube: "",
  },
} as const;

/** The two playable classes. Everything class-specific hangs off these keys. */
export type Grade = "neutral" | "edit" | "code";

export const classes = {
  edit: {
    key: "edit" as const,
    player: "P1",
    word: "EDITOR",
    title: "The Editor",
    line: "Story-driven talking-head and educational edits for YouTube and Reels.",
    detail: "Pacing, B-roll, captions, motion graphics and sound — in the style your audience already knows.",
    href: "/edit",
    cta: "Enter the edit suite",
    attributes: [
      ["Weapon", "DaVinci Resolve Studio"],
      ["Special", "Motion graphics built in code"],
      ["Signature", "Captions timed to the word"],
    ],
  },
  code: {
    key: "code" as const,
    player: "P2",
    word: "ENGINEER",
    title: "The Engineer",
    line: "AI products that survive contact with users.",
    detail: "Agents, full-stack web apps and automations — TypeScript, Python, Go and C#, deployed and monitored.",
    href: "/code",
    cta: "Open the codebase",
    attributes: [
      ["Weapon", "TypeScript · Python"],
      ["Special", "Voice and WhatsApp agents"],
      ["Shipped", "50+ projects since 2021"],
    ],
  },
} as const;

// ───────────────────────────────────────────────────────────────── the editor

export type Beat = {
  id: string;
  /** Record frames, half-open, at the reel's fps. */
  from: number;
  to: number;
  line: string;
  visual: string;
};

export type Reel = {
  slug: string;
  title: string;
  series?: string;
  hook: string;
  /** Leadline ICP key, so outreach can link the closest sample. */
  format: "talking_head" | "educational" | "podcast" | "documentary" | "repurposing";
  formatLabel: string;
  niche: string;
  platform: "instagram" | "shorts" | "youtube" | "tiktok";
  language: string;
  fps: number;
  frames: number;
  delivery: string;
  /** Loudness and other measured facts from the delivery QC. */
  facts: { value: string; label: string }[];
  did: string[];
  tools: string[];
  beats: Beat[];
  /** Hex used for this reel's keyword captions — the card picks it up. */
  ink: string;
  year: number;
  /** When the final was delivered: the timestamp of the master export (ISO 8601, IST). */
  published: string;
};

export const reels: Reel[] = [
  {
    slug: "copilot-day-1",
    title: "Microsoft Copilot",
    series: "Day 1 / 30 · 30 useful AI tools",
    hook: "Tum AI ko sirf question poochne ke liye use karte ho?",
    format: "educational",
    formatLabel: "Talking-head explainer",
    niche: "Technology",
    platform: "instagram",
    language: "Hinglish, romanised captions",
    fps: 30,
    frames: 730,
    delivery: "4K vertical · 2160×3840",
    facts: [
      { value: "95", label: "sound effects placed" },
      { value: "8", label: "beats, each with its own visual" },
      { value: "−13.4", label: "LUFS integrated" },
    ],
    did: [
      "Cut the dead air out of a 27-second take, down to 24.3 seconds.",
      "Split-screen layout with the hair popping over the panel edge — a separate person matte.",
      "Music cued from 1.2 s into the track so its drop lands on the word “Copilot”.",
      "Hinglish speech captioned word by word, romanised as spoken.",
    ],
    tools: ["DaVinci Resolve Studio", "HTML + GSAP graphics", "Whisper", "RobustVideoMatting", "Lottie"],
    ink: "#d4f51c",
    year: 2026,
    published: "2026-10-05T20:07:44+05:30",
    beats: [
      { id: "B01", from: 0, to: 66, line: "Tum AI ko sirf question poochne…", visual: "Chat bubbles pop around the head" },
      { id: "B02", from: 66, to: 162, line: "Ye hai Day 1 of 30, 30 useful AI tools", visual: "Series card — DAY slot-roll, 01 slams in" },
      { id: "B03", from: 162, to: 262, line: "Aaj se main tumhe every single day…", visual: "Week calendar ticks, flips into a notification" },
      { id: "B04", from: 262, to: 335, line: "Imagine karo… professional email likhni hai", visual: "Envelope opens into a compose window — typed, deleted, “20 min later…”" },
      { id: "B05", from: 335, to: 499, line: "Tum is tool ko sirf apna rough idea do…", visual: "Rough idea typed → Copilot logo slam on the drop → the email writes itself" },
      { id: "B06", from: 499, to: 595, line: "Research, writing, brainstorming, everyday tasks", visual: "Four cards, one per word, each with a live mini-UI" },
      { id: "B07", from: 595, to: 682, line: "You can use it for a lot more than just chatting", visual: "Office apps arc in; “Just chatting” struck through" },
      { id: "B08", from: 682, to: 730, line: "And Day 2 ke liye follow karo", visual: "DAY 01 → 02 flip, follow tapped" },
    ],
  },
  {
    slug: "canva-ai-day-3",
    title: "Canva AI",
    series: "Day 3 / 30 · 30 useful AI tools",
    hook: "Design nahi aata? Ye AI tool tumhare liye bana dega.",
    format: "educational",
    formatLabel: "Talking-head explainer",
    niche: "Technology",
    platform: "instagram",
    language: "Hinglish speech, English captions",
    fps: 30,
    frames: 800,
    delivery: "4K vertical · 2160×3840",
    facts: [
      { value: "111", label: "sound effects placed" },
      { value: "7", label: "camera setups, framed to match" },
      { value: "−13.7", label: "LUFS integrated" },
    ],
    did: [
      "Seven camera setups in one take, re-framed from the measured face size so every angle matches.",
      "English captions for Hinglish speech — each word anchored to the spoken word it translates.",
      "Four generated posters resolve one by one, then the chosen one zooms into a working editor.",
      "Music cued from 3.18 s into the track so its drop lands as the panel falls.",
    ],
    tools: ["DaVinci Resolve Studio", "HTML + GSAP graphics", "Whisper", "RobustVideoMatting", "Lottie"],
    ink: "#d4f51c",
    year: 2026,
    published: "2026-10-05T23:07:30+05:30",
    beats: [
      { id: "B01", from: 0, to: 84, line: "Can't design? This AI tool designs it for you", visual: "A messy SALE!!! attempt is sucked away as the panel drops → a wall of 16 posters" },
      { id: "B02", from: 84, to: 188, line: "This is Day 3 of 30 days, 30 useful AI tools", visual: "Series card — DAY slot-roll, 03 slams in" },
      { id: "B03", from: 188, to: 246, line: "Say I want to make an Instagram post", visual: "Instagram new-post card, dashed 4:5 frame" },
      { id: "B04", from: 246, to: 299, line: "I just describe it", visual: "Prompt typed into Canva AI, cursor clicks Generate" },
      { id: "B05", from: 299, to: 378, line: "and Canva AI generates the design for me", visual: "Logo slam, four posters resolve, #2 picked with confetti" },
      { id: "B06", from: 378, to: 420, line: "Then I can edit it", visual: "Headline retyped, recoloured, a sticker dragged in" },
      { id: "B07", from: 420, to: 515, line: "So instead of starting from a blank page", visual: "The blank page is crumpled and thrown — on the word “page”" },
      { id: "B08", from: 515, to: 573, line: "go from idea straight to design", visual: "A bulb lights on “idea”, an arrow shoots to the finished poster" },
      { id: "B09", from: 573, to: 692, line: "For creators, students and small businesses…", visual: "Three use-case cards, one per word, then the workflow strip" },
      { id: "B10", from: 692, to: 760, line: "Tomorrow's tool is for writing and serious work", visual: "Day 04 teaser — a locked mystery tile" },
      { id: "B11", from: 760, to: 800, line: "Follow for Day 4", visual: "Follow card, DAY 03 → 04 flip" },
    ],
  },
  {
    slug: "three-secret-tools",
    title: "3 secret AI tools",
    series: "The AI toolkit · Vol. 07",
    hook: "Stop using ChatGPT for everything.",
    format: "educational",
    formatLabel: "Talking-head listicle",
    niche: "Technology",
    platform: "instagram",
    language: "English",
    fps: 30,
    frames: 617,
    delivery: "1080×1920 · 30 fps",
    facts: [
      { value: "5", label: "cuts, every word kept" },
      { value: "1", label: "real 3D model, rendered in Three.js" },
      { value: "−14", label: "LUFS, 2 dB true-peak headroom" },
    ],
    did: [
      "Five cuts, placed on the waveform — pauses tightened, no dialogue lost.",
      "A real, licensed 3D camera model, rendered in Three.js from wireframe to textured.",
      "Editorial type system — mono labels, orange accents, a progress bar per tool.",
      "Every graphic rendered from one deterministic HTML file, frame by frame.",
    ],
    tools: ["DaVinci Resolve Studio", "HTML renderer", "Three.js", "Whisper"],
    ink: "#ff793e",
    year: 2026,
    published: "2026-10-09T22:06:44+05:30",
    beats: [
      { id: "S1", from: 0, to: 58, line: "Stop using ChatGPT for everything", visual: "ONE AI. EVERYTHING? — an orange slash cuts under it" },
      { id: "S2", from: 58, to: 144, line: "Here are three secret tools that actually save you hours", visual: "“3 SECRET TOOLS.” with three category pills" },
      { id: "S3", from: 144, to: 186, line: "First one is Napkin AI", visual: "Chapter card — Tool 01" },
      { id: "S4", from: 186, to: 276, line: "It turns your boring text into instant stunning graphics", visual: "A text card tilts into a diagram; the flow line draws itself" },
      { id: "S5", from: 276, to: 324, line: "Second one is Tripo 3D", visual: "Chapter card — Tool 02" },
      { id: "S6", from: 324, to: 421, line: "It generates a 3D usable model from a single text prompt", visual: "The prompt types itself; a wireframe camera resolves into a textured model" },
      { id: "S7", from: 421, to: 462, line: "Third one is Upscayl", visual: "Chapter card — Tool 03" },
      { id: "S8", from: 462, to: 547, line: "It fixes the blurry image and makes it ultra HD", visual: "Low-res → HD wipe across a mountain photo" },
      { id: "S9", from: 547, to: 617, line: "Save this reel right now", visual: "Three end cards and a save button" },
    ],
  },
  {
    slug: "edit-with-one-prompt",
    title: "Edit videos with one prompt",
    hook: "Edit videos like this — with just 1 prompt.",
    format: "talking_head",
    formatLabel: "Talking-head hook reel",
    niche: "Technology",
    platform: "instagram",
    language: "English",
    fps: 30,
    frames: 387,
    delivery: "1080×1920 · 30 fps",
    facts: [
      { value: "12.9", label: "seconds, hook to CTA" },
      { value: "1", label: "comment-to-DM call to action" },
    ],
    did: [
      "Bold boxed captions with the keyword lifted on every line.",
      "Animated pills and an AI prompt box that types itself in.",
      "A comment-to-DM ending: “Comment PROMPT”, then the message notification lands.",
    ],
    tools: ["DaVinci Resolve Studio", "HTML + GSAP graphics", "Whisper"],
    ink: "#ffd21f",
    year: 2026,
    published: "2026-09-22T23:16:00+05:30",
    beats: [],
  },
];

export const services = [
  {
    n: "01",
    title: "Pacing that holds",
    body: "Dead air out, beats in. I cut to the sentence, not the second, so the slow parts stop feeling slow.",
  },
  {
    n: "02",
    title: "B-roll and cutaways",
    body: "I take the B-roll and cutaway work off your plate and keep the style your audience already knows.",
  },
  {
    n: "03",
    title: "Captions timed to the word",
    body: "Whisper transcripts, forced-aligned and checked by hand. Keywords lifted. Hinglish romanised or translated.",
  },
  {
    n: "04",
    title: "Motion graphics that explain",
    body: "UI mock-ups, logo slams, diagrams and 3D — built in code, so they stay sharp at 4K and change fast.",
  },
  {
    n: "05",
    title: "Sound you can feel",
    body: "A music drop that lands on the right word and an effect on every hit — 111 of them in one 26-second reel.",
  },
  {
    n: "06",
    title: "Delivered ready to post",
    body: "Graded master, loudness at −14 LUFS, a caption file and a cover frame. Nothing left for you to finish.",
  },
] as const;

export const workflow = [
  { n: "01", title: "Send the raw take", body: "A Drive link and one reel you love the feel of. That reference matters more than any brief." },
  { n: "02", title: "Beat map", body: "I transcribe, cut the dead air and give every beat a visual before the timeline is touched." },
  { n: "03", title: "First cut", body: "Graphics, captions, sound and grade, all in one pass — you watch a finished-looking edit." },
  { n: "04", title: "Notes", body: "Timestamped notes. Graphics live in code, so a change is a line, not a re-render from scratch." },
  { n: "05", title: "Delivery", body: "Master file, captions sidecar and cover. Same folder structure every time." },
] as const;

/** Questions clients ask before hiring an editor — every answer restates a fact from this file. */
export const editFaq = [
  {
    q: "What kind of videos do you edit?",
    a: "Talking-head and educational videos for YouTube and Instagram Reels: explainers, listicles, podcast clips and long-form cut down to shorts. Pacing, B-roll, captions, motion graphics and sound, in the style your audience already knows.",
  },
  {
    q: "Do you edit Hindi and Hinglish videos?",
    a: "Yes. English, Hindi and Hinglish — Hinglish speech can be captioned romanised, exactly as spoken, or translated into English, with every word timed to the frame it is said.",
  },
  {
    q: "What do I get at delivery?",
    a: "A graded master in 4K vertical or 16:9, loudness at −14 LUFS, an .srt caption file and a cover frame — ready to post, in the same folder structure every time.",
  },
  {
    q: "How do we start?",
    a: "Send one raw take (a Drive link is fine) and one reel you love the feel of, on WhatsApp or email. I'll tell you how I'd cut it. That reference matters more than any brief.",
  },
  {
    q: "How do revisions work?",
    a: "You watch a finished-looking first cut and send timestamped notes. Graphics are built in code, so a change is a line, not a re-render from scratch.",
  },
  {
    q: "Which software do you use?",
    a: "DaVinci Resolve Studio for the edit, colour, Fairlight sound and delivery; Whisper for word-level caption timing; RobustVideoMatting for hair pop-outs; HTML, GSAP and Three.js for motion graphics, rendered frame by frame.",
  },
  {
    q: "Where are you based, and do you work remotely?",
    a: "Noida, India (IST), working with creators worldwide. Everything happens remotely — raw footage in, finished files out.",
  },
  {
    q: "Can you also build the product I'm launching?",
    a: "Yes — I'm a full-stack developer too. For a launch I can build the product and cut the video that launches it.",
  },
] as const;

export const editToolkit = [
  { name: "DaVinci Resolve Studio", use: "Edit, colour, Fairlight, delivery" },
  { name: "Whisper", use: "Word-level timestamps for every caption" },
  { name: "RobustVideoMatting", use: "Person mattes for hair pop-outs" },
  { name: "HTML + GSAP", use: "Motion graphics, rendered frame by frame" },
  { name: "Three.js", use: "Real 3D models inside a reel" },
  { name: "Playwright + FFmpeg", use: "The renderer that turns pages into ProRes 4444" },
  { name: "Lottie", use: "Icon animation, timed to the frame" },
  { name: "Nano Banana · Veo", use: "Illustrations and B-roll when footage doesn't exist" },
] as const;

/** The exploded frame on /edit — Reel 3 (Julius AI), record frame 120. */
export const breakdown = {
  reel: "Julius AI",
  frame: 120,
  layers: [
    { file: "plate", track: "V1", name: "Speaker plate", note: "Re-framed from the 4K camera original, push-in rendered rather than keyframed." },
    { file: "panel", track: "V2", name: "Graphics panel", note: "An AI-generated mascot inside an HTML panel — the split-screen top half." },
    { file: "popout", track: "V3", name: "Hair pop-out", note: "Just the hair, matted out of the take, so it crosses over the panel edge." },
    { file: "fx", track: "V4", name: "FX", note: "The “LOOKS LIKE A JOKE” sticker slam and the emoji, on their own track." },
    { file: "captions", track: "V5", name: "Captions", note: "Word-timed from the transcript; the keyword turns lime on its frame." },
  ],
} as const;

// ─────────────────────────────────────────────────────────────── the engineer

export type Stage = { label: string; caption: string; src: string };

export type Project = {
  name: string;
  tagline: string;
  body: string;
  stack: string[];
  year: string;
  status?: string;
  live?: boolean;
  repo?: string;
  demo?: string;
  demoLabel?: string;
  featured?: boolean;
  shot?: { src: string; w: number; h: number; alt: string };
  stages?: Stage[];
  proof?: { value: string; label: string }[];
};

export const projects: Project[] = [
  {
    name: "cluemate",
    tagline: "A meeting copilot that listens, sees and answers in real time",
    body:
      "A frosted-glass overlay for Windows that hears your calls, transcribes speech, reads your screen and returns answers before the moment passes. WASAPI loopback audio, encrypted local keys, and no server in the middle — the whole pipeline runs on the user's machine.",
    stack: ["WinUI 3", ".NET 8", "C#", "WASAPI", "Whisper", "OpenAI", "Gemini"],
    year: "2026",
    status: "On the Microsoft Store",
    live: true,
    repo: "https://github.com/krishnasharma2212/cluemate",
    featured: true,
    shot: {
      src: "/work/cluemate.webp",
      w: 1200,
      h: 750,
      alt: "ClueMate's overlay sitting over a video call, showing live AI meeting notes beside the participants.",
    },
    proof: [
      { value: "0", label: "servers in the pipeline" },
      { value: "On-device", label: "transcription option" },
      { value: "MIT", label: "licensed, source public" },
    ],
  },
  {
    name: "coldwire",
    tagline: "An outbound engine that runs the whole cycle unattended",
    body:
      "Discovers prospects, qualifies them, generates personalised proof, places the call, and follows up — end to end, no operator. Three runtimes doing what each is best at: Go for the concurrent crawl, Python for the agents, Node for realtime voice.",
    stack: ["Go", "Python", "Node.js", "Voice AI", "Telephony", "LLM agents"],
    year: "2026",
    status: "Autonomous",
    live: true,
    repo: "https://github.com/krishnasharma2212/coldwire",
    featured: true,
    proof: [
      { value: "15,115", label: "businesses collected, 35 cities" },
      { value: "6", label: "stages, no operator" },
      { value: "≈$0.05", label: "per call minute" },
    ],
    stages: [
      { label: "Find", caption: "Crawls Google Maps and JustDial for businesses with no website. Name, trade, city, phone.", src: "/work/coldwire-1-discover.webp" },
      { label: "Build site", caption: "Generates a real sample site for the business before anyone has spoken to them.", src: "/work/coldwire-2-build-site.webp" },
      { label: "Record video", caption: "Records a walk-through of that sample so the proof arrives as something watchable.", src: "/work/coldwire-3-record-video.webp" },
      { label: "Call", caption: "Places the call and holds the conversation — Deepgram to text, GPT-4o-mini to reply, ElevenLabs to speak, Telnyx to carry it.", src: "/work/coldwire-4-call.webp" },
      { label: "Follow up", caption: "Sends the site and video on WhatsApp, but only after the owner said yes on the call.", src: "/work/coldwire-5-followup.webp" },
      { label: "Book & save", caption: "Books the callback and writes the whole run back to the record.", src: "/work/coldwire-6-summary.webp" },
    ],
  },
  {
    name: "salonflow",
    tagline: "Salons book on WhatsApp; owners run the business on the web",
    body:
      "Customers never leave the chat thread — they pick a service, see live availability and pay. Owners get schedules, staff, payments and subscriptions in a dashboard. Baileys for the WhatsApp side, Razorpay for money, an LLM for the parts that refuse to be a form.",
    stack: ["Flask", "PostgreSQL", "Baileys", "Razorpay", "OpenAI", "Python"],
    year: "2026",
    status: "Production",
    live: true,
    repo: "https://github.com/krishnasharma2212/salonflow",
    featured: true,
    shot: {
      src: "/work/salonflow-flow.svg",
      w: 1120,
      h: 500,
      alt: "Three steps: the owner sets up services and prices, links their salon WhatsApp number by scanning a QR code, and from then on the bot answers customers, checks availability, reserves a slot and confirms.",
    },
    proof: [
      { value: "2", label: "surfaces, one database" },
      { value: "0", label: "apps for the customer to install" },
      { value: "Razorpay", label: "payments, live" },
    ],
  },
  {
    name: "GuruMitra",
    tagline: "A voice-first teaching assistant for primary-school classrooms",
    body:
      "Teachers send a voice note and get back a classroom-ready fix: a short activity, a 15–30 second script to read aloud, and a management tip — while the lesson is still happening.",
    stack: ["WhatsApp bot", "Voice", "LLM", "Mobile"],
    year: "2026",
    repo: "https://github.com/krishnasharma2212/GuruMitra",
  },
  {
    name: "AI Document Chat",
    tagline: "Ask questions of your own documents",
    body: "Upload a file and hold a context-aware conversation with it. Firebase auth and persistent history, Gemini Pro doing the reading.",
    stack: ["Python", "Flask", "Firebase", "Gemini Pro"],
    year: "2025",
    status: "Live demo",
    live: true,
    repo: "https://github.com/krishnasharma2212/AI-Document-Chat",
    demo: "https://ai-document-chat.onrender.com/",
    demoLabel: "Live demo",
  },
  {
    name: "WhatsApp Chatbot Builder",
    tagline: "SaaS for teams that need chat flows without engineers",
    body: "A visual builder for automated WhatsApp flows, multi-tenant from the first commit — accounts, flows, message logs and delivery state.",
    stack: ["Node.js", "React", "PostgreSQL", "WhatsApp API"],
    year: "2025",
    status: "Private",
  },
  {
    name: "Quiz Generator",
    tagline: "Quizzes generated across any subject, on demand",
    body: "Give it a topic; it returns MCQs and true/false sets ready for a classroom. Flask backend, Gemini doing the question writing.",
    stack: ["Python", "Flask", "Gemini API"],
    year: "2025",
    repo: "https://github.com/krishnasharma2212/Quiz-Generator",
  },
  {
    name: "Library Management System",
    tagline: "Student and admin portals for a school library",
    body: "Catalogue, issue and return flows with a payment path built without a gateway API. The project that taught the fundamentals.",
    stack: ["PHP", "MySQL", "Bootstrap", "JavaScript"],
    year: "2023",
    status: "Archive",
    repo: "https://github.com/krishnasharma2212/Online-Library-Management-System-PHP",
  },
];

export const engineerStats = [
  { value: "4+", label: "years shipping" },
  { value: "50+", label: "projects delivered" },
  { value: "3", label: "products live in 2026" },
] as const;

export type Role = { title: string; company: string; from: string; to: string; points: string[] };

export const experience: Role[] = [
  {
    title: "Full Stack Developer",
    company: "Adiyog Tech LLP",
    from: "2024",
    to: "2025",
    points: [
      "Owned server logic in Node.js and React interfaces against PostgreSQL through Prisma.",
      "Held a weekly release cadence, catching bugs before they reached quality defence.",
      "Deployed on AWS across EC2 and S3, with CI/CD pipelines and production monitoring.",
    ],
  },
  {
    title: "Full Stack Developer",
    company: "SiCierto.com",
    from: "2023",
    to: "2024",
    points: [
      "Built responsive React frontends on a modern CSS foundation.",
      "Wrote the backend services, REST APIs and database layers underneath them.",
      "Worked across functions to take features from scoping to production support.",
    ],
  },
  {
    title: "Freelance Software Engineer",
    company: "Fiverr & Upwork",
    from: "2021",
    to: "2023",
    points: [
      "Delivered 50+ projects wearing every hat: APIs, React frontends, DevOps, database design.",
      "Built reusable scaffolds and automated deployments to stop repeating myself.",
      "Cut delivery time roughly 30% across repeat clients by automating the test path.",
    ],
  },
];

export type Tool = { name: string; where: string; key?: boolean };

export const stack: { label: string; items: Tool[] }[] = [
  {
    label: "Languages",
    items: [
      { name: "TypeScript", where: "WhatsApp Chatbot Builder · Adiyog Tech", key: true },
      { name: "Python", where: "salonflow · coldwire · AI Document Chat", key: true },
      { name: "C#", where: "cluemate", key: true },
      { name: "Go", where: "coldwire — the concurrent crawl", key: true },
      { name: "JavaScript", where: "Node services across every seat" },
      { name: "PHP", where: "Library Management System" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "React", where: "Adiyog Tech · SiCierto · Chatbot Builder", key: true },
      { name: "Next.js", where: "this site", key: true },
      { name: "WinUI 3", where: "cluemate's frosted overlay", key: true },
      { name: "Tailwind CSS", where: "this site" },
      { name: "GSAP", where: "this site, and every reel's graphics" },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js", where: "coldwire's realtime voice leg", key: true },
      { name: "Flask", where: "salonflow · AI Document Chat · Quiz Generator", key: true },
      { name: "Prisma ORM", where: "Adiyog Tech" },
      { name: ".NET 8", where: "cluemate" },
    ],
  },
  {
    label: "Data",
    items: [
      { name: "PostgreSQL", where: "salonflow · Adiyog Tech · Chatbot Builder", key: true },
      { name: "Firebase", where: "AI Document Chat — auth and history" },
      { name: "MySQL", where: "Library Management System" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "AWS — EC2, S3, Lambda", where: "Adiyog Tech, in production", key: true },
      { name: "CI/CD", where: "Adiyog Tech — weekly release cadence", key: true },
      { name: "Docker", where: "coldwire's three-runtime split" },
      { name: "GitHub Actions", where: "coldwire — CI on every push" },
    ],
  },
  {
    label: "AI",
    items: [
      { name: "OpenAI", where: "cluemate · coldwire · salonflow", key: true },
      { name: "Gemini", where: "cluemate · AI Document Chat · Quiz Generator", key: true },
      { name: "Whisper", where: "cluemate — on-device; every reel's captions", key: true },
      { name: "RAG", where: "AI Document Chat" },
    ],
  },
];

export const engineerServices = [
  { n: "01", title: "AI agents that do real work", body: "Voice agents, WhatsApp bots and outbound pipelines that run without an operator — with fallbacks for the afternoon a provider goes down." },
  { n: "02", title: "Full-stack products", body: "React and Next.js on the front, Node, Python or Go behind it, PostgreSQL underneath, deployed on AWS with CI from the first commit." },
  { n: "03", title: "Desktop and internal tools", body: "Native Windows apps in WinUI and .NET, and the scripts and dashboards that make a team stop doing things by hand." },
] as const;

export const education = [
  { degree: "Master of Computer Application", school: "GLA University, Mathura", period: "2021 — 2024" },
  { degree: "Bachelor of Science", school: "Dr. Bhimrao Ambedkar University, Agra", period: "2019 — 2021" },
] as const;

// ─────────────────────────────────────────────────────────────────── shared

export const nav = [
  { href: "/edit", label: "Edit", grade: "edit" as Grade },
  { href: "/code", label: "Code", grade: "code" as Grade },
  { href: "/#contact", label: "Contact", grade: "neutral" as Grade },
] as const;

export const whatsappLink = (text: string) =>
  `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(text)}`;

export const mailLink = (subject: string, body = "") =>
  `mailto:${profile.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
