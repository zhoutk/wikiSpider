var cheer = require("cheerio");
var http = require("https");
var fs = require("fs");
// var jquery = fs.readFileSync("./jquery.js", "utf-8");
var data = require('promised-rest-client')({url: 'https:'});
var request = require('request');
var Promise = require('promise');
var baseDir = "./pics/";

var downHtml = fs.readFileSync('./carrier.txt');

$ = cheer.load(downHtml);

var rsHtml = $.html();
var imgs = $('#bodyContent .image');
var i = 0;
for(img in imgs){
  if(typeof imgs[img].attribs === 'undefined' || typeof imgs[img].attribs.href === 'undefined')
    {continue;}
  else
    {
      var picUrl = imgs[img].children[0].attribs.src;
      var dirs = picUrl.split('/');
      var filename = dirs[dirs.length -1];

      // request("https:"+picUrl).pipe(fs.createWriteStream(baseDir + filename));

      rsHtml = rsHtml.replace(picUrl,baseDir+filename);
      // break;
      //console.log(i++ +"--"+filename);
    }
}

var linkStyle = /<link rel=\"stylesheet\" href=\"?[^\"]*\">/g
var mactches = rsHtml.match(linkStyle)
for (var i=0;i < mactches.length ; i++)
{
  rsHtml = rsHtml.replace(mactches[i],'<link rel="stylesheet" href="wiki'+(i+1)+'.css"');
}

var script = /<script>?[^<]*<\/script>/g;
mactches = rsHtml.match(script)
for (var i=0;i < mactches.length ; i++)
{
  console.log(mactches[i]);   //Cat  cat
}

var srcset = /srcset=(\"?[^\"]*\")/g;

 fs.writeFileSync('td.html',rsHtml.replace(srcset,''));

