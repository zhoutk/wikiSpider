var cheer = require('cheerio');
var fs = require("fs");
var request = require('request');
var uuid = require('uuid');

var baseDir = "pics/";

module.exports = function(downHtml){
  $ = cheer.load(downHtml);
  var rsHtml = $.html();
  var imgs = $('.image');
  for(img in imgs){
    if(typeof imgs[img].attribs === 'undefined' || typeof imgs[img].attribs.href === 'undefined')
      {continue;}
    else
      {
        var picUrl = imgs[img].children[0].attribs.src;
        var dirs = picUrl.split('.');
        var filename = baseDir+uuid.v1()+'.'+dirs[dirs.length -1];

        request("https:"+picUrl).pipe(fs.createWriteStream('pages/'+filename));

        rsHtml = rsHtml.replace(picUrl,filename);
        // console.log(picUrl);
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

  var ms = rsHtml.match(/src=\"\/\/upload\.wikimedia\.org?[^\"]*\"/g);
  for (var i=0;ms && i < ms.length ; i++)
  {
    var picUrl = ms[i].split('"')[1];
    var dirs = picUrl.split('.');
    var filename = baseDir+uuid.v1()+'.'+dirs[dirs.length -1];
    request("https:"+picUrl).pipe(fs.createWriteStream('pages/'+filename));
    rsHtml = rsHtml.replace(ms[i],'src="'+filename+'"');
  }

  var title = $('#firstHeading').text();
  fs.writeFileSync('./pages/'+title+'.html',rsHtml);
  console.log('抓取标题为…………'+title+'…………的页面成功。')
}



