
/* =========================================================
   2) ÉCRANS D'EXTRAITS : dans chaque « .ecran », les vidéos
      défilent l'une après l'autre avec un fondu enchaîné.
      data-decalage = nombre de secondes d'attente avant de démarrer
      (pour que plusieurs écrans ne changent pas en même temps).
   ========================================================= */
document.querySelectorAll('.ecran').forEach(ecran => {
  const videos = [...ecran.querySelectorAll('video')];
  const bloc = ecran.parentElement;
  const titre = bloc.querySelector('.legende .titre');
  const domaine = bloc.querySelector('.legende .domaine');
  const points = bloc.querySelector('.points');
  const AVANCE_FONDU = 1.2;    // secondes avant la fin où le fondu commence
  let actuel = 0, enTransition = false;

  // Un petit point par extrait (s'il y a une zone prévue pour)
  if (points) videos.forEach(() => points.appendChild(document.createElement('i')));
  const pastilles = points ? [...points.children] : [];

  // Mode capture d'écran (adresse terminée par « ?capture ») : image fixe à la place
  // de la vidéo, car les outils de capture ne savent pas photographier une vidéo.
  if (location.search.includes('capture')){
    const img = document.createElement('img');
    img.src = videos[0].poster; img.className = 'visible';
    ecran.appendChild(img);
    videos.forEach(v => v.style.display = 'none');
    if (pastilles[0]) pastilles[0].classList.add('actif');
    return;
  }

  // Affiche l'extrait numéro n et met à jour la légende
  function montrer(n){
    const v = videos[n];
    v.currentTime = 0;
    v.play().catch(() => {});                  // si le navigateur refuse : l'image fixe reste
    videos.forEach((autre, k) => autre.classList.toggle('visible', k === n));
    pastilles.forEach((p, k) => p.classList.toggle('actif', k === n));
    if (titre){
      titre.style.opacity = 0; domaine.style.opacity = 0;
      setTimeout(() => {
        titre.textContent = v.dataset.titre; domaine.textContent = v.dataset.domaine;
        titre.style.opacity = 1; domaine.style.opacity = 1;
      }, 600);
    }
    videos[(n + 1) % videos.length].preload = 'auto';   // prépare le suivant
  }

  // Quand la fin d'un extrait approche, on passe au suivant
  videos.forEach((v, k) => v.addEventListener('timeupdate', () => {
    if (k !== actuel || enTransition || !v.duration) return;
    if (v.currentTime > v.duration - AVANCE_FONDU){
      enTransition = true;
      actuel = (actuel + 1) % videos.length;
      montrer(actuel);
      setTimeout(() => { v.pause(); enTransition = false; }, 1500);
    }
  }));

  // Premier extrait : image fixe visible tout de suite, lecture après le décalage éventuel
  videos[0].classList.add('visible');
  setTimeout(() => montrer(0), (parseFloat(ecran.dataset.decalage) || 0) * 1000);
});
