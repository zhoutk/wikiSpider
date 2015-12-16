var cheer = require('cheerio');
var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var spiderSingle = require('./spiderSingle.js');
var allKeys = ['航空母舰'];
var keys = ['航空母舰'];

var key = keys.shift();
(function doNext(key){

  data.get({
    url:encodeURI(key),
    qs:null
  }).then(function(downHtml){
    console.log("down:"+key+"..."+keys.length);
    $ = cheer.load(downHtml);
    var links = $('#bodyContent a');
    for(x in links){
      var title = undefined;
      if(typeof links[x].attribs !== 'undefined' && links[x].attribs.title !== 'undefined'){
        title = links[x].attribs.title;
        var reg = /[:|：|(|)（|）]/;
        if(reg.test(title))
          continue;
        if(title && title.indexOf(key)>-1 && !existsInKeys(title)){
          keys.push(title);
          allKeys.push(title);
          console.log(title)
        }
      }
    }
    spiderSingle(downHtml);
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务顺利完成。')
    }
  }).catch(function(err){
    console.error("download err:"+key);
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务顺利完成。')
    }
  })

})(key);

function existsInKeys(key){
  for(var i=0;i<allKeys.length;i++){
    if(allKeys[i]==key){
      return true;
    }
  }
  return false;
}
