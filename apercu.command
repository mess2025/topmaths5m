#!/bin/zsh
# Double-cliquer sur ce fichier pour voir le site sur le Mac.
# Le site s'ouvre dans le navigateur et se met à jour à chaque enregistrement.
cd "$(dirname "$0")"
/opt/homebrew/bin/quarto preview --port 4321
