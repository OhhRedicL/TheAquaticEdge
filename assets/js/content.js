/* =====================================================================
   SITE CONTENT — edit this file to update the website.
   ---------------------------------------------------------------------
   • SITE      → your name, contact info, social / podcast links
   • POSTS     → blog posts. Use category "development" for the
                 Professional Development blog, or "leadership" for the
                 Lifeguard → Leadership Track.
   • EPISODES  → podcast episodes (newest first)

   To publish a new post: copy one of the post objects below, paste it
   at the TOP of the POSTS list, change the fields, and save. The post
   gets its own page automatically at  post.html?slug=your-slug

   Post bodies use simple Markdown:
     ## Heading         ### Smaller heading
     **bold**  *italic*  [link text](https://...)
     - bullet item      1. numbered item
     > quote
   Leave a blank line between paragraphs.
   ===================================================================== */

window.SITE = {
  brand: "Laboy Aquatics Co",
  tagline: "Your Edge in Aquatics Leadership",
  ownerName: "Jordan Laboy",            // ← shown in the About section, podcast, and article bylines
  podcastName: "The Aquatic Edge Podcast",
  email: "hello@laboyaquatics.com",     // ← your public contact email
  location: "Based in Southwest Florida · Available nationwide",
  formEndpoint: "",                     // ← optional: Formspree/Getform URL. Blank = opens the visitor's email app.
  links: {
    apple: "#",
    spotify: "#",
    youtube: "#",
    instagram: "#",
    linkedin: "#",
    tiktok: "#"
  },
  podcastEmbed: "",                     // ← optional: paste a Spotify/Apple/YouTube embed URL for the featured player
  droneVideo: "",                       // ← optional: real drone footage, e.g. "assets/video/waterpark.mp4".
                                        //   Blank = the animated simulated waterpark flyover plays instead.
  droneVideoPoster: ""                  // ← optional: still image shown while the video loads
};

window.POSTS = [
  /* ---------------- LEADERSHIP TRACK ---------------- */
  {
    slug: "from-lifeguard-to-head-guard",
    title: "From the Stand to the Clipboard: Your First 90 Days as a Head Guard",
    category: "leadership",
    date: "2026-11-10",
    readTime: 6,
    tags: ["Head Guard", "First-time leaders"],
    excerpt: "Yesterday you were rotating with your friends. Today you're running the rotation. Here's how to earn trust fast without losing who you are.",
    body: `
The hardest promotion in aquatics is the first one. Yesterday you were one of the guards. Today you're the person who tells them when to rotate, when to put the phone away, and when they've missed a scan. Nothing about your swim test prepared you for that.

## Days 1–30: Listen more than you talk

Your team already has opinions about how things *should* run. Learn them before you change anything.

- Ask each guard one question: "What's one thing that would make your shift better?"
- Work at least one full rotation on every stand. You'll learn where the blind spots and the sun glare really are.
- Write down every problem you notice, but don't fix them all at once.

## Days 31–60: Set the standard, then model it

People follow what you do, not what you post in the group chat.

- Be the first one in uniform and on deck.
- Correct in private, praise in public, every time.
- Pick **one** standard to tighten (scanning posture, rotation timing, radio etiquette) and hold it consistently.

## Days 61–90: Develop someone else

You're not a real leader until you're growing the next one. Find the guard who's always early, always sharp, and start giving them small responsibilities: running a pre-shift briefing, leading an in-service drill, shadowing you on an incident report.

> Leadership isn't the title on your shirt. It's what your team does when you're on break.

## Your 90-day checklist

1. Have a one-on-one conversation with every guard on your team.
2. Run at least two in-service drills yourself.
3. Complete one incident report review with your supervisor.
4. Identify your future replacement.
`
  },
  {
    slug: "running-a-pre-shift-briefing",
    title: "How to Run a 5-Minute Pre-Shift Briefing That Actually Works",
    category: "leadership",
    date: "2026-10-28",
    readTime: 4,
    tags: ["Supervisor skills", "Communication"],
    excerpt: "The pre-shift briefing sets the tone for the whole day. Here's a simple structure that keeps it short, focused, and worth showing up for.",
    body: `
A good pre-shift briefing is short, predictable, and useful. A bad one is a lecture nobody remembers by the first rotation. Use this five-part structure and keep it under five minutes.

## The S.H.I.F.T. briefing

- **S — Status:** Weather, attendance forecast, any closed attractions or chemical issues.
- **H — Hazards:** What's different today? New staff, special events, a slide that's been glitchy.
- **I — Incidents:** Quick recap of anything notable from yesterday, with no names and no blame.
- **F — Focus:** One skill or standard to sharpen today (example: "10/20 scanning on the wave pool").
- **T — Thanks:** Recognize someone specific for something specific.

## Tips from the deck

1. Stand where everyone can see you, with the sun at *your* back and not theirs.
2. Ask one quick question to check understanding.
3. End on time. Your guards will respect you more for it.

> Consistency builds trust. If your briefing looks the same every day, your team knows what to expect from you.
`
  },
  {
    slug: "handling-conflict-on-deck",
    title: "Handling Conflict on Deck: Coaching Your Former Peers",
    category: "leadership",
    date: "2026-10-12",
    readTime: 5,
    tags: ["Supervisor skills", "Coaching"],
    excerpt: "Correcting a friend is uncomfortable. Avoiding it is dangerous. A simple framework for honest, respectful coaching conversations.",
    body: `
Every new supervisor hits this moment: a friend you used to guard alongside is slipping. Maybe they're late to rotate, maybe their scanning is lazy, maybe their phone keeps coming out. Ignoring it isn't kindness. In our industry it's a risk to people's lives.

## Use the S.B.I. model

- **Situation:** "During the 2:00 rotation on the lazy river..."
- **Behavior:** "...I saw you facing the deck talking to a patron for about two minutes..."
- **Impact:** "...which left your zone unscanned. If something had happened, we'd both be explaining that to a family."

Then **stop talking** and let them respond.

## What to avoid

- Coaching in front of patrons or other guards
- Saying "everyone has noticed." Speak for yourself.
- Letting the conversation become about your friendship instead of the standard

## Close the loop

End every coaching conversation with a clear expectation and a follow-up: "Going forward I need eyes on the water 100% of the time on stand. I'll check in with you after your next shift." Then actually check in, and recognize the improvement when you see it.
`
  },

  /* ---------------- PROFESSIONAL DEVELOPMENT ---------------- */
  {
    slug: "risk-management-is-a-culture",
    title: "Risk Management Isn't a Binder. It's a Culture",
    category: "development",
    date: "2026-11-03",
    readTime: 5,
    tags: ["Risk Management", "Operations"],
    excerpt: "The emergency action plan on your shelf doesn't protect anyone. The people who know it by heart do. How to make safety part of daily operations.",
    body: `
Every facility has an Emergency Action Plan. Far fewer have a team that could execute it at 4:45 PM on a 98-degree Saturday with a full wave pool. The difference between those two things is culture.

## Signs your risk program is just paperwork

- Staff can't tell you where the AED is without looking
- Drills only happen when an auditor is coming
- Incident reports get filed but never reviewed
- "That's how we've always done it" is an acceptable answer

## Building a culture of readiness

1. **Drill small and often.** Ten-minute scenario drills every shift beat a two-hour training once a month.
2. **Debrief everything.** Real rescues, near-misses, and drills all get a quick "what went well, what would we change?"
3. **Make reporting safe.** Staff who report near-misses should be thanked, not punished.
4. **Lead from the front.** When directors and managers jump into drills, the team takes them seriously.

## The paramedic perspective

In EMS we say you don't rise to the occasion, you fall to the level of your training. The same is true on a pool deck. Your guards will do in an emergency exactly what they've practiced, nothing more.

> Safety isn't a department. It's a decision everyone makes, every shift.
`
  },
  {
    slug: "building-an-in-service-program",
    title: "Building an In-Service Program Your Staff Looks Forward To",
    category: "development",
    date: "2026-10-20",
    readTime: 6,
    tags: ["Training", "Staff development"],
    excerpt: "In-services don't have to be the most dreaded hour of the week. Practical ways to make ongoing training engaging, realistic, and effective.",
    body: `
In-service training is where good aquatics teams become great ones. It's also where a lot of programs lose their staff's attention. Here's how to turn it around.

## Make it realistic

- Use real water, real equipment, and real attractions, not just the shallow end
- Run scenarios in uniform with whistles, radios, and full EAP activation
- Add realistic stressors: noise, crowds of "patrons," and multiple victims

## Make it short and frequent

Instead of a two-hour block every month, try 20–30 minutes weekly. Skills stay sharper, and staff stay engaged.

## Make it theirs

1. Let senior guards design and lead a scenario
2. Rotate topics so they cover rescue skills, customer service, communication, and first aid
3. Recognize standout performance publicly

## Track it

Document attendance, skills performed, and areas for improvement. That record protects your facility and gives you real data to coach from.

> If your staff only trains when they're being evaluated, you're testing, not training.
`
  },
  {
    slug: "why-aquatics-needs-leaders",
    title: "Why the Aquatics Industry Needs More Leaders, Not More Managers",
    category: "development",
    date: "2026-10-05",
    readTime: 4,
    tags: ["Leadership", "Industry"],
    excerpt: "Managers handle schedules. Leaders build people. Why the future of waterparks and aquatics depends on developing the second kind.",
    body: `
Our industry runs on young staff, seasonal turnover, and high-stakes responsibility. That combination demands more than people who can build a schedule and fill out a timecard. It demands leaders.

## Managers vs. leaders

- Managers enforce the rules. **Leaders explain why the rules matter.**
- Managers fill shifts. **Leaders build teams people want to come back to.**
- Managers react to incidents. **Leaders prepare people to prevent them.**

## The retention connection

Most guards don't leave because of pay alone. They leave because they don't feel developed, recognized, or trusted. Every lifeguard you mentor into a head guard is one you didn't have to replace.

## Where to start

1. Identify one high-potential staff member this week
2. Give them a real responsibility, not just a title
3. Meet with them regularly to talk about growth, not just performance

The next generation of aquatics directors is guarding a stand at your facility right now. Our job is to help them see it.
`
  }
];

window.EPISODES = [
  {
    number: 3,
    title: "Scanning Under Pressure: What Really Happens in a Drowning",
    date: "2026-11-08",
    duration: "42 min",
    description: "We break down the physiology of drowning, why it's silent, and how to train guards to recognize the signs before it's too late.",
    url: "#"
  },
  {
    number: 2,
    title: "From Seasonal Guard to Waterpark Director",
    date: "2026-10-25",
    duration: "38 min",
    description: "The career path nobody talks about: how to turn a summer job into a lifelong profession in aquatics leadership.",
    url: "#"
  },
  {
    number: 1,
    title: "Welcome to The Aquatic Edge",
    date: "2026-10-11",
    duration: "24 min",
    description: "Why this podcast exists, who it's for, and what it takes to lead in one of the most high-stakes industries out there.",
    url: "#"
  }
];
