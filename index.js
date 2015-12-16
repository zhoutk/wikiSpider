var cheer = require('cheerio');
var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var spiderSingle = require('./spiderSingle.js');
var regKey = ['航空母舰','航母'];
var allKeys = [];
var keys = ['Category:%E8%88%AA%E7%A9%BA%E6%AF%8D%E8%88%B0'];

var key = keys.shift();
(function doNext(key){

  data.get({
    url:key,
    qs:null
  }).then(function(downHtml){
    console.log('开始处理：'+decodeURI(key)+'，队列中还有'+keys.length+'个未处理。')
    $ = cheer.load(downHtml);
    var links = $('#bodyContent a');
    for(x in links){
      var title, href;
      if(typeof links[x].attribs !== 'undefined' && links[x].attribs.title !== 'undefined' && links[x].attribs.href !== 'undefined'){
        title = links[x].attribs.title;
        href = links[x].attribs.href;
        var regNotExist = /页面不存在/;
        if(regNotExist.test(title))
          continue;
        if(title && href && includeKeys(title) && !existsInKeys(title)){
          href = href.split('/')[href.split('/').length-1];
          keys.push(href);
          allKeys.push(title);
          // console.log(title)
        }
      }
    }
    if(!(/[:|：]/.test(key)))
      spiderSingle(downHtml);
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务顺利完成。')
    }
  }).catch(function(err){
    console.error("download ------- err ------- "+decodeURI(key));
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务顺利完成，共处理了'+allKeys.length+'个页面。')
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

function includeKeys(key){
  for(var i=0;i<regKey.length;i++){
    if(key.indexOf(regKey[i])>-1){
      return true;
    }
  }
  return false;
}
