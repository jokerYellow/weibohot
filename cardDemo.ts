/**
 * 卡片演示工具 - 生成美观的微博卡片展示
 * Card Demo Utility - Generate beautiful weibo card displays
 */

import { generateHTMLCard, generateMarkdownCard, generateStyledHTMLPage, generateCompactCard } from './cardFormatter';
import { db } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

interface WeiboData {
  authorname: string;
  href: string;
  authorid: string;
  content: string;
  retweetcontent: string;
  retweetauthor: string;
  date: Date;
  likenumber: string;
}

/**
 * 从数据库获取微博数据
 * Fetch weibo data from database
 */
export async function fetchWeiboFromDatabase(limit: number = 10): Promise<WeiboData[]> {
  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT authorname, href, authorid, content, retweetcontent, retweetauthor, date, likenumber 
      FROM weibo 
      ORDER BY date DESC 
      LIMIT $1
    `, [limit]);
    
    client.release();
    return result.rows;
  } catch (error) {
    console.error('Error fetching weibo data:', error);
    return [];
  }
}

/**
 * 生成示例微博数据（用于测试）
 * Generate sample weibo data for testing
 */
function generateSampleData(): WeiboData[] {
  return [
    {
      authorname: "科技日报",
      href: "https://weibo.com/example1",
      authorid: "kejiribaoa",
      content: "🚀 重大突破！我国科学家在量子计算领域取得新进展，成功实现了256位量子比特的稳定操控。这一成果将为人工智能、密码学等领域带来革命性变化。\n\n这项研究历时3年，团队克服了量子退相干、错误校正等技术难题，为构建实用化量子计算机奠定了重要基础。",
      retweetcontent: "量子计算的春天来了！期待这项技术能够早日应用到实际生活中，改变我们的世界。",
      retweetauthor: "量子科技爱好者",
      date: new Date('2024-01-15T10:30:00'),
      likenumber: "1.2万"
    },
    {
      authorname: "人民日报",
      href: "https://weibo.com/example2", 
      authorid: "renminribao",
      content: "💡 教育部发布重要通知：全面推进义务教育优质均衡发展，确保每个孩子都能享受公平而有质量的教育。\n\n重点措施包括：\n✅ 加强师资队伍建设\n✅ 完善教学设施配置\n✅ 推进信息化教学\n✅ 建立长效保障机制",
      retweetcontent: "",
      retweetauthor: "",
      date: new Date('2024-01-14T15:45:00'),
      likenumber: "8.5万"
    },
    {
      authorname: "央视新闻",
      href: "https://weibo.com/example3",
      authorid: "yangshixinwen", 
      content: "🌍 联合国气候变化大会传来好消息！多国承诺加大清洁能源投资，共同应对全球气候挑战。\n\n中国代表团表示，将继续坚持绿色发展道路，力争2030年前实现碳达峰，2060年前实现碳中和目标。",
      retweetcontent: "地球是我们共同的家园，保护环境人人有责！支持绿色发展，从我做起。🌱",
      retweetauthor: "环保志愿者小王",
      date: new Date('2024-01-13T20:15:00'),
      likenumber: "15.6万"
    }
  ];
}

/**
 * 转换数据格式
 * Convert data format
 */
function convertToCardFormat(data: WeiboData[]): any[] {
  return data.map(item => ({
    authorName: item.authorname,
    href: item.href,
    authorId: item.authorid, 
    content: item.content,
    retweetContent: item.retweetcontent || '',
    retweetAuther: item.retweetauthor || '',
    date: item.date,
    likeNumber: item.likenumber || '0'
  }));
}

/**
 * 生成并保存HTML卡片页面
 * Generate and save HTML card page
 */
export async function generateCardDemo(): Promise<void> {
  try {
    console.log('📋 正在生成微博卡片演示...');
    
    // 尝试从数据库获取数据，如果失败则使用示例数据
    let weiboData: WeiboData[];
    try {
      weiboData = await fetchWeiboFromDatabase(10);
      if (weiboData.length === 0) {
        console.log('⚠️  数据库中没有数据，使用示例数据');
        weiboData = generateSampleData();
      } else {
        console.log(`✅ 从数据库获取到 ${weiboData.length} 条微博数据`);
      }
    } catch (error) {
      console.log('⚠️  无法连接数据库，使用示例数据');
      weiboData = generateSampleData();
    }
    
    const cardData = convertToCardFormat(weiboData);
    
    // 创建输出目录
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 生成完整HTML页面
    const htmlPage = generateStyledHTMLPage(cardData, '微博热点卡片展示');
    fs.writeFileSync(path.join(outputDir, 'weibo-cards.html'), htmlPage, 'utf8');
    console.log('✅ HTML卡片页面已生成: output/weibo-cards.html');
    
    // 生成单个HTML卡片示例
    if (cardData.length > 0) {
      const singleCard = generateHTMLCard(cardData[0]);
      const singleCardPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微博卡片示例</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; }
        ${fs.readFileSync(path.join(__dirname, 'cardFormatter.ts'), 'utf8').match(/getCardStyles\(\): string \{[\s\S]*?return `([\s\S]*?)`;/)?.[1] || ''}
    </style>
</head>
<body>
    <div class="container">
        ${singleCard}
    </div>
</body>
</html>`;
      fs.writeFileSync(path.join(outputDir, 'single-card.html'), singleCardPage, 'utf8');
      console.log('✅ 单个卡片示例已生成: output/single-card.html');
    }
    
    // 生成Markdown格式
    const markdownCards = cardData.map(generateMarkdownCard).join('\n');
    const markdownPage = `# 微博热点卡片展示

> 这里展示了经过美化的微博卡片格式，提供更好的阅读体验。

${markdownCards}

---

*生成时间: ${new Date().toLocaleString('zh-CN')}*
`;
    fs.writeFileSync(path.join(outputDir, 'weibo-cards.md'), markdownPage, 'utf8');
    console.log('✅ Markdown卡片已生成: output/weibo-cards.md');
    
    // 生成紧凑版卡片
    const compactCards = cardData.map(generateCompactCard).join('\n');
    const compactPage = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微博紧凑卡片</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; }
        .compact-card { background: white; border-radius: 8px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .compact-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .compact-author { font-weight: 600; color: #2c3e50; }
        .compact-date { color: #7f8c8d; font-size: 0.9rem; }
        .compact-content { color: #34495e; line-height: 1.5; margin-bottom: 8px; }
        .compact-footer { display: flex; justify-content: space-between; align-items: center; }
        .compact-likes { color: #e74c3c; font-size: 0.9rem; }
        .compact-link { color: #3498db; text-decoration: none; font-size: 0.9rem; }
        .compact-link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>微博紧凑卡片展示</h1>
        ${compactCards}
    </div>
</body>
</html>`;
    fs.writeFileSync(path.join(outputDir, 'compact-cards.html'), compactPage, 'utf8');
    console.log('✅ 紧凑版卡片已生成: output/compact-cards.html');
    
    console.log('\n🎉 所有卡片格式演示文件已生成完成！');
    console.log('📁 输出目录: output/');
    console.log('📄 文件列表:');
    console.log('   - weibo-cards.html (完整卡片页面)');
    console.log('   - single-card.html (单个卡片示例)');
    console.log('   - weibo-cards.md (Markdown格式)');
    console.log('   - compact-cards.html (紧凑版卡片)');
    
  } catch (error) {
    console.error('❌ 生成卡片演示时出错:', error);
  }
}

// 如果直接运行此文件，则执行演示
if (require.main === module) {
  generateCardDemo().catch(console.error);
}