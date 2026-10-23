#!/bin/zsh
# Double-cliquer sur ce fichier pour METTRE EN LIGNE le site.
# Il fabrique le site, le sauvegarde sur GitHub, puis le publie sur topmaths5m.fr.
cd "$(dirname "$0")"
echo "1/3 Sauvegarde des fichiers…"
git add -A
git commit -q -m "Mise à jour du $(date '+%d/%m/%Y %H:%M')" || echo "(rien de nouveau à sauvegarder)"
git push -q
echo "2/3 Fabrication et mise en ligne…"
/opt/homebrew/bin/quarto publish gh-pages --no-prompt --no-browser
echo ""
echo "3/3 Terminé ✅  Le site sera à jour sur https://topmaths5m.fr d'ici une à deux minutes."
echo "Vous pouvez fermer cette fenêtre."
