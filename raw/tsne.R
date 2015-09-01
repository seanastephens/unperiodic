library(tsne)

raw <- read.csv("atom_nums.csv")

distance <- dist(raw)
points <- tsne(distance, initial_config=cmdscale(distance))

print(points)
