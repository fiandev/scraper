const { URL } = require("url");
const cheerio = require("cheerio");
const axios = require("axios");
const path = require("path");
const scraper = require("../utils/scraper");
const { save, download, isPathFile, getPathName, getFileName }  = require("../utils/functions");

class Scraper {
  constructor(url) {
    this.url = new URL(url);
    global.host = this.url.host.charAt(this.url.host.length - 1) === "/" ? this.url.host.slice(-1) : this.url.host;
  }
  
  async execute() {
    const response = await axios.get(this.url.href);
    const html = response.data;
    
    const $ = cheerio.load(html);
    const tags = ["link", "script", "img", "video"];
    
    for (let tag of tags) {
      let $tags = $( tag );
      let i = 0;
      
      $tags.map(function(){
        let $tag = $(this);
        let link = $tag.attr("href") ? $tag.attr("href") : $tag.attr("src");
        if (link) {
          if ( $tag.attr("rel")?.toLowerCase() === 'stylesheet' || $tag.attr("src") !== '' ) {
            let attribute = $tag.attr("href") ? "href" : "src";
            download(link);
            $(tag).eq(i).attr(attribute, getPathName(link));
          }
        }
        i++;
      });
    }
    /* save html */
    save( $.html(), path.join(global.output, getFileName(this.url)) );
    
  }
  
}

module.exports = Scraper