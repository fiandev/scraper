const fs = require("fs");
const path = require("path");
const http = require("http");
const { URL } = require("url");

const REGEX_FILE = /(.)/;
const SPECIAL_URL_REGEX = /((\:?\/\/|http(s)?\:\/\/|\/\/)?(www\.)?)/;
const PROTOCOL_REGEX = /(http(s))?\:?(\/\/)/;

const isPathUrl = (url) => PROTOCOL_REGEX.test(url);
const isPathFile = (url) => REGEX_FILE.test(url);

const cleanPathURL = (url) => /^(\/\/)/.test(url) ? `https:${ url }` : url;

const download = async (resource) => {
  if (!resource) return;
  if (!global.output) throw new Error("global variabel does'nt exist!");
  
  resource = cleanPathURL(resource);
  
  if (!isPathUrl(resource)) resource = resource.charAt(0) === "." ? resource.slice(1) : (resource.charAt(0) === "/" ? resource : `/${ resource }`);
  if (!isPathUrl(resource)) resource = `https://${ global.host + resource }`;
  
  let url = new URL(resource);
  let pathname = path.join(global.output, url.pathname);
  let outdir = path.dirname( pathname );
  let pathExist = fs.existsSync(outdir);
  
  if (!pathExist) fs.mkdirSync( outdir , { recursive: true });
  try {
    await downloader(url.href, pathname, () => console.log(`downloaded file ${ path.parse(pathname).base }`));
  } catch(e) {
    // await downloader(url.href, pathname, () => console.log(`downloaded file ${ path.parse(pathname).base }`));
    
    console.error(`failed download ${ path.parse(pathname).base }`)
  } finally {
    console.log(`downloaded ${ path.parse( pathname ).base }`);
  }
}


const downloader = ( url, dest, cb ) => {
  try {
    var file = fs.createWriteStream(dest);
    var request = http.get(url.replace(/(https)/, "http"), function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
      });
    }).on('error', function(err) { // Handle errors
      // fs.rmSync(dest); // Delete the file async. (But we don't check the result)
      console.error(err.message);
    });
  } catch (e) {
    // console.error(e.message)
  }
}


const save = async (content, dest) => {
  if ( !global.output ) throw new Error("global variabel does'nt exist!");
  if ( !isPathFile(dest) ) throw new Error("destination must be pathfile");
  
  let outdir = path.dirname(dest);
  let pathExist = fs.existsSync( outdir );
  
  try {
    fs.writeFileSync(dest, content);
  } catch {
    if (!pathExist) fs.mkdirSync( outdir );
    fs.writeFileSync(dest, content);
  } finally {
    console.log(`saved ${ path.parse(dest).base }`);
  }
}

module.exports = {
  save,
  download,
  isPathUrl,
  isPathFile
}