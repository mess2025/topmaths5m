/* =========================================================
   1) LA VAGUE (inspirée de maa.org)
      Un maillage de TRIANGLES (points reliés par des traits fins),
      vu D'AU-DESSUS, comme une colline qui ondule très lentement.
      Effet de profondeur de champ comme en photo :
      net au milieu, flou au premier plan et au loin.
   ========================================================= */
(function(){
  // La vague n'existe que sur la page d'accueil (bloc « .heros »)
  const heros = document.querySelector('.heros');
  if (!heros) return;
  // La toile est posée tout en haut de la page, derrière le menu,
  // et descend jusqu'au bas du bloc d'accueil
  const toile = document.createElement('canvas');
  toile.id = 'vague';
  toile.setAttribute('aria-hidden', 'true');
  document.body.prepend(toile);
  function caler(){
    toile.style.height = (heros.getBoundingClientRect().bottom + window.scrollY) + 'px';
  }
  caler();
  const ctx = toile.getContext('2d');

  // --- Réglages (à ajuster à votre goût) ---
  const PAS = 3.6;              // écart entre deux points voisins du maillage
  const DEBUT = 30;             // distance de la première rangée (devant, hors de l'écran)
  const PROFONDEUR = 230;       // jusqu'où la nappe s'étend vers l'horizon
  const HAUTEUR_CAMERA = 23;    // hauteur de l'œil au-dessus de la nappe (vue d'en haut)
  const INCLINAISON = 0.30;     // regard légèrement vers le bas (en radians)
  const HORIZON = 0.05;         // le bord lointain de la nappe dépasse le haut de l'écran de 5 % de la hauteur
  const MISE_AU_POINT = 105;    // distance à laquelle la nappe est nette
  const VITESSE = 0.0016;       // vitesse de l'ondulation (plus petit = plus lent)
  const TEINTE = '226, 236, 255';   // blanc légèrement bleuté (rouge, vert, bleu)
  const OPACITE_POINT = 0.40;   // opacité des points nets
  const OPACITE_TRAIT = 0.18;   // opacité des traits nets
  const TAILLE_POINT = 0.064;   // taille des points (proportionnelle à la distance)

  // Si le visiteur a demandé « moins d'animations » sur son appareil : image fixe
  const immobile = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0, largeur = 0, hauteur = 0, focale = 1, centreY = 0;
  const cosI = Math.cos(INCLINAISON), sinI = Math.sin(INCLINAISON);

  // Taches lumineuses préparées à l'avance, de la plus nette (0) à la plus floue (7)
  const NIVEAUX_FLOU = 8, taches = [];
  for (let k = 0; k < NIVEAUX_FLOU; k++){
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), d = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    const net = 1 - k / (NIVEAUX_FLOU - 1);              // 1 = bord net, 0 = bord très doux
    d.addColorStop(0, 'rgba(' + TEINTE + ',1)');
    d.addColorStop(0.35 + 0.5 * net, 'rgba(' + TEINTE + ',' + (0.55 + 0.4 * net) + ')');
    d.addColorStop(1, 'rgba(' + TEINTE + ',0)');
    g.fillStyle = d; g.fillRect(0, 0, 64, 64);
    taches.push(c);
  }

  // Adapte la taille du dessin à l'écran (net aussi sur iPad et téléphone)
  function redimensionner(){
    const r = window.devicePixelRatio || 1;
    largeur = toile.clientWidth; hauteur = toile.clientHeight;
    toile.width = largeur * r; toile.height = hauteur * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    focale = Math.max(largeur, 900) * 1.6;      // grande focale = effet téléobjectif, comme maa.org
    // On cale l'image pour que le bord lointain de la nappe passe juste au-dessus du haut de l'écran :
    // ainsi la nappe remplit tout le haut, sans « horizon » visible.
    const dyLoin = -HAUTEUR_CAMERA;
    const vLoin = dyLoin * cosI + PROFONDEUR * sinI, dLoin = PROFONDEUR * cosI - dyLoin * sinI;
    centreY = -hauteur * HORIZON + vLoin * focale / dLoin;
  }

  // Relief de la nappe
  function altitude(x, z){
    // presque plate : une seule longue ondulation, très douce
    return 3.2 * Math.sin(0.030 * x + 0.022 * z + t)
         + 1.0 * Math.sin(0.045 * x - 0.018 * z + 0.6 * t + 1.3);
  }

  // Projection en perspective, caméra au-dessus de la nappe qui regarde vers l'avant et un peu vers le bas
  // Renvoie [x écran, y écran, distance] ou null si le point est derrière l'œil
  function projeter(x, y, z){
    const dy = y - HAUTEUR_CAMERA;
    const d = z * cosI - dy * sinI;          // distance le long du regard
    if (d < 0.5) return null;
    const v = dy * cosI + z * sinI;          // hauteur dans l'image
    return [largeur / 2 + x * focale / d, centreY - v * focale / d, d];
  }

  // Le maillage : rangées décalées d'un demi-pas une sur deux → des TRIANGLES
  const HAUT_RANGEE = PAS * Math.sqrt(3) / 2;
  const RANGEES = Math.ceil((PROFONDEUR - DEBUT) / HAUT_RANGEE);

  function dessiner(){
    ctx.clearRect(0, 0, largeur, hauteur);
    const marge = 60;
    const grille = [];
    for (let j = 0; j < RANGEES; j++){
      const z = DEBUT + j * HAUT_RANGEE;
      const decalage = (j % 2) * PAS / 2;
      // largeur utile de la rangée (on ne calcule que ce qui peut être visible)
      const demi = Math.ceil(((largeur / 2 + marge) * (z + HAUTEUR_CAMERA) / focale) / PAS) + 2;
      const ligne = new Map();
      for (let i = -demi; i <= demi; i++){
        const x = i * PAS + decalage;
        const p = projeter(x, altitude(x, z), z);
        if (p) ligne.set(i, p);
      }
      grille.push(ligne);
    }

    // Flou selon l'écart à la distance de mise au point (0 = net)
    // (le flou monte plus vite au premier plan qu'au loin, comme en photo)
    const flou = d => Math.min(1, d < MISE_AU_POINT ? (MISE_AU_POINT - d) / (MISE_AU_POINT * 0.30) : (d - MISE_AU_POINT) / (MISE_AU_POINT * 0.60));
    const visible = p => p[0] > -marge && p[0] < largeur + marge && p[1] > -marge && p[1] < hauteur + marge;

    // Traits, regroupés par niveau d'opacité pour aller vite
    const PAQUETS = 6, chemins = Array.from({length: PAQUETS}, () => []);
    function trait(a, b){
      if (!a || !b || (!visible(a) && !visible(b))) return;
      const f = flou((a[2] + b[2]) / 2);
      const k = Math.min(PAQUETS - 1, Math.floor(f * PAQUETS));
      if (k < PAQUETS - 1) chemins[k].push(a, b);       // les traits très flous disparaissent
    }
    for (let j = 0; j < RANGEES; j++){
      const ligne = grille[j], suivante = grille[j + 1];
      const dec = j % 2;   // rangée paire : voisins du dessus en i-1 et i ; impaire : en i et i+1
      for (const [i, p] of ligne){
        trait(p, ligne.get(i + 1));
        if (suivante){ trait(p, suivante.get(i - 1 + dec)); trait(p, suivante.get(i + dec)); }
      }
    }
    ctx.lineWidth = 0.8;
    for (let k = 0; k < PAQUETS; k++){
      const c = chemins[k]; if (!c.length) continue;
      ctx.strokeStyle = 'rgba(' + TEINTE + ',' + (OPACITE_TRAIT * (1 - k / PAQUETS)) + ')';
      ctx.beginPath();
      for (let n = 0; n < c.length; n += 2){ ctx.moveTo(c[n][0], c[n][1]); ctx.lineTo(c[n + 1][0], c[n + 1][1]); }
      ctx.stroke();
    }

    // Points : nets à la bonne distance, grosses taches douces quand ils sont flous
    for (let j = RANGEES - 1; j >= 0; j--){          // du plus loin au plus proche
      for (const p of grille[j].values()){
        if (!visible(p)) continue;
        const f = flou(p[2]);
        const rayon = TAILLE_POINT * focale / p[2] * (1 + 2.2 * f) + 0.45;
        const brume = Math.max(0, 1 - Math.max(0, p[2] - 170) / 60);   // les points très lointains se fondent dans le bleu
        ctx.globalAlpha = OPACITE_POINT * brume / (1 + 5 * f * f);
        const tache = taches[Math.round(f * (NIVEAUX_FLOU - 1))];
        ctx.drawImage(tache, p[0] - rayon, p[1] - rayon, rayon * 2, rayon * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function boucle(){
    t += VITESSE;
    dessiner();
    if (!immobile) requestAnimationFrame(boucle);
  }

  window.addEventListener('resize', () => { caler(); redimensionner(); dessiner(); });
  redimensionner();
  boucle();
})();
