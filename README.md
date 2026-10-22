# Rebecca Kase: website check and November content

A small, fast static website with four pages:

| Page | Address | What it shows |
| --- | --- | --- |
| Overview | `/` | A navigation banner (the three reel styles, November and the website check), then the full reel library with hover-to-play previews, then the website score and the four reels whose articles need link fixes |
| Website check | `/website/` | The rebeccakase.com check in plain English: score and clickable pins, a one-minute summary, the 8 scores (tap to expand), and the five fixes to do first |
| November | `/november/` | The clickable calendar. Each post opens in a phone preview (reels play, carousels swipe) with captions to copy |
| Reel library | `/reels/` | All 26 reels sorted into the three styles, with filters and previews |

No build step, no framework and no dependencies. It is plain HTML, CSS and JavaScript, so Vercel serves it as is.

## Deploy on Vercel (about 5 minutes)

### 1. Put the code on GitHub

The repo has about 170 files (the reels are web-sized copies, 2 to 9 MB each), so use git or GitHub Desktop rather than the browser upload, which stops at 100 files and 25 MB per file.

**With the command line**

```bash
cd rebecca-kase-portal
git init
git add .
git commit -m "Rebecca Kase website check and November content"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/rebecca-kase-portal.git
git push -u origin main
```

Create the empty repository on github.com first (New repository, no README), then run the commands above with your own username.

**With GitHub Desktop**

File, Add local repository, choose this folder, publish it to GitHub (keep it private if you like).

### 2. Import it into Vercel

1. On vercel.com choose **Add New, Project** and import the repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**.

Every push to `main` redeploys automatically.

### Optional: deploy without GitHub

```bash
npm i -g vercel
cd rebecca-kase-portal
vercel --prod
```

## Preview on your computer

Open a terminal in this folder and run one of these, then visit the address it prints:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Opening `index.html` by double-clicking also works for most of the site, but the links between pages expect a server.

## Editing content

| To change | Edit |
| --- | --- |
| Captions, times, hashtags, alt text, scripts | `assets/js/data/posts.js` |
| Reel titles, descriptions and which reels appear | `assets/js/data/reels.js` |
| Website check text | `website/index.html` |
| Colors and fonts | the `:root` block at the top of `assets/css/site.css` |
| Email button for notes on the November page | `assets/js/config.js` (add an address to `feedbackEmail`) |

To swap a reel, replace the file in `media/reels/` with a web-sized MP4 of the same name (720 x 1280 or 540 x 960, H.264, under about 10 MB).

## What is where

```
index.html                 Overview
website/index.html         Website check
november/index.html        November calendar and post viewer
reels/index.html           Reel library
404.html                   Not-found page
assets/css/site.css        All styles (brand colors and fonts at the top)
assets/js/site.js          Shared: menu, animations, 3D tilt, copy, modal, reel player
assets/js/audit.js         Website check pins and action plan
assets/js/november.js      Calendar, post viewer and notes
assets/js/reels.js         Reel library
assets/js/data/            Post and reel content
assets/fonts/              Gentium Book Plus and Montserrat (self-hosted)
media/posts/               Carousel slides, single images, reel covers, thumbnails
media/reels/               Web-sized reels and posters
media/audit/               Website screenshots
media/headers/             LinkedIn banner and Facebook cover
downloads/                 Content plan PDF and website check PDF
vercel.json                Clean addresses, caching, and "do not index" headers
```

## Good to know

- **Private by default.** Every page tells search engines not to index it (`robots.txt`, a meta tag and a header in `vercel.json`). Anyone with the link can still open it. For a password, Vercel offers Password Protection on paid plans.
- **Notes stay in the browser.** On the November page, "Looks good" and "Needs a change" are saved in the viewer's own browser. "Copy my notes" turns them into text to paste into an email or message.
- **Full-quality files live in Drive.** The reels and images here are compressed for fast loading. Post from the original files in Drive.
- **Vercel plan.** Vercel's free Hobby plan is meant for personal, non-commercial projects. For client work, a Pro plan (or deploying from the client's own account) keeps you inside their terms.
