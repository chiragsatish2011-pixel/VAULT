const fs = require('fs');

const urls = [
  'https://nc-studio-one.vercel.app/',
  'https://vaayulabs.ai.studio/',
  'https://showbook-xi.vercel.app/',
  'https://chirag-sandy.vercel.app/',
  'https://vaayu-workspace.vercel.app/',
  'https://garts-seven.vercel.app/',
  'https://gurukul-photo.vercel.app',
  'https://nomin-webshow.vercel.app/',
  'https://nomin-ai-nine.vercel.app/',
  'https://nomin-company.vercel.app/',
  'https://nomin-code.ai.studio/',
  'https://overveiw.space-z.ai/',
  'https://editor-ops-aplha.vercel.app/',
  'https://nishanth-portfolio-work.vercel.app/',
  'https://nishanth-demo-website-4.vercel.app/',
  'https://nishanth-demo-website-5.vercel.app/',
  'https://nishanth-demo-website-2.vercel.app/',
  'https://nishanth-demo-website-1.vercel.app/',
  'https://nishanth-demo-website-6.vercel.app/',
  'https://nishanth-demo-website-7.vercel.app/',
  'https://arc-coder.vercel.app/',
  'https://n8n-local-setup.vercel.app/',
  'https://vaayu-chat-1xss.vercel.app/',
  'https://webiste1-weld.vercel.app/',
  'https://nomin-spacelab.vercel.app/',
  'https://html-work-six.vercel.app/'
];

async function run() {
  const results = [];
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(4000) });
      const text = await res.text();
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const ogImgMatch = text.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      results.push({
        url: u,
        status: res.status,
        title: titleMatch ? titleMatch[1].replace(/&amp;/g, '&').trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        ogImage: ogImgMatch ? ogImgMatch[1].trim() : ''
      });
      console.log('Fetched:', u, '->', titleMatch ? titleMatch[1].trim() : 'No Title');
    } catch (e) {
      console.log('Failed:', u, '->', e.message);
      results.push({
        url: u,
        status: 'error',
        title: '',
        description: '',
        ogImage: ''
      });
    }
  }
  fs.writeFileSync('prisma/scraped-metadata.json', JSON.stringify(results, null, 2));
}

run();
