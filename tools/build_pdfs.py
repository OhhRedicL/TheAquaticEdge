"""
Builds the branded Free Resource PDFs into assets/downloads/.

Usage (from the repo root):
    python3 tools/build_pdfs.py

Each document is written as HTML (one <section class="page"> per US Letter page),
then printed to PDF with headless Chromium via Playwright.
"""
import pathlib
import subprocess
import json

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "downloads"
BUILD = ROOT / "tools" / ".build"
IMG = (ROOT / "assets" / "img").as_uri()

BRAND = "Laboy Aquatics Co"
TAGLINE = "Your Edge in Aquatics Leadership"
DISCLAIMER = ("This resource is for educational and professional development purposes. It does not replace "
              "certified lifeguard, first aid, CPR/BLS, or EMS training, your certifying agency's guidelines, "
              "your facility's policies and Emergency Action Plan, or applicable laws and regulations.")

CSS = """
@page { size: Letter; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: #12303F; font-size: 10.5pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
:root { --navy:#163C4F; --navy9:#0A1F33; --deep:#0A274F; --teal7:#1A5F6E; --teal:#2A9590; --aqua:#46BCBB; --sea:#35AE96; --mist:#EAF6F6; --foam:#F5FAFA; --line:#D8E7EA; --muted:#5A7380; }
h1, h2, h3, h4 { font-family: 'Montserrat', sans-serif; color: var(--navy); margin: 0; line-height: 1.2; }
p { margin: 0 0 8px; }
.page { width: 8.5in; height: 11in; position: relative; overflow: hidden; page-break-after: always; background: #fff; }
.page:last-child { page-break-after: auto; }
.body { padding: 0.45in 0.6in 0 0.6in; }

/* Cover band */
.cover { position: relative; height: 2.85in; padding: 0.5in 0.6in 0; color: #fff; overflow: hidden;
  background: radial-gradient(5in 3in at 95% 0%, rgba(70,188,187,.45), transparent 60%), linear-gradient(135deg, #061626 0%, #0A274F 40%, #1A5F6E 80%, #2A9590 100%); }
.cover .mark-bg { position: absolute; right: -0.5in; bottom: -0.2in; width: 4.6in; opacity: .16; }
.cover .brandrow { display: flex; align-items: center; gap: 12px; position: relative; }
.cover .brandrow img { height: 0.34in; }
.cover .brandrow .bt { font-family: 'Montserrat'; font-weight: 800; letter-spacing: .06em; font-size: 11pt; line-height: 1.1; }
.cover .brandrow .bt small { display: block; font-weight: 600; font-size: 6.5pt; letter-spacing: .2em; color: #7fe0d3; margin-top: 3px; }
.cover .tag { position: relative; display: inline-block; margin-top: 0.3in; font-family: 'Montserrat'; font-weight: 700; font-size: 7.5pt; letter-spacing: .2em; text-transform: uppercase; color: #0A1F33; background: #7fe0d3; padding: 4px 10px; border-radius: 20px; }
.cover h1 { position: relative; color: #fff; font-size: 27pt; font-weight: 800; letter-spacing: -.01em; margin-top: 10px; max-width: 6in; }
.cover .sub { position: relative; color: #cfe6ea; font-size: 11pt; margin-top: 6px; max-width: 5.6in; }
.wave-edge { position: absolute; left: 0; right: 0; bottom: -1px; height: 0.42in; }

/* Running header */
.runhead { display: flex; justify-content: space-between; align-items: center; padding: 0.32in 0.6in 0.14in; border-bottom: 2px solid transparent;
  border-image: linear-gradient(90deg, #0A274F, #2A9590 60%, #46BCBB) 1; }
.runhead .l { display: flex; align-items: center; gap: 8px; font-family: 'Montserrat'; font-weight: 800; font-size: 8pt; letter-spacing: .1em; color: var(--navy); }
.runhead .l img { height: 0.2in; }
.runhead .r { font-family: 'Montserrat'; font-weight: 600; font-size: 7.5pt; color: var(--teal); letter-spacing: .08em; text-transform: uppercase; }

/* Footer */
.foot { position: absolute; left: 0.6in; right: 0.6in; bottom: 0.32in; display: flex; justify-content: space-between; align-items: center;
  font-size: 7pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 7px; }
.foot b { font-family: 'Montserrat'; color: var(--navy); letter-spacing: .06em; }
.foot .pg { font-family: 'Montserrat'; font-weight: 700; color: #fff; background: linear-gradient(135deg, #1A5F6E, #46BCBB); border-radius: 10px; padding: 2px 9px; }
.disclaimer { position: absolute; left: 0.6in; right: 0.6in; bottom: 0.68in; font-size: 6.6pt; color: #7b919a; line-height: 1.4; }

/* Content blocks */
.eyebrow { font-family: 'Montserrat'; font-weight: 700; font-size: 7.5pt; letter-spacing: .2em; text-transform: uppercase; color: var(--teal); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
.eyebrow::before { content: ""; width: 20px; height: 2.5px; border-radius: 2px; background: linear-gradient(90deg, #0A274F, #46BCBB); }
h2 { font-size: 15pt; font-weight: 800; margin-bottom: 8px; }
h3 { font-size: 11.5pt; font-weight: 700; margin-bottom: 4px; }
.lead { font-size: 11pt; color: #2a4553; }
.muted { color: var(--muted); }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.card { background: var(--foam); border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; }
.card h4 { font-size: 9.5pt; margin-bottom: 3px; }
.card p, .card li { font-size: 9pt; color: #3a5563; }
.callout { border-left: 4px solid var(--teal); background: var(--mist); border-radius: 0 10px 10px 0; padding: 10px 14px; font-family: 'Montserrat'; font-weight: 600; color: var(--navy); font-size: 10pt; }
ul.check, ul.dots { list-style: none; padding: 0; margin: 0; }
ul.check li { position: relative; padding-left: 20px; margin-bottom: 5px; }
ul.check li::before { content: ""; position: absolute; left: 0; top: 3px; width: 11px; height: 11px; border: 1.6px solid var(--teal); border-radius: 3px; }
ul.dots li { position: relative; padding-left: 14px; margin-bottom: 4px; }
ul.dots li::before { content: ""; position: absolute; left: 0; top: 7px; width: 6px; height: 6px; border-radius: 50%; background: var(--aqua); }
.num { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #0A274F, #2A9590); color: #fff; font-family: 'Montserrat'; font-weight: 800; font-size: 9pt; flex: none; }

/* Letter rows (S.H.I.F.T.) */
.letters { display: flex; flex-direction: column; gap: 9px; }
.letter { display: grid; grid-template-columns: 0.62in 1fr; gap: 14px; align-items: center; border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px 10px 10px; background: #fff; }
.letter .big { height: 0.62in; border-radius: 10px; display: grid; place-items: center; font-family: 'Montserrat'; font-weight: 800; font-size: 24pt; color: #fff; background: linear-gradient(135deg, #0A274F, #2A9590 70%, #46BCBB); }
.letter h3 { margin-bottom: 2px; }
.letter p { margin: 0; font-size: 9.3pt; color: #3a5563; }
.letter .ask { font-size: 8.6pt; color: var(--teal7); margin-top: 3px; font-style: italic; }

/* Form fields */
.fields { display: grid; gap: 8px 16px; }
.f { font-size: 8pt; font-family: 'Montserrat'; font-weight: 700; color: var(--teal7); letter-spacing: .06em; text-transform: uppercase; }
.f .ln { display: block; border-bottom: 1.2px solid #9db6bd; height: 20px; margin-top: 2px; }
.box { border: 1.2px solid var(--line); border-radius: 10px; padding: 8px 12px; }
.box .bh { display: flex; align-items: center; gap: 8px; font-family: 'Montserrat'; font-weight: 700; font-size: 9.5pt; color: var(--navy); margin-bottom: 4px; }
.box .bh .num { width: 20px; height: 20px; font-size: 8.5pt; }
.box .hint { font-size: 7.8pt; color: var(--muted); margin-bottom: 2px; }
.lines .l { border-bottom: 1px solid #c6d6da; height: 19px; }

/* Tables */
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 8.8pt; }
th { font-family: 'Montserrat'; font-weight: 700; font-size: 7.6pt; letter-spacing: .08em; text-transform: uppercase; color: #fff; background: linear-gradient(90deg, #0A274F, #1A5F6E); padding: 7px 8px; text-align: left; }
th:first-child { border-radius: 8px 0 0 0; } th:last-child { border-radius: 0 8px 0 0; }
td { padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top; color: #2a4553; }
tr:nth-child(even) td { background: var(--foam); }
td.wk { font-family: 'Montserrat'; font-weight: 800; color: var(--teal7); white-space: nowrap; }
td b { color: var(--navy); }
.blank td { height: 24px; }

.phase { border-radius: 12px; overflow: hidden; border: 1px solid var(--line); margin-bottom: 11px; }
.phase .ph { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; color: #fff; background: linear-gradient(90deg, #0A274F, #1A5F6E 60%, #2A9590); }
.phase .ph h3 { color: #fff; margin: 0; font-size: 11.5pt; }
.phase .ph span { font-family: 'Montserrat'; font-weight: 700; font-size: 8pt; letter-spacing: .14em; color: #7fe0d3; }
.phase .pb { padding: 10px 14px 8px; display: grid; grid-template-columns: 1.25fr 1fr; gap: 16px; }
.phase .pb p { font-size: 9.2pt; color: #3a5563; }

.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.compare > div { padding: 9px 12px; font-size: 9pt; border-bottom: 1px solid var(--line); }
.compare .h { font-family: 'Montserrat'; font-weight: 700; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; }
.compare .bad { background: #fff5f4; color: #7a3b36; }
.compare .good { background: #f0faf8; color: #1f5a52; }
.compare .h.bad { color: #b4473f; } .compare .h.good { color: #1f8a78; }
.compare > div:nth-last-child(-n+2) { border-bottom: 0; }
.pill { display: inline-block; font-size: 8pt; padding: 3px 9px; border-radius: 12px; margin: 0 4px 5px 0; }
.pill.no { background: #fff0ee; color: #a5443c; text-decoration: line-through; }
.pill.yes { background: #e6f6f3; color: #1f7a6b; }
.sp6 { height: 6px; } .sp10 { height: 10px; } .sp14 { height: 14px; } .sp18 { height: 18px; }
"""

WAVE_EDGE = '<svg class="wave-edge" viewBox="0 0 1000 60" preserveAspectRatio="none"><path fill="#46BCBB" fill-opacity=".35" d="M0 30c120 20 240 20 360 0s240-20 360 0 180 18 280 6v24H0z"/><path fill="#ffffff" d="M0 42c140 14 280 14 420 0s280-14 420 0 120 10 160 6v12H0z"/></svg>'


def cover(tag, title, sub):
    return f'''<div class="cover">
  <img class="mark-bg" src="{IMG}/wave-mark.png" alt="">
  <div class="brandrow"><img src="{IMG}/wave-mark.png" alt=""><div class="bt">{BRAND.upper()}<small>{TAGLINE.upper()}</small></div></div>
  <span class="tag">{tag}</span>
  <h1>{title}</h1>
  <div class="sub">{sub}</div>
  {WAVE_EDGE}
</div>'''


def runhead(title):
    return f'<div class="runhead"><div class="l"><img src="{IMG}/wave-mark.png" alt="">{BRAND.upper()}</div><div class="r">{title}</div></div>'


def foot(n, total, disclaimer=False):
    d = f'<div class="disclaimer">{DISCLAIMER}</div>' if disclaimer else ""
    return f'{d}<div class="foot"><span><b>{BRAND.upper()}</b> &nbsp;·&nbsp; {TAGLINE} &nbsp;·&nbsp; Free resource, share it with your team</span><span class="pg">{n} / {total}</span></div>'


def lines(n):
    return '<div class="lines">' + '<div class="l"></div>' * n + '</div>'


def field(label, span=1):
    return f'<div class="f" style="grid-column: span {span}">{label}<span class="ln"></span></div>'


def doc(title, pages):
    total = len(pages)
    html = []
    for i, (kind, content, disc) in enumerate(pages, 1):
        head = "" if kind == "cover" else runhead(title)
        html.append(f'<section class="page">{head}{content}{foot(i, total, disc)}</section>')
    return f'''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{"".join(html)}</body></html>'''


# =====================================================================
# 1. PRE-SHIFT BRIEFING TEMPLATE
# =====================================================================
def briefing():
    letters = [
        ("S", "Status", "Weather and heat index, attendance forecast, staffing, and any closed attractions, water chemistry, or maintenance issues.", "\"What does today look like?\""),
        ("H", "Hazards", "What's different today? New staff, special events, large groups, a slide acting up, slippery deck areas, storms on the radar.", "\"What could catch us off guard?\""),
        ("I", "Incidents", "A quick, no-blame recap of anything notable from the last shift: rescues, first aid, near-misses, guest issues. No names needed.", "\"What did we learn yesterday?\""),
        ("F", "Focus", "One skill or standard to sharpen today. Keep it specific and measurable so you can coach to it during the shift.", "\"10/20 scanning on the wave pool. Eyes on the water, every second.\""),
        ("T", "Thanks", "Recognize someone specific for something specific. Public praise builds the culture you want to see.", "\"Shout-out to Maria for a textbook rotation handoff yesterday.\""),
    ]
    rows = "".join(f'''<div class="letter"><div class="big">{l}</div><div><h3>{t}</h3><p>{d}</p><div class="ask">{a}</div></div></div>''' for l, t, d, a in letters)
    p1 = cover("Checklist", "Pre-Shift Briefing Template", "The S.H.I.F.T. format for a focused, five-minute briefing that sets the tone for the whole day.") + f'''
<div class="body">
  <p class="lead">A great pre-shift briefing is short, predictable, and useful. Run it the same way every day, keep it under five minutes, and your team will know exactly what to expect from you.</p>
  <div class="sp6"></div>
  <div class="eyebrow">The S.H.I.F.T. Format</div>
  <div class="letters">{rows}</div>
</div>'''

    boxes = "".join(f'''<div class="box"><div class="bh"><span class="num">{l}</span>{t}</div><div class="hint">{h}</div>{lines(n)}</div><div class="sp6"></div>''' for l, t, h, n in [
        ("S", "Status", "Weather / heat index · attendance forecast · staffing · closures · chemistry", 2),
        ("H", "Hazards", "New staff · events & groups · equipment issues · weather watch", 2),
        ("I", "Incidents", "Last-shift recap: rescues, first aid, near-misses, guest issues (no names)", 2),
        ("F", "Focus", "Today's one skill or standard", 1),
        ("T", "Thanks", "Who, and for what?", 1),
    ])
    p2 = f'''<div class="body">
  <div class="eyebrow">Daily Worksheet</div>
  <h2>Today's S.H.I.F.T. Briefing</h2>
  <div class="fields" style="grid-template-columns: 1fr 1fr 1fr">
    {field("Date")}{field("Shift / time")}{field("Briefing led by")}
    {field("Facility / area", 2)}{field("Guards on shift")}
  </div>
  <div class="sp10"></div>
  {boxes}
  <div class="grid2">
    <div class="box"><div class="bh">Questions from the team</div>{lines(2)}</div>
    <div class="box"><div class="bh">Follow-up needed (who / by when)</div>{lines(2)}</div>
  </div>
  <div class="sp6"></div>
  <div class="eyebrow">Briefing Tips</div>
  <div class="grid3">
    <div class="card"><h4>Position yourself</h4><p>Stand where everyone can see you, with the sun at <b>your</b> back, not theirs.</p></div>
    <div class="card"><h4>Check understanding</h4><p>Ask one quick question before you dismiss the team to their stands.</p></div>
    <div class="card"><h4>End on time</h4><p>Five minutes means five minutes. Your team will respect you more for it.</p></div>
  </div>
</div>'''
    return doc("Pre-Shift Briefing Template", [("cover", p1, False), ("page", p2, True)])


# =====================================================================
# 2. IN-SERVICE TRAINING PLANNER
# =====================================================================
def inservice():
    weeks = [
        ("Scanning & zone coverage", "Zone mapping, scanning patterns, rotation handoffs", "Hidden \"submerged victim\" manikin placed during a busy session"),
        ("Active victim rescues", "Entries, approaches, and rescue tube technique", "Distressed swimmer in deep water; guard-to-guard backup"),
        ("Passive & submerged victims", "Surface dives, submerged victim recovery, extrication", "Unresponsive guest found on the bottom; full EAP activation"),
        ("Spinal injury management", "In-water stabilization and backboarding", "Suspected spinal injury in shallow water or a slide exit"),
        ("EAP activation & communication", "Whistle signals, radio calls, clearing the water", "Timed EAP drill: first whistle to EMS handoff"),
        ("CPR, AED & BLS team response", "High-quality compressions, AED use, team roles", "Two- and three-rescuer cardiac arrest on deck"),
        ("First aid & sudden illness", "Heat illness, seizures, allergic reactions, bleeding", "Guest collapses in the queue line on a hot day"),
        ("Attraction focus: wave pool", "Wave-on/wave-off procedures, multiple swimmers in trouble", "Two simultaneous victims during a wave cycle"),
        ("Attraction focus: slides & catch pools", "Dispatch safety, exit-area scanning, stuck riders", "Rider fails to surface at a catch pool"),
        ("Multiple victims & triage", "Prioritizing care, delegating, using bystanders", "Several guests injured in one event; limited staff"),
        ("Guest communication & de-escalation", "Rule enforcement, upset parents, lost children", "Lost-child report while a rescue is in progress"),
        ("Skills check & full-scale drill", "Individual skills verification and team debrief", "Unannounced multi-role drill with outside observers"),
    ]
    rows = "".join(f'<tr><td class="wk">Wk {i:02d}</td><td><b>{f}</b></td><td>{s}</td><td>{sc}</td></tr>' for i, (f, s, sc) in enumerate(weeks, 1))
    p1 = cover("Planner", "In-Service Training Planner", "A 12-week rotation of drills, scenarios, and skill checks that keeps your team sharp all season.") + '''
<div class="body">
  <p class="lead">In-service training is where good aquatic teams become great ones. The secret is to keep it short, frequent, and realistic, so skills stay sharp and staff stay engaged.</p>
  <div class="sp6"></div>
  <div class="grid2">
    <div>
      <div class="eyebrow">Four Principles</div>
      <div class="card" style="margin-bottom:7px"><h4>1. Short and frequent</h4><p>20–30 minutes every week beats a two-hour block once a month.</p></div>
      <div class="card" style="margin-bottom:7px"><h4>2. Make it realistic</h4><p>Real water, real equipment, real attractions. Train in uniform with radios and full EAP activation.</p></div>
      <div class="card" style="margin-bottom:7px"><h4>3. Rotate the topics</h4><p>Rescue skills, first aid, communication, and guest service all deserve reps.</p></div>
      <div class="card"><h4>4. Document everything</h4><p>Attendance, skills performed, and areas to improve protect your team and give you data to coach from.</p></div>
    </div>
    <div>
      <div class="eyebrow">The 30-Minute Session</div>
      <table>
        <tr><th>Time</th><th>Block</th><th>What happens</th></tr>
        <tr><td class="wk">5 min</td><td><b>Warm-up</b></td><td>Swim or skills warm-up, review today's goal</td></tr>
        <tr><td class="wk">10 min</td><td><b>Skill drill</b></td><td>Focused reps on one technique with coaching</td></tr>
        <tr><td class="wk">10 min</td><td><b>Scenario</b></td><td>Realistic, timed scenario using the skill</td></tr>
        <tr><td class="wk">5 min</td><td><b>Debrief</b></td><td>What went well? What do we sharpen next time?</td></tr>
      </table>
      <div class="sp14"></div>
      <div class="callout">If your staff only trains when they're being evaluated, you're testing, not training.</div>
      <div class="sp14"></div>
      <div class="eyebrow">Make It Theirs</div>
      <ul class="dots">
        <li>Let senior guards design and lead a scenario</li>
        <li>Add realistic stress: noise, crowds, multiple victims</li>
        <li>Recognize standout performance publicly</li>
        <li>Revisit any skill the team struggled with</li>
      </ul>
    </div>
  </div>
</div>'''
    p2 = f'''<div class="body">
  <div class="eyebrow">The Rotation</div>
  <h2>12-Week In-Service Plan</h2>
  <p class="muted" style="font-size:9pt">Run one focus per week. Repeat the cycle through the season, adjusting for your facility's attractions and your team's needs. Always follow your certifying agency's current protocols.</p>
  <table>
    <tr><th style="width:0.6in">Week</th><th style="width:1.75in">Focus</th><th>Skill drill</th><th>Scenario</th></tr>
    {rows}
  </table>
</div>'''
    att = "".join('<tr class="blank"><td></td><td></td><td></td><td></td></tr>' for _ in range(12))
    p3 = f'''<div class="body">
  <div class="eyebrow">Session Log</div>
  <h2>In-Service Record</h2>
  <div class="fields" style="grid-template-columns: 1fr 1fr 1fr">
    {field("Date")}{field("Week / focus")}{field("Facilitator")}
    {field("Location / attraction", 2)}{field("Duration")}
  </div>
  <div class="sp10"></div>
  <div class="grid2">
    <div class="box"><div class="bh">Skills practiced</div>{lines(3)}</div>
    <div class="box"><div class="bh">Scenario run</div>{lines(3)}</div>
  </div>
  <div class="sp10"></div>
  <table>
    <tr><th>Staff name</th><th style="width:1.4in">Skills completed</th><th style="width:1.4in">Needs more reps</th><th style="width:1.2in">Initials</th></tr>
    {att}
  </table>
  <div class="sp10"></div>
  <div class="grid2">
    <div class="box"><div class="bh">What went well</div>{lines(2)}</div>
    <div class="box"><div class="bh">Follow-up for next session</div>{lines(2)}</div>
  </div>
</div>'''
    return doc("In-Service Training Planner", [("cover", p1, False), ("page", p2, False), ("page", p3, True)])


# =====================================================================
# 3. INCIDENT REPORT WRITING GUIDE
# =====================================================================
def report_guide():
    rules = [
        ("Objective", "Describe what you saw, heard, and did. Leave out opinions, emotions, and assumptions."),
        ("Factual", "Write only what you know. If you didn't see it, say who told you."),
        ("Timely", "Write it as soon as the scene is safe, while the details are fresh."),
        ("Complete", "Cover who, what, when, where, and the actions taken, start to finish."),
        ("Clear", "Short sentences, plain language, in the order things happened."),
        ("Your own words", "Write your report yourself. Don't copy or compare with coworkers."),
    ]
    rr = "".join(f'<div class="card"><h4><span class="num" style="width:18px;height:18px;font-size:8pt;margin-right:6px">{i}</span>{t}</h4><p>{d}</p></div>' for i, (t, d) in enumerate(rules, 1))
    p1 = cover("Guide", "Incident Report Writing Guide", "How to document clearly, objectively, and factually, so every report holds up when it matters.") + f'''
<div class="body">
  <p class="lead">An incident report is a permanent record of what happened and how your team responded. It may be read by supervisors, EMS, insurers, or attorneys long after the day is forgotten. A clear, factual report protects the guest, your team, and you.</p>
  <div class="sp6"></div>
  <div class="eyebrow">Six Golden Rules</div>
  <div class="grid3">{rr}</div>
  <div class="sp14"></div>
  <div class="grid2">
    <div>
      <div class="eyebrow">What to Include</div>
      <ul class="check">
        <li><b>When:</b> date and exact times (call, arrival, care, handoff)</li>
        <li><b>Where:</b> specific location, attraction, zone, or stand</li>
        <li><b>Who:</b> guest description, staff involved, witnesses</li>
        <li><b>What happened:</b> in the order events occurred</li>
        <li><b>Actions taken:</b> rescue, care provided, equipment used</li>
        <li><b>Outcome:</b> released, refused care, or EMS transport</li>
      </ul>
    </div>
    <div>
      <div class="eyebrow">What to Leave Out</div>
      <ul class="dots">
        <li>Guesses about cause or fault ("he must have…")</li>
        <li>Medical diagnoses ("she had a concussion")</li>
        <li>Blame or judgment of guests or coworkers</li>
        <li>Opinions about policies or equipment</li>
        <li>Slang, jokes, or exaggeration</li>
      </ul>
      <div class="sp10"></div>
      <div class="callout">If you didn't see it, don't write it as fact. Write who told you.</div>
    </div>
  </div>
</div>'''
    pairs = [
        ("The kid was being stupid and running, so he fell.", "At approx. 2:14 PM, a male guest, approx. 8 years old, was observed running on the deck near Wave Pool Entrance B. He slipped and fell, landing on his right knee."),
        ("She was drowning and I saved her.", "At approx. 3:02 PM, I observed a female guest in Zone 4 with her head back, arms pressing down at the surface, and no forward progress. I signaled one long whistle, entered the water, and performed a front rescue with a rescue tube."),
        ("He had a concussion.", "The guest stated he hit his head on the slide wall. He had a red, raised area on the left side of his forehead and said he felt dizzy."),
        ("The mom was really rude and wouldn't listen.", "The guest's mother declined first aid and stated, \"We're leaving.\" I offered a refusal of care form, which she declined to sign. Supervisor J. Smith was present."),
        ("EMS came pretty fast.", "EMS was called at 3:04 PM, arrived at 3:13 PM, and care was handed off to EMS at 3:15 PM."),
    ]
    cmp = '<div class="h bad">✕ &nbsp;Avoid this</div><div class="h good">✓ &nbsp;Write this instead</div>' + "".join(f'<div class="bad">"{a}"</div><div class="good">"{b}"</div>' for a, b in pairs)
    p2 = f'''<div class="body">
  <div class="eyebrow">Before &amp; After</div>
  <h2>Turn Opinions Into Observations</h2>
  <p class="muted" style="font-size:9.4pt">Use specific times, locations, and descriptions. Quote guests directly when it matters. Describe what you observed instead of naming a condition.</p>
  <div class="compare">{cmp}</div>
  <div class="sp14"></div>
  <div class="eyebrow">Word Swaps</div>
  <div>
    <span class="pill no">drowning</span><span class="pill yes">in distress, no forward progress</span>
    <span class="pill no">broken arm</span><span class="pill yes">guest reported pain; arm appeared swollen</span>
    <span class="pill no">drunk</span><span class="pill yes">slurred speech, unsteady walking</span>
    <span class="pill no">I think</span><span class="pill yes">I observed</span>
    <span class="pill no">about 5 minutes later</span><span class="pill yes">at 3:13 PM</span>
    <span class="pill no">a kid</span><span class="pill yes">a male guest, approx. 8 years old, red swimsuit</span>
    <span class="pill no">refused help</span><span class="pill yes">declined first aid and stated, "…"</span>
  </div>
  <div class="sp14"></div>
  <div class="grid2">
    <div class="card"><h4>Writing tip: tell it in order</h4><p>Start before the incident (what you saw first), walk through each action you took, and end with the outcome and handoff. A short timeline makes this easy.</p></div>
    <div class="card"><h4>Writing tip: correct the right way</h4><p>On paper, draw one line through a mistake, write the correction, and initial it. Never use correction fluid or tear out pages. Follow your facility's process for electronic reports.</p></div>
  </div>
</div>'''
    tl = "".join('<tr class="blank"><td></td><td></td><td></td></tr>' for _ in range(9))
    p3 = f'''<div class="body">
  <div class="eyebrow">Practice Worksheet</div>
  <h2>Build Your Timeline First</h2>
  <p class="muted" style="font-size:9.2pt">Jot down the facts in order before writing your narrative. Use this for practice or as a scratch sheet, then transfer to your facility's official report form.</p>
  <table>
    <tr><th style="width:0.9in">Time</th><th>What I observed</th><th style="width:2.4in">Action I took</th></tr>
    {tl}
  </table>
  <div class="sp10"></div>
  <div class="grid2">
    <div class="box"><div class="bh">Witnesses (name &amp; contact)</div>{lines(2)}</div>
    <div class="box"><div class="bh">Staff involved &amp; roles</div>{lines(2)}</div>
  </div>
  <div class="sp10"></div>
  <div class="eyebrow">Before You Submit</div>
  <div class="grid2">
    <ul class="check">
      <li>Times are specific and in order</li>
      <li>Location is exact (attraction, zone, stand)</li>
      <li>Guest is described, not judged</li>
      <li>Only facts I observed, or sources named</li>
    </ul>
    <ul class="check">
      <li>Every action I took is listed</li>
      <li>Outcome and handoff are documented</li>
      <li>No diagnoses, guesses, or blame</li>
      <li>Signed, dated, and given to my supervisor</li>
    </ul>
  </div>
</div>'''
    return doc("Incident Report Writing Guide", [("cover", p1, False), ("page", p2, False), ("page", p3, True)])


# =====================================================================
# 4. NEW SUPERVISOR 90-DAY PLAN
# =====================================================================
def ninety():
    phases = [
        ("Days 1–30", "Listen More Than You Talk", "Your team already has opinions about how things should run. Learn them before you change anything. Earn trust by showing up, asking questions, and doing the work alongside them.",
         ["One-on-one with every guard", "Work a rotation on every stand", "Know the EAP and every attraction cold", "List problems, but don't fix them all yet"]),
        ("Days 31–60", "Set the Standard, Then Model It", "People follow what you do, not what you post in the group chat. Pick one standard, hold it consistently, and be the example of it every single shift.",
         ["First on deck, in uniform, every shift", "Correct in private, praise in public", "Pick ONE standard and hold it", "Lead at least two in-service drills"]),
        ("Days 61–90", "Develop Someone Else", "You're not a real leader until you're growing the next one. Find your high-potential guards and give them real responsibility, not just a title.",
         ["Identify your future replacement", "Let them lead a briefing or drill", "Review a report with your supervisor", "Ask for feedback on your leadership"]),
    ]
    ph = "".join(f'''<div class="phase"><div class="ph"><h3>{t}</h3><span>{d.upper()}</span></div><div class="pb"><p>{desc}</p><ul class="check">{"".join(f"<li>{g}</li>" for g in goals)}</ul></div></div>''' for d, t, desc, goals in phases)
    p1 = cover("Worksheet", "New Supervisor 90-Day Plan", "A step-by-step roadmap for your first three months in charge, from the stand to the clipboard.") + f'''
<div class="body">
  <p class="lead">The hardest promotion in aquatics is the first one. Yesterday you were one of the guards; today you're running the rotation. This plan gives your first 90 days a clear shape, so you earn trust fast without losing who you are.</p>
  <div class="sp6"></div>
  {ph}
</div>'''
    refl = "".join(f'<div class="box"><div class="bh"><span class="num">{n}</span>{t}</div><div class="hint">{h}</div>{lines(3)}</div><div class="sp6"></div>' for n, t, h in [
        ("30", "Day 30 check-in", "What have I learned about my team? What surprised me? What problems keep coming up?"),
        ("60", "Day 60 check-in", "What standard did I set? Is it holding? Where do I still need to model it better?"),
        ("90", "Day 90 check-in", "Who am I developing? What feedback did I get? What's my focus for the next 90 days?"),
    ])
    p2 = f'''<div class="body">
  <div class="eyebrow">Plan &amp; Reflect</div>
  <h2>My 90-Day Plan</h2>
  <div class="fields" style="grid-template-columns: 1fr 1fr 1fr">
    {field("Name")}{field("Start date")}{field("My supervisor / mentor")}
  </div>
  <div class="sp10"></div>
  <div class="box"><div class="bh">My one standard to tighten</div><div class="hint">Example: rotation timing, scanning posture, radio etiquette, uniform</div>{lines(1)}</div>
  <div class="sp6"></div>
  <div class="box"><div class="bh">The guard I'm developing &amp; how</div>{lines(2)}</div>
  <div class="sp10"></div>
  {refl}
  <div class="sp6"></div>
  <div class="callout">Leadership isn't the title on your shirt. It's what your team does when you're on break.</div>
</div>'''
    oo = "".join('<tr class="blank"><td></td><td></td><td></td><td></td></tr>' for _ in range(14))
    p3 = f'''<div class="body">
  <div class="eyebrow">Tracker</div>
  <h2>One-on-One Conversations</h2>
  <p class="muted" style="font-size:9.2pt">Ask every guard: <b>"What's one thing that would make your shift better?"</b> Write down what you hear, and close the loop on anything you promise.</p>
  <table>
    <tr><th style="width:1.7in">Guard</th><th style="width:0.9in">Date</th><th>What I heard</th><th style="width:1.5in">My follow-up</th></tr>
    {oo}
  </table>
  <div class="sp14"></div>
  <div class="eyebrow">90-Day Checklist</div>
  <div class="grid2">
    <ul class="check">
      <li>One-on-one with every guard on my team</li>
      <li>Ran at least two in-service drills myself</li>
      <li>Reviewed an incident report with my supervisor</li>
    </ul>
    <ul class="check">
      <li>Held one standard consistently for 30+ days</li>
      <li>Identified and started developing my replacement</li>
      <li>Asked my team for feedback on my leadership</li>
    </ul>
  </div>
</div>'''
    return doc("New Supervisor 90-Day Plan", [("cover", p1, False), ("page", p2, False), ("page", p3, True)])


DOCS = {
    "pre-shift-briefing-template": briefing,
    "in-service-training-planner": inservice,
    "incident-report-writing-guide": report_guide,
    "new-supervisor-90-day-plan": ninety,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    BUILD.mkdir(parents=True, exist_ok=True)
    jobs = []
    for slug, fn in DOCS.items():
        html = BUILD / f"{slug}.html"
        html.write_text(fn(), encoding="utf-8")
        jobs.append({"html": html.as_uri(), "pdf": str(OUT / f"{slug}.pdf")})
    script = """
const { chromium } = require('playwright');
(async () => {
  const jobs = %s;
  const b = await chromium.launch();
  const p = await b.newPage();
  for (const j of jobs) {
    await p.goto(j.html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: j.pdf, format: 'Letter', printBackground: true, preferCSSPageSize: true });
    console.log('wrote', j.pdf);
  }
  await b.close();
})();
""" % json.dumps(jobs)
    subprocess.run(["node", "-e", script], check=True)
