// const cheerio = require("cheerio");

import * as cheerio from "cheerio";
import axios from "axios";
import * as fs from "fs";
import * as dayjs from "dayjs";
import * as timezone from 'dayjs/plugin/timezone' // 导入插件
import * as utc from 'dayjs/plugin/utc' // 导入插件

const path = {
  markdown: "markdown",
  data: "data",
};
class Element {
  title: string;
  href: string;
  constructor(title: string, href: string) {
    this.title = title;
    this.href = href;
  }
  toString(): string {
    return `title:${this.title} href:${this.href}`;
  }
}

function requestHot() {
  return axios.get("https://s.weibo.com/top/summary?cate=realtimehot", {
    headers: {
      cookie:
        "SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWawXashXUV0jJ6asTDNm0T; SUB=_2AkMWuqOaf8NxqwJRmP4XyGviZI10zAHEieKg5lJBJRMxHRl-yT8XqkEhtRB6PTqNdRNl2srRcYSRuDiYpmQ_pAi58gH3; _s_tentry=passport.weibo.com; Apache=6796928672649.46.1642474670986; SINAGLOBAL=6796928672649.46.1642474670986; ULV=1642474671041:1:1:1:6796928672649.46.1642474670986:",
    },
  });
}

function MakeElement(li: any): Element {
  var title = li.childNodes[1].children[3].firstChild.data;
  var href = `https://s.weibo.com${li.childNodes[1].attribs["href"]}`;
  return new Element(title, href);
}

function getHot(d: any): Array<Element> {
  return cheerio
    .load(d)("body > div > section > ul > li")
    .toArray()
    .map(MakeElement);
}

function generateMD(s: { date: string; data: Array<Element> }) {
  var md = `# ${s.date}`;
  s.data.forEach((item, index) => {
    md += `\n${index + 1}. [${item.title}](${item.href})`;
  });
  return md;
}

function mkdir(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

requestHot().then((res) => {
  const items = getHot(res.data);
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.tz.setDefault("China/Shanghai")
  const datestring = dayjs().format("YYYY-MM-DD HH:mm ZZ")
  const s = { date: datestring, data: items };
  mkdir(path.markdown);
  mkdir(path.data);
  fs.writeFileSync(
    `${path.data}/${datestring}.json`,
    JSON.stringify(s, null, 3)
  );
  fs.writeFileSync(`${path.markdown}/${datestring}.md`, generateMD(s));
});
