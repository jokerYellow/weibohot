const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

function requestHot() {
  return axios.get("https://s.weibo.com/top/summary?cate=realtimehot", {
    headers: {
      cookie:
        "SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWawXashXUV0jJ6asTDNm0T; SUB=_2AkMWuqOaf8NxqwJRmP4XyGviZI10zAHEieKg5lJBJRMxHRl-yT8XqkEhtRB6PTqNdRNl2srRcYSRuDiYpmQ_pAi58gH3; _s_tentry=passport.weibo.com; Apache=6796928672649.46.1642474670986; SINAGLOBAL=6796928672649.46.1642474670986; ULV=1642474671041:1:1:1:6796928672649.46.1642474670986:",
    },
  });
}

function Element(li) {
  this.title = li.childNodes[1].children[3].firstChild.data;
  this.href = `https://s.weibo.com${li.childNodes[1].attribs["href"]}`;
  this.toString = () => {
    return `title:${this.title} href:${this.href}`;
  };
}

function getHot(d) {
  const $ = cheerio.load(d);
  const section = $("body > div > section > ul > li");
  var rt = [];
  section.each((_, el) => {
    rt.push(new Element(el));
  });
  return rt;
}

function generateMD(s) {
  var md = `# ${s.date}`;
  s.data.forEach((item, index) => {
    md += `\n${index + 1}. [${item.title}](${item.href})`;
  });
  return md;
}

requestHot().then((res) => {
  const items = getHot(res.data);
  const d = new Date();
  var datestring =
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2) +
    " " +
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2);
  const s = { date: datestring, data: items };
  fs.writeFileSync(`origindata/${datestring}.json`, JSON.stringify(s, null, 3));
  fs.writeFileSync(`readable/${datestring}.md`, generateMD(s));
});
