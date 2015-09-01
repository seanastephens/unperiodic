Rscript tsne.R | tail -n+2 | python3 r2json.py > tsne.json
Rscript cmds.R | tail -n+2 | python3 r2json.py > cmds.json
cp cmds.json tsne.json ../data/
