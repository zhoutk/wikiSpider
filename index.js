var Promise = require('promise');
var data = require('promised-rest-client')({url: 'https://zh.wikipedia.org/zh-cn/'});
var spiderSingle = require('./spiderSingle.js');

data.get({
  url:encodeURI('航空母舰'),
  qs:null
}).then(function(downHtml){
  spiderSingle(downHtml);
});

