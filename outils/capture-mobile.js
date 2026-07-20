// Capture UN ecran de telephone sur le site vivant : on parcourt d'abord toute
// la page pour declencher les revelations, puis on revient au point voulu et on
// photographie la seule zone visible. Pas de decoupe, donc pas de perte.
const url=process.argv[2], sortie=process.argv[3], ancre=+(process.argv[4]||0);
(async()=>{
  const liste=await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const cible=liste.find(t=>t.type==='page');
  const ws=new WebSocket(cible.webSocketDebuggerUrl);
  let id=0; const attente=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&attente.has(m.id)){attente.get(m.id)(m.result);attente.delete(m.id);}};
  await new Promise(r=>ws.onopen=r);
  const cmd=(m,p={})=>new Promise(res=>{const n=++id;attente.set(n,res);ws.send(JSON.stringify({id:n,method:m,params:p}));});
  const evaluer=e=>cmd('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});
  await cmd('Page.enable'); await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride',
    {width:390,height:844,deviceScaleFactor:3,mobile:true,screenWidth:390,screenHeight:844});
  await cmd('Page.navigate',{url}); await new Promise(r=>setTimeout(r,6000));
  await evaluer(`(async()=>{const pause=ms=>new Promise(r=>setTimeout(r,ms));
    for(let y=0;y<document.documentElement.scrollHeight;y+=350){scrollTo(0,y);await pause(110);}
    scrollTo(0,document.documentElement.scrollHeight);await pause(1000);
    document.querySelectorAll('img').forEach(i=>i.loading='eager');
    await Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,5000);})));
    scrollTo(0,${ancre});await pause(1500);})()`);
  const img=await cmd('Page.captureScreenshot',{format:'png'});
  require('fs').writeFileSync(sortie,Buffer.from(img.data,'base64'));
  console.log('  '+sortie+' ok');
  ws.close(); process.exit(0);
})();
