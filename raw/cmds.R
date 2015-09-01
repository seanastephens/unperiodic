raw <- read.csv("atom_nums.csv")

distance <- dist(raw)
points <- cmdscale(distance)

print(points)
