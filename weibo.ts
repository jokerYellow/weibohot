import * as puppeteer from "puppeteer";
import * as cheerio from "cheerio";

//define a weibo struct,contain author name,href,author id, content ,date and like number
class Weibo {
  authorName: string;
  href: string;
  authorId: string;
  content: string;
  retweetContent: string;
  date: string;
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

// Usage
const url = "https://weibo.com/u/1497035431"; // 替换为您要抓取的网页URL

const cookieString =
  "SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWawXashXUV0jJ6asTDNm0T; SUB=_2AkMWuqOaf8NxqwJRmP4XyGviZI10zAHEieKg5lJBJRMxHRl-yT8XqkEhtRB6PTqNdRNl2srRcYSRuDiYpmQ_pAi58gH3; _s_tentry=passport.weibo.com; Apache=6796928672649.46.1642474670986; SINAGLOBAL=6796928672649.46.1642474670986; ULV=1642474671041:1:1:1:6796928672649.46.1642474670986:";

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

const cookies = parseCookieString(cookieString);
console.log(cookies);

fetchPageContent(url, cookies)
  .then((pageContent) => {
    const $ = cheerio.load(pageContent);
    //#scroller > div.vue-recycle-scroller__item-wrapper > div.vue-recycle-scroller__item-view.xh-highlight
    const subDivs = $(
      "#scroller > div.vue-recycle-scroller__item-wrapper"
    ).children();

    // 遍历并处理子 div 元素
    const weibos = subDivs
      .map((index, element) => {
        let weibo = new Weibo();
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
      })
      .toArray();
    weibos.forEach((weibo, index) => {
      console.log(index, ",", weibo);
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
