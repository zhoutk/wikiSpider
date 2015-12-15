var cheer = require("cheerio");
var fs = require("fs");
// var jquery = fs.readFileSync("./jquery.js", "utf-8");
var data = require('promised-rest-client')({url: 'http:'});
var Promise = require('promise');

var downHtml = fs.readFileSync('./carrier.txt');

$ = cheer.load(downHtml);

var imgs = $('.image');
var i = 0;
for(img in imgs){
  if(typeof imgs[img].attribs === 'undefined' || typeof imgs[img].attribs.href === 'undefined')
    { continue;}
  else
    {
      
      console.log(i++ +"--"+imgs[img].children[0].attribs.src);
      break;
    }
}
