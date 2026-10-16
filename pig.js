/* Petit compagnon pixelisé. Il suit le bord supérieur des blocs visibles,
   sans intercepter les clics ni perturber le contenu ou la carte Leaflet. */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sprite = document.createElement('div');
  sprite.id = 'pixel-pig';
  sprite.className = 'walking';
  sprite.setAttribute('aria-hidden', 'true');
  // Dessin en pixels (SVG à bords nets), construit sans asset externe.
  const rows = [
    '................',
    '..........PP....',
    '...PPPPPPPPPDP..',
    '..PPPPPPPPPPPPP.',
    '.PPPPPPPPPPPPPP.',
    '.PPPPPPPPPPWPPP.',
    'PPPPPPPPPPPPPPPP',
    'PPPPPPPPPPPPNPNN',
    '.PPPPPPPPPPPNNNN',
    '..PPPPPPPPPPPP..',
    '...DD...DD......',
    '...DD...DD......'
  ];
  const colors = {P:'#f49ba6',D:'#c75e78',W:'#2b2427',N:'#ec7c91'};
  let pixels = '';
  rows.forEach((row,y)=>{[...row].forEach((p,x)=>{if(colors[p])pixels += '<rect x="'+(x*3)+'" y="'+(y*3)+'" width="3" height="3" fill="'+colors[p]+'"/>';});});
  sprite.innerHTML = '<svg viewBox="0 0 54 39" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="pig-body">'+pixels+'</g><g class="pig-leg-back"><rect x="12" y="30" width="6" height="6" fill="#ae526a"/></g><g class="pig-leg-front"><rect x="30" y="30" width="6" height="6" fill="#ae526a"/></g><rect x="45" y="23" width="3" height="3" fill="#a74e69"/><path d="M3 20H0V17" stroke="#c75e78" stroke-width="3" fill="none"/></svg>';
  document.body.appendChild(sprite);

  const selector = '.hero-inner, .hero-art, .vendor, .toolbar, #map, .contribute, .about';
  const position = {x:Math.max(8,Math.min(window.innerWidth-80,42)),y:85};
  let targets = [], index = 0, last = 0, pauseUntil = 0, raf = 0;
  const random = (a,b)=>a+Math.random()*(b-a);
  function collect() {
    targets = [...document.querySelectorAll(selector)].filter(el => {
      const r=el.getBoundingClientRect();
      return r.width>=110 && r.height>=35 && r.bottom>45 && r.top<window.innerHeight-35 && getComputedStyle(el).display!=='none';
    });
    if(index>=targets.length) index=0;
  }
  function waypoint(el) {
    const r=el.getBoundingClientRect();
    // Vueport fixe : y recalculé à chaque frame pour accompagner le défilement.
    return {x:Math.max(6,Math.min(window.innerWidth-67,r.left+Math.min(r.width-72,random(25,Math.max(26,r.width-80))))), y:r.top-39};
  }
  let dest=null, destElement=null;
  function next() {
    collect();
    if(!targets.length){dest=null;return;}
    destElement=targets[index++%targets.length];
    dest=waypoint(destElement);
  }
  function tick(now) {
    if(!last) last=now;
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(!dest) next();
    if(destElement && (destElement.getBoundingClientRect().bottom<0 || destElement.getBoundingClientRect().top>window.innerHeight)) {dest=null;next();}
    if(dest&&destElement){
      const rect=destElement.getBoundingClientRect();
      dest.y=rect.top-39;
      if(now>=pauseUntil){
        const dx=dest.x-position.x,dy=dest.y-position.y;
        const distance=Math.hypot(dx,dy);
        const step=135*dt;
        if(distance<=Math.max(step,2)){
          position.x=dest.x;position.y=dest.y;
          pauseUntil=now+random(550,1250);
          sprite.classList.remove('walking');
          dest=null;
        } else {
          position.x+=dx/distance*step;
          position.y+=dy/distance*step;
          sprite.dataset.facing=dx<0?'left':'right';
          sprite.classList.add('walking');
        }
      } else sprite.classList.remove('walking');
      sprite.style.transform='translate3d('+position.x.toFixed(1)+'px,'+position.y.toFixed(1)+'px,0)';
    }
    raf=requestAnimationFrame(tick);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{collect();raf=requestAnimationFrame(tick);},{once:true});
  else {collect();raf=requestAnimationFrame(tick);}
  const observer=new MutationObserver(()=>{if(!dest)collect();});
  const results=document.querySelector('#results');
  if(results)observer.observe(results,{childList:true});
  document.addEventListener('visibilitychange',()=>{last=0;});
})();
