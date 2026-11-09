/* =========================================================
   0) LA ROUE : place les 8 disques en cercle autour du centre
      (en partant du haut, dans le sens des aiguilles d'une montre).
      À l'arrivée sur la page, elle fait un quart de tour lent
      et finit sur le bon ordre ; les textes restent droits
      (on déplace les disques, on ne les fait pas pivoter).
   ========================================================= */
(function(){
  const roue = document.getElementById('roue');
  const disques = [...roue.querySelectorAll('.disque')];
  const C = 220;          // centre de la roue (moitié de 440 px)
  const R = 160;          // rayon du cercle des disques
  const D = 104;          // diamètre d'un disque
  const DUREE = 6400;     // durée du quart de tour (millisecondes) : 2 × plus lent que la 15
  const calme = location.search.includes('capture') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Comète : une petite lumière par disque, chacune partie d'un endroit différent
  disques.forEach((d, i) => {
    d.style.setProperty('--c', d.dataset.c);
    const c = document.createElement('i');
    c.className = 'comete';
    c.style.animationDelay = (-i * 1.3) + 's';
    d.appendChild(c);
  });

  function placer(decalage){
    disques.forEach((d, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / disques.length + decalage;
      d.style.left = (C + R * Math.cos(a) - D / 2) + 'px';
      d.style.top  = (C + R * Math.sin(a) - D / 2) + 'px';
    });
  }
  if (calme){ placer(0); return; }

  // Quart de tour (π/2) dans le sens des aiguilles d'une montre, qui ralentit doucement à la fin
  const lisse = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  let debut = null;
  function tourner(temps){
    if (debut === null) debut = temps;
    const x = Math.min(1, (temps - debut) / DUREE);
    placer(-Math.PI / 4 * (1 - lisse(x)));   // un huitième de tour (un cran), plus discret qu'un quart
    if (x < 1) requestAnimationFrame(tourner);
  }
  placer(-Math.PI / 4);
  setTimeout(() => requestAnimationFrame(tourner), 400);
})();

/* =========================================================
   0 bis) MINI-ANIMATION du disque Animations :
          une sinusoïde qui se dessine, puis s'efface, en boucle
   ========================================================= */
(function(){
  const toile = document.getElementById('minianim');
  const g = toile.getContext('2d');
  const L = toile.width, H = toile.height;
  const CYCLE = 4200;   // durée d'un cycle (millisecondes)
  const capture = location.search.includes('capture');

  function dessiner(temps){
    const p = capture ? 0.6 : (temps % CYCLE) / CYCLE;     // capture : courbe complète, pas encore effacée
    const trace = Math.min(1, p / 0.6);                      // 0 → 1 : la courbe se dessine
    const fondu = p < 0.8 ? 1 : 1 - (p - 0.8) / 0.2;          // puis s'efface
    g.clearRect(0, 0, L, H);
    // axe discret
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(4, H / 2); g.lineTo(L - 4, H / 2); g.stroke();
    // courbe
    g.globalAlpha = fondu;
    g.strokeStyle = '#5FD4F4'; g.lineWidth = 4; g.lineCap = 'round';
    g.shadowColor = '#5FD4F4'; g.shadowBlur = 8;
    g.beginPath();
    const fin = 6 + (L - 12) * trace;
    for (let x = 6; x <= fin; x += 2){
      const y = H / 2 - (H / 2 - 8) * Math.sin((x - 6) / (L - 12) * 2 * Math.PI);
      x === 6 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
    // point qui trace la courbe
    if (trace < 1){
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(fin, H / 2 - (H / 2 - 8) * Math.sin((fin - 6) / (L - 12) * 2 * Math.PI), 4, 0, 2 * Math.PI); g.fill();
    }
    g.globalAlpha = 1; g.shadowBlur = 0;
    if (!capture) requestAnimationFrame(dessiner);
  }
  capture ? dessiner(0) : requestAnimationFrame(dessiner);
})();
