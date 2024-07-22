import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { db, VercelPoolClient } from "@vercel/postgres";
import { setTimeout } from "node:timers/promises";

const cookieString =
  "SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWawXashXUV0jJ6asTDNm0T; SUB=_2AkMWuqOaf8NxqwJRmP4XyGviZI10zAHEieKg5lJBJRMxHRl-yT8XqkEhtRB6PTqNdRNl2srRcYSRuDiYpmQ_pAi58gH3; _s_tentry=passport.weibo.com; Apache=6796928672649.46.1642474670986; SINAGLOBAL=6796928672649.46.1642474670986; ULV=1642474671041:1:1:1:6796928672649.46.1642474670986:";

//define a weibo struct,contain author name,href,author id, content ,date and like number
class Weibo {
  authorName: string;
  href: string;
  authorId: string;
  content: string;
  retweetContent: string;
  retweetAuther: string;
  date: Date;
  likeNumber: string;
  toString(): string {
    return `authorName:${this.authorName} href:${this.href} authorId:${this.authorId} content:${this.content} retweetContent:${this.retweetContent} date:${this.date} likeNumber:${this.likeNumber} retweetAuthor:${this.retweetAuther}`;
  }
}

async function fetchWeibosFromAuthorURL(
  url: string,
  cookies: puppeteer.Protocol.Network.CookieParam[]
): Promise<Weibo[]> {
  let result = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 设置 Cookie
  await page.setCookie(...cookies);

  await page.goto(url, { waitUntil: "networkidle0" }); // 等待页面加载完成
  const firstFrameWeibos = await getWeibosFrom(await page.content());
  if (firstFrameWeibos.length > 0) {
    result.push(...firstFrameWeibos);
  }
  for (let i = 0; i < 2; i++) {
    console.log(`scrolling ${i}`);
    //page scroll twice to get more weibos
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight - 300);
    });
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight - 300);
    });
    await setTimeout(3000);
    const content = await page.content();
    const wb = await getWeibosFrom(content);
    if (wb.length > 0) {
      wb.forEach((weibo) => {
        if (!result.find((item) => item.href === weibo.href)) {
          result.push(weibo);
        }
      });
    }
  }
  await browser.close();

  return result;
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

//alert table add a new column retweenAuthor

async function createTable(client: VercelPoolClient) {
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
  await client.query(
    `DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'weibo' 
        AND column_name = 'retweetAuthor'
    ) THEN
        ALTER TABLE weibo ADD COLUMN retweetAuthor VARCHAR(255);
    END IF;
END
$$;`
  );
}

export async function getWeibos(url: string) {
  const cookies = parseCookieString(cookieString);
  console.log(cookies);
  const weibos = await fetchWeibosFromAuthorURL(url, cookies);
  return weibos;
}

function getWeiboLinksFrom(content: string) {
  const $ = cheerio.load(content);
  let result = [];
  $("article").each((index, element) => {
    const href = $(element)
      .find(
        "div > header > div.woo-box-item-flex.head_main_3DRDm > div > div.woo-box-flex.woo-box-alignCenter.woo-box-justifyCenter.head-info_info_2AspQ > a"
      )
      .attr("href");
    console.log("get weibo link: ", href);
    if (href.length > 0) {
      result.push(href);
    }
  });
  return result;
}

let catchedLinks = new Set();

async function getWeibosFrom(pageContent: string) {
  const links = getWeiboLinksFrom(pageContent);
  let result = [];
  for (const link of links) {
    if (catchedLinks.has(link)) {
      console.log(`skip ${link}`);
      continue;
    }
    try {
      const weibo = await fetchWeiboDetail(link);
      if (weibo.href.length > 0) {
        result.push(weibo);
        catchedLinks.add(link);
      } else {
        console.error(`failed to fetch weibo from ${link}`);
      }
    } catch (e) {
      console.error(`failed to fetch weibo from ${link}`);
    }
  }
  return result;
}

async function main() {
  console.log("created table");
  let weibos = [];
  for (const url of urls) {
    const items = await getWeibos(url);
    console.log("weibos ", items.length, " ", items);
    weibos.push(...items);
  }
  console.log("connect to db");
  const client = await db.connect();
  console.log("insert weibos");
  await insertWeibos(weibos, client);
  console.log("insert weibos success");
  client.release();
}

async function insertWeibos(weibos: Weibo[], client: VercelPoolClient) {
  for (const weibo of weibos) {
    await insertWeibo(weibo, client);
  }
}

export async function insertWeibo(weibo: Weibo, client: VercelPoolClient) {
  const existingWeibo = await client.query(
    `select * from weibo where href = $1`,
    [weibo.href]
  );

  if (existingWeibo.rows.length === 0) {
    await client.query(
      `insert into weibo(authorName,href,authorId,content,retweetContent,date,likeNumber,retweetAuthor) values($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        weibo.authorName,
        weibo.href,
        weibo.authorId,
        weibo.content,
        weibo.retweetContent,
        weibo.date.toISOString(),
        weibo.likeNumber,
        weibo.retweetAuther,
      ]
    );
  }
  console.log("inserted weibo", weibo);
}

export async function fetchWeiboDetail(url: string): Promise<Weibo> {
  const cookies = parseCookieString(cookieString);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let result = new Weibo();
  // 设置 Cookie
  await page.setCookie(...cookies);
  console.log("fetching weibo detail from ", url);
  await page.goto(url, { waitUntil: "networkidle0" }); // 等待页面加载完成
  await setTimeout(3000);

  const $ = cheerio.load(await page.content());
  const article = $("article");
  result.href = url;
  const datestring = article
    .find(
      "div.Feed_body_3R0rO > header > div.woo-box-item-flex.head_main_3DRDm > div > div.woo-box-flex.woo-box-alignCenter.woo-box-justifyCenter.head-info_info_2AspQ > a"
    )
    .text();
  result.date = parseDateString(datestring);
  result.content = $(".wbpro-feed-content").text();
  result.retweetContent = $(".retweet").text();
  result.authorName = article
    .find("div > header > div> div > div> a > span")
    .text();
  result.authorId =
    article.find("div > header > div > div > div> a").attr("usercard") ?? "";
  result.likeNumber = article.find(".woo-like-count").text();
  result.retweetAuther = $(".retweet").find(".detail_nick_u-ffy").text();
  result.retweetContent = $(".retweet").find(".detail_wbtext_4CRf9").text();
  await browser.close();

  return result;
}

// Usage
const urls = [
  "https://weibo.com/u/1497035431",
  "https://weibo.com/u/1401527553",
  "https://weibo.com/u/6827625527",
];

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export function parseDateString(dateString: string): Date {
  // Trim the string to remove leading and trailing spaces
  dateString = dateString.trim();

  // Split date and time
  const [datePart, timePart] = dateString.split(" ");

  // Split the date into day, month, and year
  const [year, month, day] = datePart
    .split("-")
    .map((num) => parseInt(num, 10));

  // Split the time into hour and minute
  const [hour, minute] = timePart.split(":").map((num) => parseInt(num, 10));

  // Create a new Date object using the parsed components
  // Note: Month is 0-indexed, subtract 1 from the month
  // Adjust the year to four digits if necessary
  const fullYear = year < 100 ? year + 2000 : year;
  const date = new Date(fullYear, month - 1, day, hour, minute);
  // Adjust for GMT-8
  const offsetHours = 8; // GMT-8
  date.setHours(date.getHours() + offsetHours);

  return date;
}
