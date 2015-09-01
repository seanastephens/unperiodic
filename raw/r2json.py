# Convert Rscript X,Y values to json

import sys
import json

data = {}
for i,line in enumerate(sys.stdin):
    _,x,y = line.split()
    data[str(i+1)] = {'x': x, 'y': y}

print(json.dumps(data))
    

