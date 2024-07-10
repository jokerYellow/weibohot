import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { Client, db, VercelPoolClient } from "@vercel/postgres";

const cookieString =
  "SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWawXashXUV0jJ6asTDNm0T; SUB=_2AkMWuqOaf8NxqwJRmP4XyGviZI10zAHEieKg5lJBJRMxHRl-yT8XqkEhtRB6PTqNdRNl2srRcYSRuDiYpmQ_pAi58gH3; _s_tentry=passport.weibo.com; Apache=6796928672649.46.1642474670986; SINAGLOBAL=6796928672649.46.1642474670986; ULV=1642474671041:1:1:1:6796928672649.46.1642474670986:";

//define a weibo struct,contain author name,href,author id, content ,date and like number
class Weibo {
  authorName: string;
  href: string;
  authorId: string;
  content: string;
  retweetContent: string;
  date: Date;
  likeNumber: string;
  toString(): string {
    return `authorName:${this.authorName} href:${this.href} authorId:${this.authorId} content:${this.content} retweetContent:${this.retweetContent} date:${this.date} likeNumber:${this.likeNumber}`;
  }
}

async function fetchPageContent(
  url: string,
  cookies: puppeteer.Protocol.Network.CookieParam[]
): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 设置 Cookie
  await page.setCookie(...cookies);

  await page.goto(url, { waitUntil: "networkidle0" }); // 等待页面加载完成

  const content = await page.content();

  await browser.close();

  return content;
}

function parseCookieString(
  cookieString: string
): puppeteer.Protocol.Network.CookieParam[] {
  const cookies: puppeteer.Protocol.Network.CookieParam[] = [];

  const cookiePairs = cookieString.split(";");
  for (const pair of cookiePairs) {
    const [name, value] = pair.trim().split("=");
    if (name && value) {
      const cookie: puppeteer.Protocol.Network.CookieParam = {
        name: name.trim(),
        value: value.trim(),
        domain: "weibo.com", // 设置 domain 为 "weibo.com"
      };
      cookies.push(cookie);
    }
  }

  return cookies;
}

async function createTable(client: VercelPoolClient) {
  // const client = await db.connect();
  await client.query(
    `create table IF NOT EXISTS weibo(
    id serial primary key,
    authorName varchar(255),
    href varchar(255),
    authorId varchar(255),
    content text,
    retweetContent text,
    date DATE,
    likeNumber varchar(255));`
  );
}

async function getWeibos(url: string) {
  const cookies = parseCookieString(cookieString);
  console.log(cookies);

  const pageContent = await fetchPageContent(url, cookies);
  const $ = cheerio.load(pageContent);
  //#scroller > div.vue-recycle-scroller__item-wrapper > div.vue-recycle-scroller__item-view.xh-highlight
  const subDivs = $(
    "#scroller > div.vue-recycle-scroller__item-wrapper"
  ).children();

  // 遍历并处理子 div 元素
  const weibos = subDivs
    .map((index, element) => {
      return createWeiboObject($, element);
    })
    .toArray();
  weibos.forEach((weibo, index) => {
    console.log(index, ",", weibo);
  });
  return weibos;
}

function createWeiboObject($: cheerio.CheerioAPI, element: cheerio.Element) {
  let weibo = new Weibo();
  weibo.date = new Date();
  const href = $(element)
    .find(
      "div > article > div > header > div.woo-box-item-flex.head_main_3DRDm > div > div.woo-box-flex.woo-box-alignCenter.woo-box-justifyCenter.head-info_info_2AspQ > a"
    )
    .attr("href");
  const authorName = $(element)
    .find(
      "div > article > div > header > div.woo-box-item-flex.head_main_3DRDm > div > div.woo-box-flex.woo-box-alignCenter.head_nick_1yix2 > a > span"
    )
    .text();
  weibo.href = href ?? "";
  weibo.authorName = authorName ?? "";
  weibo.content = $(element)
    .find("div > article > div > div.wbpro-feed-content")
    .text();
  weibo.retweetContent = $(element)
    .find("div > article > div > div.retweet")
    .text();
  weibo.likeNumber = $(element)
    .find(
      "div > article > footer > div > div > div > div:nth-child(3) > div > button > span.woo-like-count"
    )
    .text();
  weibo.authorId =
    $(element)
      .find(
        "div > article > div > header > div.woo-box-item-flex.head_main_3DRDm > div > div.woo-box-flex.woo-box-alignCenter.head_nick_1yix2 > a"
      )
      .attr("usercard") ?? "";
  return weibo;
}

// Usage
const urls = [
  "https://weibo.com/u/1497035431",
  "https://weibo.com/u/1401527553",
  "https://weibo.com/u/6827625527",
];

async function main() {
  const client = await db.connect();
  console.log("connected to db");
  await createTable(client);
  console.log("created table");
  urls.forEach(async (url) => {
    const weibos = await getWeibos(url);
    insertWeibos(weibos, client);
  });
  client.release();
}

async function insertWeibos(weibos: Weibo[], client: VercelPoolClient) {
  for (const weibo of weibos) {
    const existingWeibo = await client.query(
      `select * from weibo where href = $1`,
      [weibo.href]
    );

    if (existingWeibo.rows.length === 0) {
      await client.query(
        `insert into weibo(authorName,href,authorId,content,retweetContent,date,likeNumber) values($1,$2,$3,$4,$5,$6,$7)`,
        [
          weibo.authorName,
          weibo.href,
          weibo.authorId,
          weibo.content,
          weibo.retweetContent,
          weibo.date.toISOString(),
          weibo.likeNumber,
        ]
      );
    }
    console.log("inserted weibo", weibo);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
