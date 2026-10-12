# SEO playbook: krishnasharma.online

The site itself is done (see "Search" in the README). From here, rankings
depend mostly on what happens **off** the site: Google confirming who you are,
and other sites linking to you. This file is the to-do list, ordered by payoff.

## Where things stood (12 Oct 2026)

Before V3 went live, the site on `www.krishnasharma.online` (V2, on Vercel):

- told Google its canonical address was **`https://www.krishnasharma.org`**, and
  so did its `og:url`, `robots.txt` and `sitemap.xml`. That domain expired on
  21 Aug 2026 and is in the registry's redemption period, so it no longer
  resolves. Google was being sent to a dead domain for the only page it knew.
- never said "video editor" anywhere: its title, description, H1 and schema
  all described a full-stack engineer.
- listed one URL in its sitemap, had no favicon.ico, and its share image was
  hosted on the dead domain.

Searching "Krishna Sharma video editor" brings up other people: an audience
engagement editor at The Baltimore Banner, several LinkedIn profiles, and a
portfolio at `portfolio.malloy.sg/krisxp` titled "Krishna Sharma | Video
Editor Portfolio" (talking-head and educational, India). **If that portfolio is
yours, link it to this site; if it isn't, it's your closest competitor for that
search.** `krishnasharma.in` belongs to a different Krishna Sharma (a backend
engineer).

**What to expect.** Nobody can guarantee #1 for a name this common. These are
realistic targets, roughly in the order they should arrive:

1. #1 for `krishnasharma.online` and "Krishna Sharma krishnasharma": within days of indexing.
2. #1 for "Krishna Sharma video editor" and "Krishna Sharma Noida": weeks to a
   few months, once the profiles below confirm the site.
3. Page one for long-tail client searches ("Hinglish reel editor",
   "talking-head video editor India", "Instagram reels editor Noida"): months,
   and growing with every reel page you add.
4. Your site, LinkedIn, YouTube and Instagram together filling the first page
   for "Krishna Sharma video editor".

## This week (about 2 hours)

- [ ] **Google Search Console** → Add property → *Domain* → `krishnasharma.online`.
      Verify with the TXT record it gives you (Cloudflare dashboard → DNS → Add
      record). Then:
      - Sitemaps → submit `https://www.krishnasharma.online/sitemap.xml`
      - URL inspection → *Request indexing* for `/`, `/edit`, `/code` and each
        `/edit/<reel>` page.
      - In 2–3 weeks: check *Video indexing* and *Enhancements* for errors.
- [ ] **Bing Webmaster Tools** → *Import from Google Search Console* (one click),
      then submit the same sitemap. Bing's index also supplies ChatGPT search,
      DuckDuckGo and Yahoo. IndexNow is already wired up: `npm run deploy` pings
      it, and every URL was submitted on launch (202 Accepted).
- [ ] **Cloudflare dashboard** for `krishnasharma.online` (these are settings
      my CLI token couldn't change):
      - SSL/TLS → Edge Certificates → **Always Use HTTPS: On** (the redirect
        Worker already does this; this setting is a backup).
      - Security → Bots / AI Crawl Control: **never choose "Block AI bots" or
        "Block on pages with ads".** Since 15 Sep 2026 those settings also block
        Googlebot, Bingbot and Applebot, because they crawl for both search and
        AI training. If you want to opt out of AI training, use *Disallow AI
        Training*, which keeps search crawling allowed.
      - **Keep the `www` and apex DNS records** (they still point at Vercel). The
        Workers run on *routes*, and a route only works on a hostname that has
        a proxied record.
- [ ] **Fill the empty profile links** in `src/lib/content.ts`: `instagram` and
      `youtube` are blank, so the site's schema only lists LinkedIn and GitHub as
      your other profiles. Those `sameAs` links are how Google ties the profiles
      to one person. Then run `npm run deploy`.
- [ ] **Make every profile say the same thing and link back.** Use the same name,
      the same headline ("Video Editor & Full-Stack Developer"), the same city and
      the link `https://www.krishnasharma.online`:
      - LinkedIn: headline, *Website* field, and the site in Featured.
      - GitHub: the *Website* field is empty, and the location says **Aligarh**
        while the site says **Noida**. Pick one city and use it everywhere.
      - Instagram and YouTube bios, X, Fiverr, Upwork, Contra.
      - The cluemate, coldwire and salonflow READMEs, and cluemate's Microsoft
        Store listing (publisher website).
- [ ] **The old domain `krishnasharma.org`** is in redemption at Bluehost, the
      last chance to recover it. If anything linked to it (old résumés, profiles,
      directories), restore it and redirect it to `.online` (add it to Cloudflare
      and give it a redirect rule or a copy of `worker/apex.ts`). If nothing
      did, let it go.

## Next 2 months: get confirmed and get linked

Google trusts a site more when other trusted sites point to it. For a
freelancer, the best links come from places that would link to you anyway:

- [ ] **YouTube**: upload the reels, plus one or two 3–5 minute breakdowns
      ("how I edited this reel": beat map, layers, raw vs final; the material
      is already on `/edit`). Put the site link on the first line of each
      description. Name searches often show YouTube results.
- [ ] **Behance and Vimeo**: video editors are expected to have both, and both
      allow a profile link. Upload the four reels with a short write-up each.
- [ ] **Ask for credit.** Creators whose videos you edit can put "Edited by
      Krishna Sharma → krishnasharma.online" in a description or bio link. A few
      real client links outweigh hundreds of directory listings.
- [ ] **Write two or three deep posts** on LinkedIn, Medium or dev.to, each
      linking to the matching page on your site. Good topics: "Word-timed
      Hinglish captions with Whisper", "Motion graphics rendered from HTML, frame
      by frame", "How cluemate runs with no server". Posts that show your process
      also build the expertise signals Google looks for.
- [ ] **Product Hunt** (cluemate or salonflow), **Indie Hackers**, and the
      communities you're already in (r/editors and r/VideoEditing; read their
      self-promotion rules first). Answer questions there; don't drop links.
- [ ] **Google Business Profile**: only if you meet clients in person or travel to
      them. Google lists eligible businesses as those with "a physical location
      that customers can visit, or [that] travels to customers where they are."
      A remote-only editor doesn't qualify, and a profile that breaks the rules
      can be suspended. If you do qualify, list yourself as a service-area
      business with the address hidden. That's how you'd show up for "video
      editor in Noida".

**Never do these:** buy links, use "1000 backlinks" gigs, swap links in bulk, or
mass-submit to directories. Google names each of these as link spam: buying or
selling links for ranking purposes, excessive link exchanges, automated link
building, and low-quality directory or bookmark links. Getting caught costs far
more than it gains.

## Ongoing: give Google more to rank

- **Every new reel gets its own page.** The pipeline handles everything: add the
  export to `_source/build_media.py`, add the entry to `content.ts`, run
  `python _source/build_media.py`, `python _source/build_og.py` and `npm run
  deploy`. Each page becomes a video result in Google with its own share card.
  One or two a month is a good pace.
- **Show real testimonials** with the client's name and channel. Don't add
  review stars in schema for yourself: Google ignores self-serving review
  markup.
- **Update `site.updated`** in `content.ts` whenever you change copy.
- **Watch Search Console monthly**: Performance → filter queries containing
  "video editor". If a page shows up a lot but rarely gets clicked, rewrite its
  title or description in `src/lib/seo.ts`.

## AI search (ChatGPT, Perplexity, Google AI Mode)

These pull from the same signals: an indexed site, Bing's index, structured
data, and consistent profiles. The site also serves `/llms.txt`, a plain-text
summary of who you are, with links. Google says AI Overviews and AI Mode run on
its core Search systems, so everything above applies to them too.

## Sources

- Google: [Video SEO best practices](https://developers.google.com/search/docs/appearance/video),
  [ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
  [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies),
  [Business Profile eligibility](https://support.google.com/business/answer/3038177)
- Cloudflare: [Mixed-use AI crawlers and the 15 Sep 2026 defaults](https://blog.cloudflare.com/accountable-mixed-use-ai-crawlers/)
