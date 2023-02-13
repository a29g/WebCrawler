const { crawlPage } = require("./crawl");
const { printReport } = require("./report");
async function main() {
  if (process.argv.length < 3) {
    console.log("No website given");
  }
  if (process.argv.length > 3) {
    console.log("Too many args provided");
  }

  const baseURL = process.argv[2];

  console.log(`Starting crawling for : ${baseURL}`);

  const pages = await crawlPage(baseURL, baseURL, {});

  printReport(pages);
}

main();
