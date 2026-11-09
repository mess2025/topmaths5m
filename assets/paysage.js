/* =========================================================
   FOND DE L'ACCUEIL : « NUIT DOUCE » (maquette 19, n° 4)
   Ciel noir en haut, bleu vers les montagnes, étoiles fines,
   montagnes basses et lissées, forêt arrondie au premier plan.
   Remplace la vague de points (assets/vague.js, conservé mais plus chargé).
   ========================================================= */
(function(){
  // Le paysage n'existe que sur la page d'accueil (bloc « .heros »)
  const heros = document.querySelector('.heros');
  if (!heros) return;

  const NS = 'http://www.w3.org/2000/svg';
  const FOND = '#0A1A33';                         // couleur du reste de la page : le premier plan s'y fond
  const fixe = location.search.includes('capture');   // capture d'écran : pas de scintillement

  // Le dessin est posé tout en haut de la page, derrière le menu,
  // et descend jusqu'au bas du bloc d'accueil
  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'paysage';
  svg.setAttribute('aria-hidden', 'true');
  document.body.prepend(svg);

  // Hasard reproductible : le dessin est le même à chaque visite
  function hasard(graine){ return function(){ graine |= 0; graine = graine + 0x6D2B79F5 | 0;
    let t = Math.imul(graine ^ graine >>> 15, 1 | graine); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function el(nom, attributs){ const e = document.createElementNS(NS, nom);
    for (const k in attributs) e.setAttribute(k, attributs[k]); svg.appendChild(e); return e; }

  // Étoiles fines, plus nombreuses en haut, absentes près du paysage
  function etoiles(L, H){
    const r = hasard(7);
    for (let i = 0; i < 130; i++){
      const x = r() * L, y = Math.pow(r(), 1.6) * H * 0.62;
      const rayon = 0.45 + r() * r() * 1.1, o = (0.25 + r() * 0.6) * (1 - y / (H * 0.7));
      const c = el('circle', {cx:x.toFixed(1), cy:y.toFixed(1), r:rayon.toFixed(2), fill:'#EAF4FF', opacity:o.toFixed(2)});
      if (!fixe && i % 6 === 0){ c.classList.add('scintille'); c.style.setProperty('--o', o.toFixed(2)); c.style.setProperty('--d', (3 + r() * 4).toFixed(1) + 's'); }
    }
  }

  // Dégradé vertical : couleur franche à la crête, brume vers le pied
  let numero = 0;
  function brume(couleur, haut, bas){
    const id = 'brume' + (numero++);
    const d = el('linearGradient', {id:id, x1:0, y1:0, x2:0, y2:1});
    const a = document.createElementNS(NS, 'stop'); a.setAttribute('offset', '0'); a.setAttribute('stop-color', couleur); a.setAttribute('stop-opacity', haut); d.appendChild(a);
    const b = document.createElementNS(NS, 'stop'); b.setAttribute('offset', '1'); b.setAttribute('stop-color', couleur); b.setAttribute('stop-opacity', bas); d.appendChild(b);
    return 'url(#' + id + ')';
  }

  // Montagnes basses et lissées, avec un relief très léger
  function montagne(L, H, niveau, amplitude, graine, couleur, haut, bas){
    const r = hasard(graine), ondes = [];
    for (let k = 1; k <= 3; k++) ondes.push({f:(0.5 + r() * 0.8) * k * 1.15 / 1440, p:r() * 6.283, a:1 / Math.pow(k, 1.6)});
    let crete = '';
    for (let x = -80; x <= L + 80; x += 8){
      let s = 0; for (const o of ondes) s += o.a * Math.sin(x * o.f * 6.283 + o.p);
      crete += (crete ? ' L' : 'M') + x + ' ' + (H - niveau - amplitude * s * 0.7).toFixed(1);
    }
    const forme = crete + ' L' + (L + 80) + ' ' + H + ' L-80 ' + H + ' Z';
    const id = 'masque' + (numero++);
    const masque = el('clipPath', {id:id}); const p = document.createElementNS(NS, 'path'); p.setAttribute('d', forme); masque.appendChild(p);
    el('path', {d:forme, fill:brume(couleur, haut, bas)});
    // Versant à l'ombre : la même forme, décalée, visible seulement à l'intérieur de la montagne
    const g = el('g', {'clip-path':'url(#' + id + ')'});
    const o1 = document.createElementNS(NS, 'path'); o1.setAttribute('d', forme); o1.setAttribute('fill', '#04142E'); o1.setAttribute('opacity', '.26'); o1.setAttribute('transform', 'translate(54 30)'); g.appendChild(o1);
    const o2 = document.createElementNS(NS, 'path'); o2.setAttribute('d', forme); o2.setAttribute('fill', '#04142E'); o2.setAttribute('opacity', '.16'); o2.setAttribute('transform', 'translate(-120 74)'); g.appendChild(o2);
    // Fil de lumière sur la crête
    el('path', {d:crete, fill:'none', stroke:'#A9CDEF', 'stroke-width':1.1, opacity:.20});
  }

  // Forêt suggérée : des houppiers ronds qui se fondent, sans pointes ; quelques arbres à peine plus hauts
  function feuillage(L, H, pied, rmin, rmax, graine, remplissage){
    const r = hasard(graine), p1 = r() * 6.283;
    let prochain = 120 + r() * 200;
    for (let x = -30; x < L + 30; ){
      const rayon = rmin + (rmax - rmin) * r();
      const y = H - pied - rayon * 0.35 - 5 * Math.sin(x / 260 + p1);
      el('ellipse', {cx:x.toFixed(1), cy:y.toFixed(1), rx:(rayon * 1.25).toFixed(1), ry:rayon.toFixed(1), fill:remplissage});
      if (x > prochain){                           // de loin en loin, un arbre un peu plus haut, tout en rondeur
        el('ellipse', {cx:(x + rayon).toFixed(1), cy:(y - rayon * 0.55).toFixed(1), rx:(rayon * 0.9).toFixed(1), ry:(rayon * 1.0).toFixed(1), fill:remplissage});
        prochain = x + 230 + r() * 330;
      }
      x += rayon * (1.25 + r() * 0.7);
    }
    el('rect', {x:0, y:H - pied - 2, width:L, height:pied + 2, fill:remplissage});
  }

  // Dessine le paysage, seulement si la taille a vraiment changé
  let largeur = 0, hauteur = 0;
  function dessiner(){
    const H = Math.round(heros.getBoundingClientRect().bottom + window.scrollY);
    svg.style.height = H + 'px';
    const L = svg.clientWidth;
    if (L === largeur && H === hauteur) return;
    largeur = L; hauteur = H;
    svg.innerHTML = ''; numero = 0;
    svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
    etoiles(L, H);
    montagne(L, H, 150, 78, 11, '#3B74AE', .46, .14);
    montagne(L, H, 96, 52, 29, '#17467C', .90, .55);
    feuillage(L, H, 34, 13, 22, 8, '#0D2445');
    feuillage(L, H, 18, 15, 26, 3, FOND);
  }

  dessiner();
  window.addEventListener('load', dessiner);      // le bloc d'accueil a pu grandir (images, polices)
  let attente; window.addEventListener('resize', function(){ clearTimeout(attente); attente = setTimeout(dessiner, 150); });
})();
