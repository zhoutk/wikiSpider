var cheer = require("cheerio");
var fs = require("fs");
var request = require('request');
var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var uuid = require('uuid');

var baseDir = "./pics/";

data.get({
  url:'%E8%88%AA%E7%A9%BA%E6%AF%8D%E8%88%B0',
  qs:null
}).then(function(downHtml){
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
        var dirs = picUrl.split('.');
        var filename = baseDir+uuid.v1()+'.'+dirs[dirs.length -1];

        request("https:"+picUrl).pipe(fs.createWriteStream(filename));

        rsHtml = rsHtml.replace(picUrl,filename);
        // break;
        //console.log(i++ +"--"+filename);
      }
  }

  var regs = [/<link rel=\"stylesheet\" href=\"?[^\"]*\">/g,
    /<script>?[^<]*<\/script>/g,
  /<style>?[^<]*<\/style>/g,
  /<a ?[^>]*>/g,
  /<\/a>/g,
  /srcset=(\"?[^\"]*\")/g
  ]
  regs.forEach(function(rs){
    var mactches = rsHtml.match(rs);
    for (var i=0;i < mactches.length ; i++)
    {
      rsHtml = rsHtml.replace(mactches[i],mactches[i].indexOf('stylesheet')>-1?'<link rel="stylesheet" href="wiki'+(i+1)+'.css"':'');
    }
  })

  fs.writeFileSync('test.html',rsHtml);
});

