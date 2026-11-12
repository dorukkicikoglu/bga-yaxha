# Yaxha rules summary

Summary of the published rulebook (Baptiste Vaiana, 2 to 4 players, about 20 minutes), written for development of the BGA adaptation. Items marked [OPEN] are not settled by the rulebook and need a decision or a check against the code.

## Components

- 120 cubes, 24 in each of 5 colours: orange, yellow, green, white, blue
- One Market tile per player (up to 4)
- Each player has a hand of player cards, one per Market tile in play
- Turn Order tiles numbered 1 to N (N = player count)
- 18 bonus cards, 3 used per game
- Scoring table on the scoring card

## Setup

1. All cubes go in the bag.
2. Lay out as many Market tiles as there are players.
3. Each player gets one card for each Market tile in play.
4. Deal the Turn Order tiles randomly, one per player (only tiles 1 to N are used).
5. Reveal 3 random bonus cards. The rulebook suggests a fixed beginner set for a first game.

## Round structure

The game lasts exactly 10 rounds. Each round has two phases.

### 1. Collecting cubes

1. Draw 3 cubes from the bag onto each Market tile, at random.
2. All players secretly and simultaneously pick one card from their hand, naming the Market tile they want. Then everyone reveals.
3. If a player's choice is unique, they take all 3 cubes from that tile.
4. If several players chose the same tile, the one with the lowest Turn Order number gets it.
5. The losing tied players wait until every untied player has taken their cubes. Then, in Turn Order, they each choose one of the tiles nobody chose.
6. Turn Order tiles are swapped among the tied players after collecting:
   - 2 tied: they swap.
   - 3 tied: the lowest and highest swap; the middle player keeps theirs.
   - 4 tied: 1 swaps with 4, and 2 swaps with 3.
7. Everyone takes their played card back into hand, so all choices are available every round.

Examples from the rulebook:
- 4 players, all different tiles: everyone takes their own tile.
- 2 tied (tiles 1 and 3): player 1 takes the contested tile, the untied players take theirs, player 3 takes the leftover tile, then 1 and 3 swap.
- 3 tied (tiles 1, 2, 3): player 1 takes the contested tile, player 4 takes theirs, player 2 picks from the two leftovers, player 3 takes the last one. 1 and 3 swap; 2 keeps.
- 4 tied: player 1 takes the contested tile, then 2, 3 and 4 pick from the rest in that order. 1 swaps with 4, 2 swaps with 3.

[OPEN] With 4 players, two separate pairs can tie on two different tiles. The rulebook does not cover this case. The natural reading is to resolve each pair as above, with leftover choices made in global Turn Order, and each pair swapping its own tiles.

### 2. Building the pyramid

Each player must place the 3 cubes they just collected immediately.

Pyramid shape (30 spaces total, which is exactly 10 rounds x 3 cubes):
- Level 1: 4x4 (16)
- Level 2: 3x3 (9)
- Level 3: 2x2 (4)
- Level 4: 1x1 (1)

Placement rules:
- a) Every cube must touch a cube already placed, except the very first one.
- b) A higher level can be started before the lower level is complete, but any cube on level 2 or above must sit on 4 cubes beneath it.
- c) On level 2 and above, the cube must also be on or next to a cube of the same colour. "On" means at least one of the 4 cubes below it is that colour.
- A cube that cannot legally be placed is discarded, back into the box rather than the bag.

[OPEN] For rule (c), "next to" presumably means orthogonally adjacent on the same level. Diagonals do not seem to count.

## Game end and scoring

After round 10:

1. For each colour, find the player's largest group of adjacent cubes of that colour. Groups connect across levels (a cube touches the cubes directly under and over it).
2. Only visible cubes count, even if only partly visible. On a complete pyramid, the 4 centre cubes of level 1 and the centre cube of level 2 are hidden and do not count.
3. Convert each colour's largest group size to points:

| Group size | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Points | 1 | 2 | 4 | 6 | 9 | 12 | 15 | 18 | 21 | 25 | 30 | 36 |

4. Add bonus card points.
5. The highest total wins. Ties share the victory, with no tiebreaker.

[OPEN] The table stops at 12, but a group could be larger. Check what the code does above 12.
[OPEN] A cube on an incomplete pyramid may be visible even if its position would normally be hidden. Visibility should be calculated from the actual pyramid, not assumed from position.

## Bonus cards (18 total, 3 per game, 5 points each)

If players tie for a bonus, all of them score it. A player can score several bonus cards.

Compared between players:
- Largest group of a specific colour (5 cards, one per colour)
- Largest single-colour group, any colour
- Largest single-colour group that is at least partly on level 1, counting only its level 1 cubes
- Single-colour group spanning the most levels (maximum 4)
- Second-largest single-colour group, any colour
- Larger group of a specific colour than your left-hand neighbour (5 cards, one per colour). Not used in 2-player games.

Personal goals:
- All 5 colours visible on level 1
- All 5 colours visible on level 2
- A single colour across one whole side of the pyramid
- Exactly 3 colours visible on the pyramid

[OPEN] "Second-largest group": does it mean each player's own second-largest group, compared with other players' second-largest, or something else? Check the code.
[OPEN] "Left-hand neighbour" needs a fixed definition in BGA seat order.
[OPEN] "One side of the pyramid": presumably all cubes visible from one side (the outer row of each level on that edge). Confirm with the code.
[OPEN] The personal goals are presumably scored by everyone who meets them, rather than only the best player.
