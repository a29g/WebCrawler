const { JSDOM } = require("jsdom");

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
};
