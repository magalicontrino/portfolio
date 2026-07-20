// Capture pleine page en pilotant Chrome (protocole DevTools).
// Le site revele son contenu au defilement : une capture directe laisse la page
// vide. On parcourt donc toute la hauteur avant de photographier.
const url = process.argv[2], sortie = process.argv[3];
const largeur = +(process.argv[4] || 1440);

const attendre = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const liste = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const cible = liste.find(t => t.type === 'page');
  const ws = new WebSocket(cible.webSocketDebuggerUrl);
  let id = 0; const enAttente = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && enAttente.has(m.id)) { enAttente.get(m.id)(m.result); enAttente.delete(m.id); }
  };
  await new Promise(r => ws.onopen = r);
  const cmd = (method, params = {}) => new Promise(res => {
    const n = ++id; enAttente.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const evaluer = expr => cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });

  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride',
    { width: largeur, height: 900, deviceScaleFactor: 1, mobile: false });

  await cmd('Page.navigate', { url });
  await attendre(6000);

  // Parcours complet : chaque palier declenche les revelations de sa zone.
  await evaluer(`(async () => {
    const pas = 400, pause = ms => new Promise(r => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += pas) {
      scrollTo(0, y); await pause(120);
    }
    scrollTo(0, document.documentElement.scrollHeight); await pause(1200);
    scrollTo(0, 0); await pause(800);
    // Les images differees doivent aussi etre chargees.
    document.querySelectorAll('img').forEach(i => i.loading = 'eager');
    await Promise.all([...document.images].map(i => i.complete ? 0 :
      new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 5000); })));
    await pause(600);
    return document.documentElement.scrollHeight;
  })()`);

  const h = (await evaluer('document.documentElement.scrollHeight')).result.value;
  const masques = (await evaluer(
    `[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).opacity==='0').length`)).result.value;

  const img = await cmd('Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: largeur, height: h, scale: 1 } });

  require('fs').writeFileSync(sortie, Buffer.from(img.data, 'base64'));
  console.log(`  ${sortie} : ${largeur}x${h}, encore masques : ${masques}`);
  ws.close();
  process.exit(0);
})();
