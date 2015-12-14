var jsdom = require("jsdom");
var fs = require("fs");
var jquery = fs.readFileSync("./jquery.js", "utf-8");

jsdom.env({
  url: "https://en.wikipedia.org/wiki/Aircraft_carrier",
  src: [jquery],
  done: function (err, window) {
    var $ = window.$;
    $("html").each(function () {
      var detail = $(this).html();

    });
  }
});
