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

      request("https:"+picUrl).pipe(fs.createWriteStream(baseDir + filename));

      console.log(i++ +"--"+filename);
    }
}

