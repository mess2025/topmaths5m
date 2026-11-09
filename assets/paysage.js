/* =========================================================
   FOND DE L'ACCUEIL : LE CIEL ÉTOILÉ ET L'OCÉAN, LA NUIT
   (maquette 21, n° 1 « eau discrète », 9 novembre 2026)
   - Le ciel : dégradé noir → bleu (dans assets/theme.scss) et étoiles fines.
   - L'océan : une bande d'eau sombre et calme en bas du bloc d'accueil.
     Sa surface est calculée point par point (rides vues en perspective),
     puis redessinée lentement : l'eau bouge tout doucement.
   Version précédente (montagnes et forêt) : repère git « avant-ocean ».
   ========================================================= */
(function(){
  // Ce fond n'existe que sur la page d'accueil (bloc « .heros »)
  const heros = document.querySelector('.heros');
  if (!heros) return;

  const NS = 'http://www.w3.org/2000/svg';
  const fixe = location.search.includes('capture');   // capture d'écran : image immobile
  const calme = fixe || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Le ciel (dessin SVG) et la mer (toile) sont posés tout en haut de la page, derrière le menu
  const mer = document.createElement('canvas');
  mer.id = 'mer';
  mer.setAttribute('aria-hidden', 'true');
  document.body.prepend(mer);
  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'paysage';
  svg.setAttribute('aria-hidden', 'true');
  document.body.prepend(svg);

  // Hasard reproductible : le dessin est le même à chaque visite
  function hasard(graine){ return function(){ graine |= 0; graine = graine + 0x6D2B79F5 | 0;
    let t = Math.imul(graine ^ graine >>> 15, 1 | graine); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- Le ciel : étoiles fines, plus nombreuses en haut, absentes près de l'horizon ----------
  function etoiles(L, H){
    const r = hasard(7);
    for (let i = 0; i < 130; i++){
      const x = r() * L, y = Math.pow(r(), 1.6) * H * 0.62;
      const rayon = 0.45 + r() * r() * 1.1, o = (0.25 + r() * 0.6) * (1 - y / (H * 0.7));
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', rayon.toFixed(2));
      c.setAttribute('fill', '#EAF4FF'); c.setAttribute('opacity', o.toFixed(2));
      if (!calme && i % 6 === 0){ c.classList.add('scintille'); c.style.setProperty('--o', o.toFixed(2)); c.style.setProperty('--d', (3 + r() * 4).toFixed(1) + 's'); }
      svg.appendChild(c);
    }
  }

  // ---------- L'océan ----------
  // Bruit lisse : une surface vallonnée au hasard, entre -1 et 1
  const VALEURS = new Float32Array(256), PERM = new Uint8Array(512);
  (function(){ const r = hasard(1234), p = [];
    for (let i = 0; i < 256; i++){ VALEURS[i] = r() * 2 - 1; p.push(i); }
    for (let i = 255; i > 0; i--){ const j = Math.floor(r() * (i + 1)), k = p[i]; p[i] = p[j]; p[j] = k; }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]; })();
  function bruit(x, y){
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = PERM[xi & 255], b = PERM[(xi + 1) & 255], Y = yi & 255;
    const h00 = VALEURS[PERM[a + Y]], h10 = VALEURS[PERM[b + Y]], h01 = VALEURS[PERM[a + Y + 1]], h11 = VALEURS[PERM[b + Y + 1]];
    return h00 + (h10 - h00) * u + (h01 - h00) * v + (h00 - h10 - h01 + h11) * u * v;
  }
  function doux(x){ x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }

  // --- Réglages de l'eau (à ajuster à votre goût) ---
  const LUMIERE = 0.075;        // clarté des crêtes (plus grand = rides plus visibles)
  const ECLATS = 0.42;          // force des reflets de lune (0 = aucun reflet)
  const LUNE = 1.3;             // surcroît de reflets dans le sillage de la lune (0 = pareil partout)
  const HORIZON = 0.4;          // force du filet de lumière sur l'horizon (0 = aucun)
  const OMBRE = 0.34;           // profondeur des creux sombres
  const VITESSE = 1;            // vitesse du mouvement (0.5 = deux fois plus lent)
  const HALO = 22;              // hauteur, en pixels, de la lueur au-dessus de l'horizon

  let tirage = 0;
  function ocean(L, H){
    const MER = Math.round(Math.min(200, H * 0.26));            // hauteur de la bande de mer, en pixels
    mer.style.top = (H - MER - HALO) + 'px'; mer.style.height = (MER + HALO) + 'px';
    const fin = fixe ? 1 : 0.75;                                // finesse du calcul (1 = un point par pixel)
    const w = Math.ceil(L * fin), h = Math.ceil((MER + HALO) * fin);
    mer.width = w; mer.height = h;
    const ctx = mer.getContext('2d'), image = ctx.createImageData(w, h), px = image.data;
    // La lune, hors champ, éclaire surtout une colonne d'eau (entre la roue et les animations)
    const x0 = L * 0.445;
    const centre = new Float32Array(w);                         // filet d'horizon : plus clair au milieu, il s'efface vers les bords
    for (let i = 0; i < w; i++){ const q = (i / fin - x0) / (L * 0.34); centre[i] = 0.3 + 0.7 * Math.exp(-q * q); }
    function peindre(t){
      let k = 0;
      for (let j = 0; j < h; j++){
        const yc = (j + 0.5) / fin - HALO;
        if (yc < 0){                                            // au-dessus de l'horizon : une lueur très légère, le ciel reste visible
          const a = 255 * HORIZON * 0.2 * Math.exp(yc / 6);
          for (let i = 0; i < w; i++){ px[k++] = 150; px[k++] = 195; px[k++] = 245; px[k++] = a * centre[i]; }
          continue;
        }
        const d = yc / MER;                                     // d : 0 à l'horizon, 1 tout en bas
        const z = 1 / (d * 0.72 + 0.035);                       // éloignement : grand près de l'horizon
        const dd = doux(d);
        // Couleur de fond de l'eau : bleue vers l'horizon, bleu nuit de la page (#0A1A33) tout en bas
        const r0 = 10, g0 = 41 - 15 * dd, b0 = 88 - 37 * dd;
        // Force des rides : nulle sur l'horizon, franche au milieu, éteinte en bas (l'eau se fond dans la page)
        const bas = 1 - doux((d - 0.5) / 0.5);
        const force = doux(d / 0.22) * bas, forceE = doux(d / 0.13) * (1 - doux((d - 0.28) / 0.6));
        const zz = z * 7.5, kx = z * 3.2 / 260, loin = 0.25 + 0.75 * (1 - d);
        const filet = HORIZON * 0.6 * Math.exp(-yc / 1.5);      // le filet de lumière posé sur l'horizon
        const large = L * (0.028 + 0.12 * d);                   // le sillage de la lune s'élargit en venant vers nous
        for (let i = 0; i < w; i++){
          const xc = i / fin, wx = (xc - L / 2) * kx;
          const s = 0.62 * bruit(wx + t * 0.05, zz - t * 0.22) + 0.38 * bruit(wx * 2.7 - t * 0.04 + 31.7, zz * 2.7 + t * 0.35 + 11.3);
          const q = (xc - x0) / large, lune = Math.exp(-q * q);
          const seuil = 0.4 - 0.2 * lune;
          let g = 0;
          if (s > seuil - 0.4){                                 // reflets : fins éclats sur les crêtes tournées vers la lune
            g = (s + 0.45 * bruit(wx * 4.6 + t * 0.06 + 5.2, zz * 12 - t * 0.5 + 71.9) - seuil) / 0.5;
            g = g < 0 ? 0 : g > 1 ? 1 : g; g *= g * g;          // cœur vif, bords fondus
          }
          const lumiere = force * (LUMIERE * (s > 0 ? s : 0) + 0.035 * lune) + filet * centre[i];
          const eclat = forceE * ECLATS * g * loin * (1 + LUNE * lune);
          const ombre = 1 - OMBRE * force * (s < 0 ? -s : 0);                        // rides sombres dans les creux
          px[k++] = r0 * ombre + 150 * lumiere + 215 * eclat; px[k++] = g0 * ombre + 195 * lumiere + 232 * eclat; px[k++] = b0 * ombre + 245 * lumiere + 255 * eclat; px[k++] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
    }
    const moi = ++tirage;                                       // si la fenêtre change de taille, l'ancienne boucle s'arrête
    if (calme){ peindre(7); return; }
    (function boucle(){
      if (moi !== tirage) return;
      if (window.scrollY < H) peindre(performance.now() / 1000 * VITESSE);   // rien à calculer quand la mer n'est plus à l'écran
      setTimeout(function(){ requestAnimationFrame(boucle); }, 70);
    })();
  }

  // Dessine le fond, seulement si la taille a vraiment changé
  let largeur = 0, hauteur = 0;
  function dessiner(){
    const H = Math.round(heros.getBoundingClientRect().bottom + window.scrollY);
    svg.style.height = H + 'px';
    const L = svg.clientWidth;
    if (L === largeur && H === hauteur) return;
    largeur = L; hauteur = H;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
    etoiles(L, H);
    ocean(L, H);
  }

  dessiner();
  window.addEventListener('load', dessiner);      // le bloc d'accueil a pu grandir (images, polices)
  let attente; window.addEventListener('resize', function(){ clearTimeout(attente); attente = setTimeout(dessiner, 150); });
})();
