import { db } from "@vercel/postgres";
import { fetchWeiboDetail, getWeibos, insertWeibo, parseDateString } from "./weibo";

async function main() {
  const url = "https://weibo.com/u/1401527553";//tombkeeper
  const weibos = await getWeibos(url);
  console.log(`catch ${weibos.length} weibos`);
}


async function mainDetail() {
  const url = "https://weibo.com/1497035431/Oo5RDhbbi";
  const weibo = await fetchWeiboDetail(url);
  console.log(weibo);
}

async function mainDetailWithRetweet() {
  const url = "https://weibo.com/1497035431/Oo6tQyyPk";
  const weibo = await fetchWeiboDetail(url);
  const client = await db.connect();
  await client.query(`delete from weibo where href = '${url}'`);
  await insertWeibo(weibo,client);
  client.release();
  console.log(weibo);
}

main().catch(console.error);