var cheer = require('cheerio');
var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var spiderSingle = require('./spiderSingle.js');
var fs = require('fs');
var __ = require('lodash');

var keys = ['%E9%A3%9B%E6%A9%9F'];    //Category:

var key = keys.shift();
(function doNext(key){
  var tmp = key.split(',');
  var realKey = 'Category:'+tmp[tmp.length-1];

  data.get({
    url:realKey,
    qs:null
  }).then(function(downHtml){
    console.log('开始处理：【'+decodeURI(key)+'】分类，还有'+keys.length+'个分类未处理。')

    $ = cheer.load(downHtml);
    var links = $('#mw-subcategories a');       //子目录
    for(x in links){
      var href;
      if(typeof links[x].attribs !== 'undefined' && links[x].attribs.href !== undefined){
        href = links[x].attribs.href;
        if(href.indexOf('/wiki/') == 0){
          href = href.replace('/wiki/Category:','');
          keys.push(key+','+href);
          // console.log('add new Category --------- '+decodeURI(href))
        }
      }
    }

    links = $('#mw-pages a');       //页面
    for(x in links){
      var href;
      if(typeof links[x].attribs !== 'undefined' && links[x].attribs.href !== undefined){
        href = links[x].attribs.href;
        if(href.indexOf('/wiki/') == 0){
           href = href.replace('/wiki/','');
           var regNotExist = /页面不存在|编辑小节|php|wikipedia|\.|commons|Special|wikimedia|Portal|Template|模板/gi;
           if(regNotExist.test(href))
             continue;
           spiderSingle(downHtml,key);
           // console.log('download '+decodeURI(href)+'.html ok.')
        }
      }
    }

    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务顺利完成！')
    }
  }).catch(function(err){
    console.error("download ------- err ------- "+decodeURI(key));
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务完成了。')
    }
  })

})(key);

