const { db } = require("@vercel/postgres");
const { json } = require("stream/consumers");
const fs = require("fs");
const path = require("path");
const { exit } = require("process");

async function walkDirectory(dirPath, client) {
  const files = fs.readdirSync(dirPath);
  await Promise.all(
    files.map(async (filePath) => {
      console.log(`insert ${filePath} begin`);
      await insertFile(`${dirPath}/${filePath}`, client);
      console.log(`insert ${filePath} complete`);
    })
  );
}

async function seedWeibo(client) {
  // Create the "weibos" table if it doesn't exists
  await client.sql`
      CREATE TABLE IF NOT EXISTS weibos (
        id SERIAL PRIMARY KEY,
        content VARCHAR(255),
        href VARCHAR(400),
        date DATE
      );
    `;
  console.log(`Created "weibos" table`);
  await walkDirectory("./data", client);
}

let countInfo = {};

async function insertFile(filePath, client) {
  try {
    const fileData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileData);
    const weibos = jsonData.data.filter((item) => {
      item.date = jsonData.date;
      const key = `${jsonData.date.substr(0, 10)}-${item.title}`;
      if (countInfo[key] === undefined) {
        countInfo[key] = 1;
        return true;
      } else {
        return false;
      }
    });
    await insertMultiple(weibos, client);
    console.log(
      `Seeded ${jsonData.data.length} weibo items in ${jsonData.date}`
    );
  } catch (error) {
    console.error(`Error reading JSON file: ${error}`);
  }
}

async function testInsert(client) {
  let weibo = {
    href: "https://s.weibo.com/weibo?q=%23%E8%BF%99%E4%BB%BD%E4%B8%8D%E5%8F%98%E7%9A%84%E7%89%B5%E6%8C%82%E6%B8%A9%E6%9A%96%E4%BA%BA%E5%BF%83%23&Refer=new_time",
    title: "这份不变的牵挂温暖人心2",
    date: "2022-01-27 15:57 +0000",
  };
  await insert(weibo, client);
}

async function insert(weibo, client) {
  let sql = `INSERT INTO weibos(content,href,date)
        VALUES('${weibo.title}','${weibo.href}',to_date('${weibo.date}','YYYY-MM-DD'))`;
  console.log(`sql: ${sql} begin`);
  try {
    await client.query(sql);
    console.log(`sql: ${sql} success`);
  } catch (error) {
    console.error(`ERROR insert weibo file ${sql} ${error}`);
    exit(1);
  }
}

async function insertMultiple(weibos, client) {
  if (weibos.length === 0) {
    return; // No weibos to insert
  }

  const values = weibos
    .map(
      (weibo) =>
        `('${weibo.title}', '${weibo.href}', to_date('${weibo.date}', 'YYYY-MM-DD'))`
    )
    .join(", ");

  const sql = `INSERT INTO weibos (content, href, date) VALUES ${values}`;

  console.log(`sql: ${sql} begin`);

  try {
    await client.query(sql);
    console.log(`sql: ${sql} success`);
  } catch (error) {
    console.error(`ERROR insert weibo file ${sql} ${error}`);
    exit(1);
  }
}

async function main() {
    const client = await db.connect();
    await seedWeibo(client);
    await client.end();
}

export async function insertWeibo(filePath) {
    const client = await db.connect();
    await insertFile(filePath, client);
    await client.end();
}

// main().catch((err) => {
//   console.error(
//     "An error occurred while attempting to seed the database:",
//     err
//   );
// });
