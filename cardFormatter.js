"use strict";
/**
 * 卡片格式化器 - 将微博数据格式化为美观的卡片
 * Card Formatter - Format weibo data into aesthetically pleasing cards
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHTMLCard = generateHTMLCard;
exports.generateMarkdownCard = generateMarkdownCard;
exports.generateStyledHTMLPage = generateStyledHTMLPage;
exports.generateCompactCard = generateCompactCard;
/**
 * 生成HTML格式的微博卡片
 * Generate HTML formatted weibo card
 */
function generateHTMLCard(weibo) {
    const formattedDate = new Date(weibo.date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    const hasRetweet = weibo.retweetContent && weibo.retweetContent.trim() !== '';
    return `
<div class="weibo-card">
  <div class="card-header">
    <div class="author-info">
      <div class="author-name">${escapeHtml(weibo.authorName)}</div>
      <div class="author-id">@${escapeHtml(weibo.authorId)}</div>
    </div>
    <div class="post-date">${formattedDate}</div>
  </div>
  
  <div class="card-content">
    <div class="main-content">
      ${escapeHtml(weibo.content).replace(/\n/g, '<br>')}
    </div>
    
    ${hasRetweet ? `
    <div class="retweet-section">
      <div class="retweet-header">
        <span class="retweet-icon">🔄</span>
        <span class="retweet-author">@${escapeHtml(weibo.retweetAuther)}</span>
      </div>
      <div class="retweet-content">
        ${escapeHtml(weibo.retweetContent).replace(/\n/g, '<br>')}
      </div>
    </div>
    ` : ''}
  </div>
  
  <div class="card-footer">
    <div class="engagement">
      <span class="like-count">
        <span class="like-icon">❤️</span>
        ${weibo.likeNumber || '0'}
      </span>
    </div>
    <a href="${escapeHtml(weibo.href)}" class="view-original" target="_blank">
      查看原文 →
    </a>
  </div>
</div>`;
}
/**
 * 生成Markdown格式的微博卡片
 * Generate Markdown formatted weibo card
 */
function generateMarkdownCard(weibo) {
    const formattedDate = new Date(weibo.date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    const hasRetweet = weibo.retweetContent && weibo.retweetContent.trim() !== '';
    let markdown = `
---

## 👤 ${weibo.authorName}
**@${weibo.authorId}** • ${formattedDate}

### 📝 内容

${weibo.content}
`;
    if (hasRetweet) {
        markdown += `
### 🔄 转发内容

> **@${weibo.retweetAuther}**
> 
> ${weibo.retweetContent.split('\n').map(line => `> ${line}`).join('\n')}
`;
    }
    markdown += `
### 📊 互动数据

❤️ ${weibo.likeNumber || '0'} 个赞

🔗 [查看原文](${weibo.href})

---
`;
    return markdown;
}
/**
 * 生成带样式的完整HTML页面
 * Generate complete HTML page with styles
 */
function generateStyledHTMLPage(weibos, title = "微博卡片") {
    const cardsHtml = weibos.map(generateHTMLCard).join('\n');
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        ${getCardStyles()}
    </style>
</head>
<body>
    <div class="container">
        <h1 class="page-title">${escapeHtml(title)}</h1>
        <div class="cards-container">
            ${cardsHtml}
        </div>
    </div>
</body>
</html>`;
}
/**
 * 获取卡片样式
 * Get card styles
 */
function getCardStyles() {
    return `
    * {
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
        line-height: 1.65;
        color: #2c3e50;
        background: linear-gradient(135deg, #a8e6cf 0%, #88d8c0 25%, #78c2ad 50%, #67b99a 75%, #56ab91 100%);
        margin: 0;
        padding: 24px;
        min-height: 100vh;
    }
    
    .container {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .page-title {
        text-align: center;
        color: white;
        margin-bottom: 30px;
        font-size: 2.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .cards-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .weibo-card {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 12px 40px rgba(86, 171, 145, 0.15), 0 4px 12px rgba(86, 171, 145, 0.1);
        padding: 28px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(20px);
        position: relative;
        overflow: hidden;
    }
    
    .weibo-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #a8e6cf, #67b99a, #56ab91);
        border-radius: 20px 20px 0 0;
    }
    
    .weibo-card:hover {
        transform: translateY(-6px) scale(1.01);
        box-shadow: 0 20px 60px rgba(86, 171, 145, 0.25), 0 8px 20px rgba(86, 171, 145, 0.15);
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid rgba(168, 230, 207, 0.3);
        position: relative;
    }
    
    .card-header::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, #67b99a, #56ab91);
        border-radius: 1px;
    }
    
    .author-info {
        flex: 1;
    }
    
    .author-name {
        font-size: 1.15rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 6px;
        letter-spacing: 0.02em;
    }
    
    .author-id {
        font-size: 0.9rem;
        color: #67b99a;
        font-weight: 500;
    }
    
    .post-date {
        font-size: 0.85rem;
        color: #7f8c8d;
        white-space: nowrap;
        background: rgba(168, 230, 207, 0.15);
        padding: 4px 8px;
        border-radius: 8px;
        font-weight: 500;
    }
    
    .card-content {
        margin-bottom: 20px;
    }
    
    .main-content {
        font-size: 1.05rem;
        line-height: 1.75;
        color: #2c3e50;
        margin-bottom: 18px;
        letter-spacing: 0.01em;
    }
    
    .retweet-section {
        background: linear-gradient(135deg, rgba(168, 230, 207, 0.1) 0%, rgba(103, 185, 154, 0.08) 100%);
        border-left: 4px solid #67b99a;
        border-radius: 12px;
        padding: 20px;
        margin-top: 18px;
        position: relative;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }
    
    .retweet-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, #67b99a, transparent);
    }
    
    .retweet-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        font-size: 0.9rem;
        color: #56ab91;
        font-weight: 600;
    }
    
    .retweet-icon {
        margin-right: 8px;
        font-size: 1rem;
    }
    
    .retweet-content {
        color: #5a6c7d;
        font-size: 0.98rem;
        line-height: 1.65;
        font-style: italic;
    }
    
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 2px solid rgba(168, 230, 207, 0.3);
        position: relative;
    }
    
    .card-footer::before {
        content: '';
        position: absolute;
        top: -2px;
        right: 0;
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, #56ab91, #67b99a);
        border-radius: 1px;
    }
    
    .engagement {
        display: flex;
        gap: 16px;
    }
    
    .like-count {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #e91e63;
        font-size: 0.95rem;
        font-weight: 600;
        background: rgba(233, 30, 99, 0.1);
        padding: 6px 12px;
        border-radius: 20px;
    }
    
    .like-icon {
        font-size: 1.1rem;
        animation: heartbeat 2s ease-in-out infinite;
    }
    
    @keyframes heartbeat {
        0%, 50%, 100% { transform: scale(1); }
        25% { transform: scale(1.1); }
        75% { transform: scale(1.05); }
    }
    
    .view-original {
        color: #56ab91;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid #56ab91;
        background: rgba(86, 171, 145, 0.1);
    }
    
    .view-original:hover {
        background: #56ab91;
        color: white;
        text-decoration: none;
        border-color: #56ab91;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(86, 171, 145, 0.3);
    }
    
    @media (max-width: 768px) {
        .container {
            padding: 0 16px;
        }
        
        .weibo-card {
            padding: 20px;
            margin: 0 -8px;
        }
        
        .page-title {
            font-size: 2rem;
        }
        
        .card-header {
            flex-direction: column;
            gap: 8px;
        }
        
        .card-footer {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
        }
    }
  `;
}
/**
 * HTML转义函数
 * HTML escape function
 */
function escapeHtml(text) {
    if (typeof text !== 'string')
        return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
/**
 * 生成简洁版卡片（用于列表显示）
 * Generate compact card for list display
 */
function generateCompactCard(weibo) {
    const formattedDate = new Date(weibo.date).toLocaleDateString('zh-CN');
    return `
<div class="compact-card">
  <div class="compact-header">
    <span class="compact-author">${escapeHtml(weibo.authorName)}</span>
    <span class="compact-date">${formattedDate}</span>
  </div>
  <div class="compact-content">
    ${escapeHtml(weibo.content.substring(0, 120))}${weibo.content.length > 120 ? '...' : ''}
  </div>
  <div class="compact-footer">
    <span class="compact-likes">❤️ ${weibo.likeNumber || '0'}</span>
    <a href="${escapeHtml(weibo.href)}" class="compact-link">查看详情</a>
  </div>
</div>`;
}
