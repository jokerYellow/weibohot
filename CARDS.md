# 微博卡片美化功能

## 概述

新增了微博卡片美化功能，将原本简单的文本数据转换为视觉上更加吸引人的卡片格式。这个功能为微博内容提供了更好的阅读体验和视觉呈现。

## 功能特点

### 🎨 多种卡片格式
- **完整卡片**: 包含作者信息、内容、转发内容、互动数据等完整信息
- **紧凑卡片**: 简洁版本，适合列表展示
- **HTML格式**: 带有美观样式的网页卡片
- **Markdown格式**: 适合GitHub等平台展示

### 🎯 设计亮点
- **现代化设计**: 使用圆角、阴影等现代UI元素
- **响应式布局**: 适配手机、平板、桌面等不同设备
- **优雅的配色**: 渐变背景和层次分明的颜色搭配
- **清晰的信息层级**: 作者、内容、转发、互动数据分层展示
- **悬停效果**: 鼠标悬停时的动态效果增强用户体验

### 📱 样式特性
- **美观的排版**: 合理的字体大小、行距和间距
- **图标元素**: 使用emoji图标增强视觉效果
- **卡片阴影**: 营造层次感和立体效果
- **渐变背景**: 时尚的渐变色背景
- **转发区域**: 特殊的样式区分转发内容

## 使用方法

### 快速生成示例卡片
```bash
npm run generate-cards
# 或
npm run cards
```

这会在 `output/` 目录下生成以下文件：
- `weibo-cards.html` - 完整的卡片页面
- `single-card.html` - 单个卡片示例
- `compact-cards.html` - 紧凑版卡片
- `weibo-cards.md` - Markdown格式卡片

### 在代码中使用

```typescript
import { generateHTMLCard, generateMarkdownCard, generateStyledHTMLPage } from './cardFormatter';

// 创建微博数据
const weiboData = {
  authorName: "科技日报",
  href: "https://weibo.com/example",
  authorId: "kejiribaoa",
  content: "🚀 重大突破！我国科学家在量子计算领域取得新进展...",
  retweetContent: "量子计算的春天来了！",
  retweetAuther: "量子科技爱好者",
  date: new Date(),
  likeNumber: "1.2万"
};

// 生成HTML卡片
const htmlCard = generateHTMLCard(weiboData);

// 生成Markdown卡片
const markdownCard = generateMarkdownCard(weiboData);

// 生成完整页面
const fullPage = generateStyledHTMLPage([weiboData], "微博卡片展示");
```

### 在Weibo类中使用

```typescript
const weibo = new Weibo();
// ... 设置微博数据 ...

// 生成HTML卡片
const htmlCard = weibo.toHTMLCard();

// 生成Markdown卡片
const markdownCard = weibo.toMarkdownCard();
```

### 从数据库生成卡片

```typescript
import { generateCardsFromDatabase } from './weibo';

// 从数据库读取最新20条微博并生成卡片页面
await generateCardsFromDatabase(20, "./my-weibo-cards.html");
```

## 卡片样式展示

### HTML卡片特点
- **圆角设计**: 16px圆角让卡片更加柔和
- **卡片阴影**: 多层阴影营造立体效果
- **渐变背景**: 紫色渐变背景提升视觉效果
- **悬停动效**: 鼠标悬停时轻微上浮
- **响应式设计**: 自动适配移动设备

### Markdown卡片特点
- **结构化布局**: 清晰的标题和内容分层
- **图标装饰**: 使用emoji增强可读性
- **引用格式**: 转发内容使用引用样式
- **链接支持**: 原文链接和作者信息
- **GitHub友好**: 完美适配GitHub显示

## 文件结构

```
weibohot/
├── cardFormatter.ts      # 核心卡片格式化功能
├── cardDemo.ts          # 卡片演示和生成工具
├── weibo.ts            # 扩展了卡片功能的微博类
├── output/             # 生成的卡片文件
│   ├── weibo-cards.html
│   ├── single-card.html
│   ├── compact-cards.html
│   └── weibo-cards.md
└── package.json        # 新增了生成卡片的脚本
```

## 技术实现

### 核心功能模块
1. **cardFormatter.ts**: 卡片格式化核心逻辑
2. **cardDemo.ts**: 演示和批量生成工具
3. **weibo.ts**: 集成卡片功能到Weibo类

### 样式系统
- **现代CSS**: 使用flexbox、grid等现代布局
- **渐变效果**: CSS渐变背景和阴影
- **动画效果**: CSS过渡动画
- **响应式**: 媒体查询适配不同屏幕

### 安全特性
- **HTML转义**: 防止XSS攻击
- **内容截断**: 紧凑版自动截断长内容
- **错误处理**: 优雅处理空数据和异常情况

## 使用场景

1. **个人博客**: 将微博内容嵌入个人网站
2. **数据展示**: 以美观的形式展示收集的微博数据
3. **报告生成**: 生成包含微博内容的分析报告
4. **GitHub展示**: 在README中展示微博动态
5. **移动应用**: 在移动端以卡片形式展示内容

## 自定义样式

可以通过修改 `cardFormatter.ts` 中的 `getCardStyles()` 函数来自定义卡片样式，包括：
- 颜色主题
- 字体大小
- 间距布局
- 动画效果
- 背景样式

## 性能优化

- **轻量级**: 纯CSS+HTML，无额外JavaScript依赖
- **快速渲染**: 优化的DOM结构，快速加载
- **缓存友好**: 静态HTML文件，易于缓存
- **SEO友好**: 语义化HTML结构，有利于搜索引擎

## 未来计划

- [ ] 支持更多主题样式
- [ ] 添加图片和视频支持
- [ ] 支持自定义CSS主题
- [ ] 添加打印样式优化
- [ ] 支持数据导出功能