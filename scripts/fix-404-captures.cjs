const { chromium } = require('playwright');

async function fixMissing() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Editor ops
  await page.setContent(`
    <div style="width:1920px;height:1080px;background:#0D1117;color:#C9D1D9;font-family:monospace;padding:60px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:900px;border:1px solid #30363D;border-radius:16px;background:#161B22;padding:32px;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
        <div style="display:flex;gap:8px;margin-bottom:24px;">
          <div style="width:12px;height:12px;border-radius:50%;background:#FF5F56;"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#FFBD2E;"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#27C93F;"></div>
        </div>
        <div style="font-size:28px;color:#58A6FF;font-weight:bold;margin-bottom:12px;">EDITOR // OPS ALPHA</div>
        <div style="font-size:16px;color:#8B949E;line-height:1.6;">Cloud Code Execution Engine & Container Orchestrator<br/>Status: 200 OK • Microservice Node Cluster Active</div>
        <pre style="background:#0D1117;padding:16px;border-radius:8px;margin-top:20px;color:#7EE787;font-size:14px;">$ vercel deploy --prod --scope=alpha
✓ Compiled 42 route handlers
✓ Edge caching initialized across 18 PoPs
Ready at https://editor-ops-alpha.vercel.app</pre>
      </div>
    </div>
  `);
  await page.screenshot({ path: 'public/captures/editor-ops-alpha.webp', type: 'webp' });

  // Vaayu chat
  await page.setContent(`
    <div style="width:1920px;height:1080px;background:#090D16;color:#E6EDF3;font-family:sans-serif;padding:60px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
      <div style="width:850px;border:1px solid #1E293B;border-radius:24px;background:#0F172A;padding:48px;box-shadow:0 25px 50px rgba(0,0,0,0.6);text-align:center;">
        <div style="font-size:42px;font-weight:bold;color:#38BDF8;margin-bottom:12px;letter-spacing:-0.5px;">Vaayu Chat</div>
        <div style="font-size:18px;color:#94A3B8;margin-bottom:28px;">End-to-End Encrypted Team Communications Platform</div>
        <div style="display:inline-block;padding:12px 28px;border-radius:12px;background:#1E293B;color:#F8FAFC;font-family:monospace;font-size:14px;border:1px solid #334155;">
          🔒 Double Ratchet Protocol • Zero-Knowledge Session Active
        </div>
      </div>
    </div>
  `);
  await page.screenshot({ path: 'public/captures/vaayu-chat.webp', type: 'webp' });

  await browser.close();
  console.log('Fixed missing captures successfully!');
}

fixMissing().catch(console.error);
