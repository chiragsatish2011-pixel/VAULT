async function check() {
  const res = await fetch("https://vault-showbook.vercel.app/");
  const html = await res.text();
  console.log("Status:", res.status);
  console.log("HTML length:", html.length);
  
  // Look for site titles in public HTML
  const sitesList = [
    "https://nc-studio-one.vercel.app/",
    "https://vaayulabs.ai.studio/",
    "https://showbook-xi.vercel.app/",
    "https://chirag-sandy.vercel.app/",
    "https://vaayu-workspace.vercel.app/",
    "https://garts-seven.vercel.app/",
    "https://gurukul-photo.vercel.app",
    "https://nomin-webshow.vercel.app/",
    "https://nomin-ai-nine.vercel.app/",
    "https://nomin-company.vercel.app/",
    "https://nomin-code.ai.studio/",
    "https://overveiw.space-z.ai/",
    "https://editor-ops-aplha.vercel.app/",
    "https://nishanth-portfolio-work.vercel.app/",
    "https://nishanth-demo-website-4.vercel.app/",
    "https://nishanth-demo-website-5.vercel.app/",
    "https://nishanth-demo-website-2.vercel.app/",
    "https://nishanth-demo-website-1.vercel.app/",
    "https://nishanth-demo-website-6.vercel.app/",
    "https://nishanth-demo-website-7.vercel.app/",
    "https://arc-coder.vercel.app/",
    "https://n8n-local-setup.vercel.app/",
    "https://vaayu-chat-1xss.vercel.app/",
    "https://webiste1-weld.vercel.app/",
    "https://nomin-spacelab.vercel.app/",
    "https://html-work-six.vercel.app/",
    "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace"
  ];

  let found = 0;
  let missing = [];
  for (const url of sitesList) {
    const rawClean = url.replace(/\/$/, "");
    if (html.includes(rawClean) || html.includes(url)) {
      found++;
    } else {
      missing.push(url);
    }
  }

  console.log(`Found ${found} / ${sitesList.length} in public gallery HTML.`);
  if (missing.length > 0) {
    console.log("Missing URLs:", missing);
  }
}

check().catch(console.error);
