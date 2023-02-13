const { JSDOM } = require("jsdom");

async function crawlPage(baseURL, currentURL, pages) {
  //  If we mode to Offsite URL it retuns back

  const baseUrlObj = new URL(baseURL);
  const currentUrlObj = new URL(currentURL);

  if (baseUrlObj.hostname !== currentUrlObj.hostname) {
    return pages;
  }

  const normalizedUrl = normalizeURL(currentURL);

  // if we've already visited this page just increase the count and don't repeat the http request
  if (pages[normalizedUrl] > 0) {
    pages[normalizedUrl]++;
    return pages;
  }

  // initialize this page in the map since it doesn't exist yet
  pages[normalizedUrl] = 1;

  // fetch and parse the html of the currentURL
  console.log(`crawling current URL: ${currentURL}`);
  let htmlBody = "";
  try {
    const resp = await fetch(currentURL);
    if (resp.status > 399) {
      console.log(`Got HTTP error, with ${resp.status} status code`);
      return pages;
    }

    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`Got a non-HTML response for: ${currentURL}`);
      return pages;
    }

    htmlBody = await resp.text();
  } catch (error) {
    console.log(error.message);
  }

  const nextUrls = getURLsFromHTML(htmlBody, baseURL);

  for (const nextUrl of nextUrls) {
    pages = await crawlPage(baseURL, nextUrl, pages);
  }

  return pages;
}

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const aElements = dom.window.document.querySelectorAll("a");

  for (const aElement of aElements) {
    if (aElement.href.slice(0, 1) === "/") {
      //relative path
      try {
        urls.push(new URL(`${baseURL}${aElement.href}`).href);
      } catch (error) {
        console.log(`${error}: ${aElement.href}`);
      }
    } else {
      //absolute path
      try {
        urls.push(new URL(aElement.href).href);
      } catch (error) {
        console.log(`${error}: ${aElement.href}`);
      }
    }
  }

  return urls;
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
