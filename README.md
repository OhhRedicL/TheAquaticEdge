# Laboy Aquatics Co: Website

Your Edge in Aquatics Leadership. This is a fast, static website with no build step. Open `index.html` in a browser, or host it free on GitHub Pages, Netlify, or Vercel.

## Pages
| File | What it is |
|---|---|
| `index.html` | Home: hero, about, mission, services, drone flyover, Leadership Track, podcast, blog, resources, newsletter, contact |
| `blog.html` | All posts, with filters (Professional Development / Leadership Track) and search |
| `post.html?slug=...` | A single article (generated automatically from your posts) |

## Updating content (no coding needed)
Almost everything lives in **`assets/js/content.js`**:

- **`SITE`**: your name, email, social links, podcast links, contact form endpoint, and the drone video.
- **`POSTS`**: blog posts. Copy an existing post, paste it at the top of the list, and edit it.
  - `category: "development"` shows it in the **Professional Development** blog
  - `category: "leadership"` shows it in the **Leadership Track** for lifeguards moving into leadership
  - `body` supports simple Markdown (`## heading`, `**bold**`, `- bullets`, `> quote`)
- **`EPISODES`**: podcast episodes, newest first. Set `url` to the episode link.

## Things to personalize
1. `email` in `content.js`
2. Your headshot lives at `assets/img/headshot.jpg`. To change it, replace that file with a new one (a 4:5 portrait works best).
3. Podcast links (`apple`, `spotify`, `youtube`) and optionally `podcastEmbed`
4. Contact form: by default it opens the visitor's email app. For real form submissions, create a free form at formspree.io and paste its URL into `formEndpoint`.
5. Free resources: the four branded PDFs live in `assets/downloads/`. To edit their wording, change `tools/build_pdfs.py` and run `python3 tools/build_pdfs.py` (needs Python, Node and Playwright with Chromium).

## Drone flyover
The home page has a cinematic aerial section. By default it plays an **animated, simulated waterpark flyover** drawn in the browser, so it needs no video file. To use real drone footage, add an MP4 (ideally 1080p, under about 15 MB, no audio) and set:
```js
droneVideo: "assets/video/waterpark.mp4",
droneVideoPoster: "assets/video/waterpark.jpg"
```

## Colors (from the logo)
Navy `#163C4F` · Deep blue `#0A274F` · Teal `#1A5F6E` / `#2A9590` · Aqua `#46BCBB` · Seafoam `#35AE96`
