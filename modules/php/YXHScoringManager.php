<?php

class YXHScoringManager extends APP_DbObject
{
    public $parent;
    private $bonusCardsManager;

    function __construct($parent)
    {
        $this->parent = $parent;
        $this->bonusCardsManager = new YXHBonusCardsManager($parent);
    }

    public function getEndGameScoring(): array {
        $scores = [];

        $players = $this->parent->loadPlayersBasicInfos();
        $pyramidDataByPlayerId = [];
        
        foreach($players as $player_id => $player) {
            $playerPyramidData = $this->parent->pyramidManager->getPlayerPyramidData($player_id);
            $visibleCubes = $this->getVisibleCubes($playerPyramidData);
            $pyramidDataByPlayerId[$player_id] = $visibleCubes;
            $scores[$player_id] = $this->getColorGroupScores($visibleCubes);
        }

        $scores = $this->bonusCardsManager->addBonusCardScores($scores, $pyramidDataByPlayerId);

        foreach($scores as $player_id => $playerScore){ //prune data to send to client
            $scores[$player_id]['player_id'] = $player_id;
            $scores[$player_id]['total'] = $playerScore['color_total'] + $playerScore['bonus_card_total'];
            unset($scores[$player_id]['color_total']);
            unset($scores[$player_id]['bonus_card_total']);
            unset($scores[$player_id]['groups_by_color']);
            unset($scores[$player_id]['color_size']);
        }
        $winnerIDs = [];
        $maxScore = 0;
        foreach ($scores as $playerId => $playerScore) {
            if ($playerScore['total'] > $maxScore) {
                $winnerIDs = [$playerId];
                $maxScore = $playerScore['total'];
            } else if ($playerScore['total'] == $maxScore) {
                $winnerIDs[] = $playerId;
            }
        }

        return [
            'winner_ids' => $winnerIDs,
            'player_scores' => $scores
        ];
    }

    private function getColorGroupScores(array $visibleCubes): array {
        $colorGroupScores = ['color_points' => [], 'color_size' => []];
        $totalColorScore = 0;
        $groupsByColor = [];

        $cubesByColor = [];
        foreach($visibleCubes as $cube) {
            $colorIndex = (int) $cube['color'];
            $cubesByColor[$colorIndex][] = $cube;
        }

        foreach(CUBE_COLORS as $colorIndex => $color) {
            if(!isset($cubesByColor[$colorIndex])){
                $colorGroupScores['color_points'][$colorIndex] = 0;
                $colorGroupScores['color_size'][$colorIndex] = 0;
                continue;
            }

            $colorGroups = $this->getConnectedCubeGroups($cubesByColor[$colorIndex]);
            $groupsByColor[$colorIndex] = $colorGroups['groups'];

            $largestGroupSize = $colorGroups['largest_group_size'];
            $colorScore = $largestGroupSize >= count(LARGEST_GROUP_POINTS) ? LARGEST_GROUP_POINTS[count(LARGEST_GROUP_POINTS) - 1] : LARGEST_GROUP_POINTS[$largestGroupSize];
            $colorGroupScores['color_points'][$colorIndex] = $colorScore;
            $colorGroupScores['color_size'][$colorIndex] = $largestGroupSize;
            $totalColorScore += $colorScore;
        }

        $colorGroupScores['color_total'] = $totalColorScore;
        $colorGroupScores['groups_by_color'] = $groupsByColor;

        return $colorGroupScores;
    }

    private function getConnectedCubeGroups(array $cubes): array {
        $groups = [];
        $largestGroupIndex = 0;
        $largestGroupSize = 0;
        $visited = [];

        // Helper function to check if two cubes are neighbors
        $areNeighbors = function($cube1, $cube2) {
            $neighbors = $this->getNeighborsOfCube($cube1);
            foreach ($neighbors as $neighbor) {
                if ($neighbor[0] == $cube2['pos_x'] && 
                    $neighbor[1] == $cube2['pos_y'] && 
                    $neighbor[2] == $cube2['pos_z']) {
                    return true;
                }
            }
            return false;
        };

        // Helper function for DFS
        $dfs = function($cube, &$currentGroup) use (&$dfs, &$visited, &$cubes, $areNeighbors) {
            $visited[$cube['cube_id']] = true;
            $currentGroup[] = $cube;

            foreach ($cubes as $nextCube) {
                if (!isset($visited[$nextCube['cube_id']]) && $areNeighbors($cube, $nextCube)) {
                    $dfs($nextCube, $currentGroup);
                }
            }
        };

        // Find all connected components
        foreach ($cubes as $cube) {
            if (!isset($visited[$cube['cube_id']])) {
                $currentGroup = [];
                $dfs($cube, $currentGroup);
                $groups[] = $currentGroup;
                
                // Update largest group info
                if (count($currentGroup) > $largestGroupSize) {
                    $largestGroupSize = count($currentGroup);
                    $largestGroupIndex = count($groups) - 1;
                }
            }
        }

        return ['groups' => $groups, 'largest_group_index' => $largestGroupIndex, 'largest_group_size' => $largestGroupSize];
    }

    public function getNeighborsOfCube(array $cube): array {
        $posX = (int) $cube['pos_x'];
        $posY = (int) $cube['pos_y'];
        $posZ = (int) $cube['pos_z'];

        $neighbors = [];

        $neighbors[] = [$posX + 1, $posY, $posZ];
        $neighbors[] = [$posX - 1, $posY, $posZ];
        $neighbors[] = [$posX, $posY + 1, $posZ];
        $neighbors[] = [$posX, $posY - 1, $posZ];

        if($posZ < PYRAMID_MAX_SIZE - 1){ //check upper layer
            $neighbors[] = [$posX, $posY, $posZ + 1];
            $neighbors[] = [$posX - 1, $posY, $posZ + 1];
            $neighbors[] = [$posX, $posY - 1, $posZ + 1];
            $neighbors[] = [$posX - 1, $posY - 1, $posZ + 1];
        }

        if($posZ > 0){ //check lower layer
            $neighbors[] = [$posX, $posY, $posZ - 1];
            $neighbors[] = [$posX + 1, $posY, $posZ - 1];
            $neighbors[] = [$posX, $posY + 1, $posZ - 1];
            $neighbors[] = [$posX + 1, $posY + 1, $posZ - 1];
        }

        return $neighbors;
    }

    private function getVisibleCubes(array $pyramidData): array {
        $visibleCubes = [];
        $pyramidDataByPosXYZ = [];
        foreach($pyramidData as $cube)
            $pyramidDataByPosXYZ[(int) $cube['pos_x']][(int) $cube['pos_y']][(int) $cube['pos_z']] = $cube;
        
        foreach($pyramidData as $cube)
            if($this->isCubeVisibleFromTop($cube, $pyramidDataByPosXYZ))
                $visibleCubes[] = $cube;

        return $visibleCubes;
    }

    public function isCubeVisibleFromTop(array $cube, array $pyramidDataByPosXYZ): bool {
        $posX = (int) $cube['pos_x'];
        $posY = (int) $cube['pos_y'];
        $posZ = (int) $cube['pos_z'];

        $cubesAbove = [
            [$posX, $posY, $posZ + 1],
            [$posX - 1, $posY, $posZ + 1],
            [$posX, $posY - 1, $posZ + 1],
            [$posX - 1, $posY - 1, $posZ + 1],
        ];
        
        foreach($cubesAbove as $cubeAbove){
            if(!isset($pyramidDataByPosXYZ[$cubeAbove[0]][$cubeAbove[1]][$cubeAbove[2]]))
                return true;
        }

        return false;
    }
}
