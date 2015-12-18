var cheer = require('cheerio');
var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var spiderSingle = require('./spiderSingle.js');
var fs = require('fs');
var __ = require('lodash');

var allKeys = [];
var finished = [];
var keys = ['Category:%E9%A3%9B%E6%A9%9F'];    //Category:

var finishedFiles = fs.readdirSync('./pages','utf-8');
if(finishedFiles){
  finishedFiles.forEach(function(al){
    if(__.endsWith(al,'.html')){
      finished.push(al.split('.')[0])
    }
  })
}

var key = keys.shift();
(function doNext(key){

  data.get({
    url:key,
    qs:null
  }).then(function(downHtml){
    console.log('开始处理：'+decodeURI(key)+'，队列中还有'+keys.length+'个未处理。')

    $ = cheer.load(downHtml);
    $('.catlinks').remove();
    $('#topicpath').remove();
    $('.boilerplate').remove();
    $('.citation').remove();
    $('.reflist').remove();
    $('.navbox').remove();
    $('.mbox-small').remove()
    var filename = $('#firstHeading').text().replace('/','_');

    if(__.indexOf(finished,filename) == -1){
      finished.push(filename);
      if(key.indexOf('Category:') != -1){           //如果是分类，取页面有效链接
        var links = $('#bodyContent a');
        for(x in links){
          var title, href;
          if(typeof links[x].attribs !== 'undefined' && links[x].attribs.href !== undefined){
            title = links[x].attribs.href;
            if(title.indexOf('/wiki/') == 0){
              title = title.replace('/wiki/','');
              href = title;
              title = decodeURI(title).replace('/','_');
              var regNotExist = /页面不存在|编辑小节|php|wikipedia|\.|commons|Special|wikimedia|Portal|Template|模板/gi;
              if(regNotExist.test(title))
                continue;
              if(__.indexOf(allKeys,title) == -1){
                keys.push(href);
                allKeys.push(title);
                // console.log('add new key --------- '+title)
              }
            }
          }
        }
      }else{                                //如果是页面，抓取图片并存储
          spiderSingle(downHtml);
      }
    }else{
      console.log('跳过----处理----标题为：'+filename +' 的页面。')
    }

    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务顺利完成，共处理了'+allKeys.length+'个页面。')
    }
  }).catch(function(err){
    console.error("download ------- err ------- "+decodeURI(key));
    key = keys.shift();
    if(key){
      doNext(key);
    }else{
      console.log('抓取任务完成，共处理了'+allKeys.length+'个页面。')
    }
  })

})(key);

