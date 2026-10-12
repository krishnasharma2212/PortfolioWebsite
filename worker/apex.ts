/**
 * krishnasharma.online (and plain-http www) → https://www.krishnasharma.online,
 * path and query kept. One origin for every URL, so search engines never see
 * the site twice and nothing is served without TLS.
 */
const CANONICAL = "www.krishnasharma.online";

export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.hostname = CANONICAL;
    url.port = "";
    return Response.redirect(url.toString(), 301);
  },
} satisfies ExportedHandler;
