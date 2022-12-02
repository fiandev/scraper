const { URL } = require("url");
const cheerio = require("cheerio");
const axios = require("axios");
const path = require("path");
const scraper = require("../utils/scraper");
const { save, download, isPathFile }  = require("../utils/functions");

class Scraper {
  constructor(url) {
    this.url = new URL(url);
    global.host = this.url.host.charAt(this.url.host.length - 1) === "/" ? this.url.host.slice(-1) : this.url.host;
  }
  
  async execute() {
    const response = await axios.get(this.url.href);
    const html = response.data;
    
    const $ = cheerio.load(html);
    
    /* save html */
    save( $.html(), path.join(global.output, "/index.html") )
    
    /* get all stylesheet and javascript */
    let $tags = $("link, script, img, video");
    for (let tag of $tags) {
      let $tag = $( tag );
      let link = $tag.attr("href") ? $tag.attr("href") : $tag.attr("src");
      if (!link) continue;
      if ( $tag.attr("rel")?.toLowerCase() === 'stylesheet' || $tag.attr("src") !== '' ) download(link);
    }
    
  }
  
}

module.exports = Scraper