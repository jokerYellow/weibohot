/**
 * 卡片格式化器 - 将微博数据格式化为美观的卡片
 * Card Formatter - Format weibo data into aesthetically pleasing cards
 */

interface WeiboCard {
  authorName: string;
  href: string;
  authorId: string;
  content: string;
  retweetContent: string;
  retweetAuther: string;
  date: Date;
  likeNumber: string;
}

/**
 * 生成HTML格式的微博卡片
 * Generate HTML formatted weibo card
 */
export function generateHTMLCard(weibo: WeiboCard): string {
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
export function generateMarkdownCard(weibo: WeiboCard): string {
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
export function generateStyledHTMLPage(weibos: WeiboCard[], title: string = "微博卡片"): string {
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
function getCardStyles(): string {
  return `
    * {
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        padding: 20px;
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
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        padding: 24px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .weibo-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    }
    
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
    }
    
    .author-info {
        flex: 1;
    }
    
    .author-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 4px;
    }
    
    .author-id {
        font-size: 0.9rem;
        color: #7f8c8d;
    }
    
    .post-date {
        font-size: 0.85rem;
        color: #95a5a6;
        white-space: nowrap;
    }
    
    .card-content {
        margin-bottom: 16px;
    }
    
    .main-content {
        font-size: 1rem;
        line-height: 1.7;
        color: #2c3e50;
        margin-bottom: 16px;
    }
    
    .retweet-section {
        background: #f8f9fa;
        border-left: 4px solid #3498db;
        border-radius: 8px;
        padding: 16px;
        margin-top: 16px;
    }
    
    .retweet-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 0.9rem;
        color: #3498db;
        font-weight: 500;
    }
    
    .retweet-icon {
        margin-right: 8px;
    }
    
    .retweet-content {
        color: #5a6c7d;
        font-size: 0.95rem;
        line-height: 1.6;
    }
    
    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #eee;
    }
    
    .engagement {
        display: flex;
        gap: 16px;
    }
    
    .like-count {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #e74c3c;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .like-icon {
        font-size: 1rem;
    }
    
    .view-original {
        color: #3498db;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 6px;
        transition: background-color 0.2s ease;
    }
    
    .view-original:hover {
        background-color: #ecf0f1;
        text-decoration: none;
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
function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  
  const map: { [key: string]: string } = {
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
export function generateCompactCard(weibo: WeiboCard): string {
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