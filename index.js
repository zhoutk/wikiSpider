var cheer = require('cheerio');
var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var spiderSingle = require('./spiderSingle.js');
var __ = require('lodash');

var regKey = /航空母舰|航母/;
var allKeys = [];
var finished = [];
var keys = ['%E8%88%AA%E7%A9%BA%E6%AF%8D%E8%88%B0'];    //Category:

var key = keys.shift();
(function doNext(key){

  data.get({
    url:key,
    qs:null
  }).then(function(downHtml){
    console.log('开始处理：'+decodeURI(key)+'，队列中还有'+keys.length+'个未处理。')

    $ = cheer.load(downHtml);
    var filename = $('#firstHeading').text();

    if(__.indexOf(finished,filename) == -1){
      finished.push(filename);
      var links = $('#bodyContent a');
      for(x in links){
        var title, href;
        if(typeof links[x].attribs !== 'undefined' && links[x].attribs.title !== 'undefined' && links[x].attribs.href !== 'undefined'){
          title = links[x].attribs.title;
          href = links[x].attribs.href;
          var regNotExist = /页面不存在|编辑小节/;
          if(regNotExist.test(title))
            continue;
          if(title && href && regKey.test(title) && __.indexOf(allKeys,title) == -1){
            href = href.split('/')[href.split('/').length-1];
            keys.push(href);
            allKeys.push(title);
            // console.log('add new key --------- '+title)
          }
        }
      }

      if(!(/:|：/.test(key))){
        spiderSingle(downHtml);
      }else{
        console.log('跳过--存储--标题为：'+filename +' 的页面。')
      }
    }else{
      console.log('跳过**处理**标题为：'+filename +' 的页面。')
    }

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

