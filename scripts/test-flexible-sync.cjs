const http = require('http');

function postJson(urlPath, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log("=== Testing Flexible Sync & Already-Up-To-Date System ===");

  // Test 1: Existing project detection (e.g. EditorOps)
  console.log("\n1. Testing 'Already Up to Date' detection for EditorOps...");
  const res1 = await postJson('/api/sync', {
    repoUrl: 'https://github.com/chiragsatish2011-pixel/EditorOps',
  });
  console.log("Status:", res1.status);
  console.log("Result:", JSON.stringify(res1.body, null, 2));

  if (res1.body.alreadyExists && res1.body.upToDate) {
    console.log("✓ Correctly detected existing project: Already Up to Date!");
  } else {
    console.error("❌ Failed already exists check");
  }

  // Test 2: Web URL alone
  console.log("\n2. Testing Web URL alone (https://nc-studio-one.vercel.app/)...");
  const res2 = await postJson('/api/sync', {
    liveUrl: 'https://nc-studio-one.vercel.app/',
  });
  console.log("Status:", res2.status);
  console.log("Result alreadyExists:", res2.body.alreadyExists);

  // Test 3: Quick Search API returns latest projects
  console.log("\n3. Testing /api/projects/quick search query...");
  const searchRes = await getJson('/api/projects/quick');
  console.log("Search status:", searchRes.status);
  console.log("Total projects indexed:", searchRes.body.length);
  const found = searchRes.body.find(p => p.slug === 'editor-ops-alpha');
  if (found) {
    console.log("✓ Confirmed 'editor-ops-alpha' present in search:", found.title);
  } else {
    console.error("❌ 'editor-ops-alpha' missing in search");
  }

  console.log("\n🎉 All sync and search tests completed!");
}

runTests().catch(console.error);
