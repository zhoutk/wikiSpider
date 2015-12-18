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

    $ = cheer.load(downHtml);
    var CaTitle = $('#firstHeading').text();
    var links = $('#mw-subcategories a');       //子目录
    var catCount = 0;
    for(x in links){
      var href;
      if(typeof links[x].attribs !== 'undefined' && links[x].attribs.href !== undefined){
        href = links[x].attribs.href;
        if(href.indexOf('/wiki/') == 0){
          href = href.replace('/wiki/Category:','');
          keys.push(key+','+href);
          catCount++;
          // console.log('add new Category --------- '+decodeURI(href))
        }
      }
    }
    console.log('分类【'+CaTitle+'】分析完成，新增子分类'+catCount+'个，还有'+keys.length+'个分类未处理。')

    links = $('#mw-pages a');       //页面
    var pageCount=0,errCount=0,downs=[];
    for(x in links){
      var href;
      if(typeof links[x].attribs !== 'undefined' && links[x].attribs.href !== undefined){
        href = links[x].attribs.href;
        if(href.indexOf('/wiki/') == 0){
          href = href.replace('/wiki/','');
          var regNotExist = /页面不存在|编辑小节|php|wikipedia|\.|commons|Special|wikimedia|Portal|Template|模板/gi;
          if(regNotExist.test(href))
            continue;
          downs.push(data.get({url:href,qs:null}));
        }
      }
    }

    Promise.all(downs).then(function(resp){
      resp.forEach(function(al){
        spiderSingle(al,decodeURI(key));
      })

      key = keys.shift();
      if(key){
        doNext(key);
      }else{
        console.log('抓取任务顺利完成！')
      }
    }).catch(function(err){
      console.error('download Pages err:')+err;
      key = keys.shift();
      if(key){
        doNext(key);
      }else{
        console.log('抓取任务顺利完成！')
      }
    })

    // console.log('分类【'+decodeURI(key)+'】页面下载成功了'+pageCount+'个，下载失败了'+errCount+'个。')

  }).catch(function(err){
    console.error('download Category 【'+decodeURI(key))+'】 err !';
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务完成了。')
    }
  })

})(key);

