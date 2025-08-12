This project is designed to catch Weibo news every day. It is a script that automatically retrieves the latest news from Weibo and saves them for further analysis or display. 

## ✨ New Features: Beautiful Weibo Cards

We've added beautiful card formatting for weibo posts! Transform plain text data into visually appealing cards with modern design.

### 🎨 Card Features
- **Multiple formats**: HTML, Markdown, and compact versions
- **Modern design**: Rounded corners, shadows, gradients
- **Responsive layout**: Works on mobile, tablet, and desktop
- **Rich information**: Author, content, retweets, engagement data

### 🚀 Quick Start with Cards
```bash
npm run generate-cards
```

This generates beautiful card demos in the `output/` directory:
- `weibo-cards.html` - Full styled cards page
- `single-card.html` - Single card example  
- `compact-cards.html` - Compact card layout
- `weibo-cards.md` - Markdown format cards

📖 See [CARDS.md](./CARDS.md) for detailed documentation.

---

## Installation & Usage

To use this project, follow these steps:

1. Clone the repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Run the script using `npm run deploy`.
4. The script will fetch the latest Weibo news and store them in a database or file, depending on your configuration.
5. You can then analyze or display the collected news using your preferred method.

## Available Scripts

- `npm run deploy` - Build and run the main scraper
- `npm run weibo` - Run weibo user scraper  
- `npm run generate-cards` - Generate beautiful weibo cards
- `npm run clean` - Clean generated files

Feel free to customize the project according to your needs and requirements. Happy Weibo news catching!
