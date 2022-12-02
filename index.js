const readline = require("readline");
const path = require("path");
const rl = readline.createInterface(process.stdin, process.stdout);

const Scraper = require("./lib/Scraper");

rl.question('input url to scrape : ', (url) => {
  rl.question('path result [directory] : ', (pathResult) => {
    if (pathResult === "." || pathResult === "./" || pathResult === "") pathResult = "./result";
    global.output = path.resolve(pathResult);
    
    let scraper = new Scraper(url);
    scraper.execute();
    
    rl.close()
  })
});