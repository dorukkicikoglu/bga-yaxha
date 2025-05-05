<?php

class YXHBonusCardsManager extends APP_DbObject
{
    public $parent;

    function __construct($parent)
    {
        $this->parent = $parent;
    }

    public function addBonusCardScores(array $scores, array $pyramidDataByPlayerId): array {
        foreach($scores as $playerID => $playerScore)
            $scores[$playerID]['bonus_card_points'] = [];

        $bonusCardIDs = $this->getObjectListFromDB("SELECT bonus_card_id FROM bonus_cards", true);
        
        foreach($bonusCardIDs as $bonusCardIDStr){
            $bonusCardID = intval($bonusCardIDStr);

            if($bonusCardID == BONUS_CARD_LARGEST_ORANGE)
                $scores = $this->addCardBonusForLargestColor($scores, CUBE_COLOR_ORANGE);
            else if($bonusCardID == BONUS_CARD_LARGEST_BLUE)
                $scores = $this->addCardBonusForLargestColor($scores, CUBE_COLOR_BLUE);
            else if($bonusCardID == BONUS_CARD_LARGEST_GREEN)
                $scores = $this->addCardBonusForLargestColor($scores, CUBE_COLOR_GREEN);
            else if($bonusCardID == BONUS_CARD_LARGEST_YELLOW)
                $scores = $this->addCardBonusForLargestColor($scores, CUBE_COLOR_YELLOW);
            else if($bonusCardID == BONUS_CARD_LARGEST_WHITE)
                $scores = $this->addCardBonusForLargestColor($scores, CUBE_COLOR_WHITE);
            else if($bonusCardID == BONUS_CARD_LARGER_RIGHT_ORANGE)
                $scores = $this->getCardBonusForLargerRightColor($scores, CUBE_COLOR_ORANGE);
            else if($bonusCardID == BONUS_CARD_LARGER_RIGHT_BLUE)
                $scores = $this->getCardBonusForLargerRightColor($scores, CUBE_COLOR_BLUE);
            else if($bonusCardID == BONUS_CARD_LARGER_RIGHT_GREEN)
                $scores = $this->getCardBonusForLargerRightColor($scores, CUBE_COLOR_GREEN);
            else if($bonusCardID == BONUS_CARD_LARGER_RIGHT_YELLOW)
                $scores = $this->getCardBonusForLargerRightColor($scores, CUBE_COLOR_YELLOW);
            else if($bonusCardID == BONUS_CARD_LARGER_RIGHT_WHITE)
                $scores = $this->getCardBonusForLargerRightColor($scores, CUBE_COLOR_WHITE);
            else if($bonusCardID == BONUS_CARD_LARGEST_GROUP_ANY_COLOR)
                $scores = $this->getCardBonusForLargestGroupAnyColor($scores);
            else if($bonusCardID == BONUS_CARD_LARGEST_GROUP_ANY_COLOR_LEVEL_1)
                $scores = $this->getCardBonusForLargestGroupAnyColorLevel1($scores, $pyramidDataByPlayerId);
            else if($bonusCardID == BONUS_CARD_GROUP_WITH_MOST_LEVELS)
                $scores = $this->getCardBonusForGroupWithMostLevels($scores);
            else if($bonusCardID == BONUS_CARD_SECOND_LARGEST_GROUP)
                $scores = $this->getCardBonusForSecondLargestGroup($scores);
            else if($bonusCardID == BONUS_CARD_5_COLORS_LEVEL_1)
                $scores = $this->getCardBonusFor5ColorsLevel($scores, $pyramidDataByPlayerId, 0);
            else if($bonusCardID == BONUS_CARD_SINGLE_COLOR_ONE_SIDE)
                $scores = $this->getCardBonusForSingleColorOneSide($scores, $pyramidDataByPlayerId);
            else if($bonusCardID == BONUS_CARD_3_COLORS)
                $scores = $this->getCardBonusFor3Colors($scores, $pyramidDataByPlayerId);
            else if($bonusCardID == BONUS_CARD_5_COLORS_LEVEL_2)
                $scores = $this->getCardBonusFor5ColorsLevel($scores, $pyramidDataByPlayerId, 1);
            else throw new \BgaUserException(sprintf(clienttranslate('Invalid bonus card ID: %d'), $bonusCardID));

        }

        foreach($scores as $playerID => $playerScore)
            $scores[$playerID]['bonus_card_total'] = array_sum($scores[$playerID]['bonus_card_points']);

        return $scores;
    }

    private function addCardBonusForLargestColor(array $scores, int $color): array {
        if($color == CUBE_COLOR_ORANGE)
            $bonusCardID = BONUS_CARD_LARGEST_ORANGE;
        else if($color == CUBE_COLOR_BLUE)
            $bonusCardID = BONUS_CARD_LARGEST_BLUE;
        else if($color == CUBE_COLOR_GREEN)
            $bonusCardID = BONUS_CARD_LARGEST_GREEN;
        else if($color == CUBE_COLOR_YELLOW)
            $bonusCardID = BONUS_CARD_LARGEST_YELLOW;
        else if($color == CUBE_COLOR_WHITE)
            $bonusCardID = BONUS_CARD_LARGEST_WHITE;
        else throw new \BgaUserException(sprintf(clienttranslate('Invalid color: %d'), $color));

        $maxSize = 0;
        $highestPlayerIDs = [];
        
        // Find highest score for this color
        foreach($scores as $playerId => $playerScore) {
            $colorSize = $playerScore['color_size'][$color];
            if($colorSize > $maxSize) {
                $maxSize = $colorSize;
                $highestPlayerIDs = [$playerId => 1];
            }
            else if($colorSize == $maxSize) {
                $highestPlayerIDs[$playerId] = 1;
            }
        }

        foreach($scores as $playerId => $playerScore) {
            $cardBonus = isset($highestPlayerIDs[$playerId]) ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusForLargerRightColor(array $scores, int $color): array {
        if($color == CUBE_COLOR_ORANGE)
            $bonusCardID = BONUS_CARD_LARGER_RIGHT_ORANGE;
        else if($color == CUBE_COLOR_BLUE)
            $bonusCardID = BONUS_CARD_LARGER_RIGHT_BLUE;
        else if($color == CUBE_COLOR_GREEN)
            $bonusCardID = BONUS_CARD_LARGER_RIGHT_GREEN;
        else if($color == CUBE_COLOR_YELLOW)
            $bonusCardID = BONUS_CARD_LARGER_RIGHT_YELLOW;
        else if($color == CUBE_COLOR_WHITE)
            $bonusCardID = BONUS_CARD_LARGER_RIGHT_WHITE;
        else throw new \BgaUserException(sprintf(clienttranslate('Invalid color: %d'), $color));

        $nextPlayerTable = $this->parent->getNextPlayerTable();

        foreach($nextPlayerTable as $leftPlayerID => $rightPlayerID) {
            if(!isset($scores[$leftPlayerID]) || !isset($scores[$rightPlayerID]))
                continue;

            $rightPlayerSize = $scores[$rightPlayerID]['color_size'][$color];
            $leftPlayerSize = $scores[$leftPlayerID]['color_size'][$color];

            $cardBonus = $leftPlayerSize > $rightPlayerSize ? BONUS_CARD_POINTS : 0;
            $scores[$leftPlayerID]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusForLargestGroupAnyColor(array $scores): array {
        $bonusCardID = BONUS_CARD_LARGEST_GROUP_ANY_COLOR;

        $maxSize = 0;
        $highestPlayerIDs = [];

        foreach($scores as $playerId => $playerScore) {
            foreach(CUBE_COLORS as $colorIndex => $color) {
                $colorSize = $playerScore['color_size'][$colorIndex];
                if($colorSize > $maxSize) {
                    $maxSize = $colorSize;
                    $highestPlayerIDs = [$playerId => 1];
                }
                else if($colorSize == $maxSize) {
                    $highestPlayerIDs[$playerId] = 1;
                }
            }
        }

        foreach($scores as $playerId => $playerScore) {
            $cardBonus = isset($highestPlayerIDs[$playerId]) ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusForLargestGroupAnyColorLevel1(array $scores, array $pyramidDataByPlayerId): array {
        $bonusCardID = BONUS_CARD_LARGEST_GROUP_ANY_COLOR_LEVEL_1;

        $playerToLevel1CubeColorCounts = [];
        foreach($pyramidDataByPlayerId as $playerId => $pyramidData) {
            foreach($pyramidData as $cube) {
                if((int) $cube['pos_z'] == 0){
                    if (!isset($playerToLevel1CubeColorCounts[$playerId][$cube['color']]))
                        $playerToLevel1CubeColorCounts[$playerId][$cube['color']] = 0;
                    
                    $playerToLevel1CubeColorCounts[$playerId][$cube['color']]++;
                }
            }
        }

        $maxSize = 0;
        $highestPlayerIDs = [];

        foreach($playerToLevel1CubeColorCounts as $playerId => $colorCounts) {
            foreach($colorCounts as $colorIndex => $count) {
                if($count > $maxSize) {
                    $maxSize = $count;
                    $highestPlayerIDs = [$playerId => 1];
                }
                else if($count == $maxSize) {
                    $highestPlayerIDs[$playerId] = 1;
                }
            }
        }

        foreach($scores as $playerId => $playerScore) {
            $cardBonus = isset($highestPlayerIDs[$playerId]) ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusForGroupWithMostLevels(array $scores): array {
        $bonusCardID = BONUS_CARD_GROUP_WITH_MOST_LEVELS;

        $maxLevels = 0;
        $highestPlayerIDs = [];

        foreach ($scores as $playerId => $playerScore) {
            $playerMaxLevels = 0;
            
            foreach ($playerScore['groups_by_color'] as $colorGroups) {
                foreach ($colorGroups as $group) {
                    $uniqueLevels = [];
                    foreach ($group as $cube) {
                        $level = (int) $cube['pos_z'];
                        $uniqueLevels[$level] = 1;
                    }
                    $levelCount = count($uniqueLevels);
                    if ($levelCount > $playerMaxLevels) {
                        $playerMaxLevels = $levelCount;
                    }
                }
            }

            if ($playerMaxLevels > $maxLevels) {
                $maxLevels = $playerMaxLevels;
                $highestPlayerIDs = [$playerId => 1];
            } else if ($playerMaxLevels == $maxLevels) {
                $highestPlayerIDs[$playerId] = 1;
            }
        }

        foreach ($scores as $playerId => $playerScore) {
            $cardBonus = isset($highestPlayerIDs[$playerId]) ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusForSecondLargestGroup(array $scores): array {
        $bonusCardID = BONUS_CARD_SECOND_LARGEST_GROUP;

        $groupSizeToPlayerIDs = [];
        $uniqueGroupSizes = [];

        foreach ($scores as $playerId => $playerScore) {
            $playerGroupSizes = [];
            foreach ($playerScore['groups_by_color'] as $colorGroups) {
                foreach ($colorGroups as $group) {
                    $size = count($group);

                    if(!isset($groupSizeToPlayerIDs[$size]))
                        $groupSizeToPlayerIDs[$size] = [];

                    $groupSizeToPlayerIDs[$size][$playerId] = 1;

                    $uniqueGroupSizes[$size] = 1;
                }
            }
        }

        $uniqueGroupSizes = array_keys($uniqueGroupSizes);
        rsort($uniqueGroupSizes);

        $highestPlayerIDs = count($uniqueGroupSizes) >= 2 ? $groupSizeToPlayerIDs[$uniqueGroupSizes[1]] : [];

        foreach($scores as $playerId => $playerScore) {
            $cardBonus = isset($highestPlayerIDs[$playerId]) ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusFor5ColorsLevel(array $scores, array $pyramidDataByPlayerId, int $level): array {
        if($level == 0)
            $bonusCardID = BONUS_CARD_5_COLORS_LEVEL_1;
        else if($level == 1)
            $bonusCardID = BONUS_CARD_5_COLORS_LEVEL_2;
        else throw new \BgaUserException(sprintf(clienttranslate('Invalid level: %d'), $level));

        foreach ($pyramidDataByPlayerId as $playerId => $pyramidData) {
            $uniqueColors = [];
            foreach ($pyramidData as $cube)
                if ($cube['pos_z'] == $level)
                    $uniqueColors[$cube['color']] = 1;
            
            $cardBonus = count($uniqueColors) >= 5 ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusForSingleColorOneSide(array $scores, array $pyramidDataByPlayerId): array {
        $bonusCardID = BONUS_CARD_SINGLE_COLOR_ONE_SIDE;

        $isSideSingleColor = function(array $sideCubes) {
            $uniqueColors = [];
            foreach($sideCubes as $index1 => $cubesByZ) {
                foreach($cubesByZ as $index2 => $cube) {
                    $uniqueColors[$cube['color']] = 1;
                    if(count($uniqueColors) > 1)
                        return false;
                }
            }

            return true;
        };

        foreach ($pyramidDataByPlayerId as $playerId => $pyramidData) {
            $cubesBySide = [
                'left' => [],
                'right' => [],
                'top' => [],
                'bottom' => []
            ];

            $cubesByXYZ = [];

            foreach ($pyramidData as $cube) {
                $posX = (int) $cube['pos_x'];
                $posY = (int) $cube['pos_y'];
                $posZ = (int) $cube['pos_z'];

                $cubesByXYZ[$posX][$posY][$posZ] = $cube;
            }

            foreach ($pyramidData as $cube) {
                $posX = (int) $cube['pos_x'];
                $posY = (int) $cube['pos_y'];
                $posZ = (int) $cube['pos_z'];

                if(!isset($cubesBySide['left'][$posY][$posZ]))
                    $cubesBySide['left'][$posY][$posZ] = $cube;
                else if($posX < (int) $cubesBySide['left'][$posY][$posZ]['pos_x'])
                    $cubesBySide['left'][$posY][$posZ] = $cube;

                if(!isset($cubesBySide['right'][$posY][$posZ]))
                    $cubesBySide['right'][$posY][$posZ] = $cube;
                else if($posX > (int) $cubesBySide['right'][$posY][$posZ]['pos_x'])
                    $cubesBySide['right'][$posY][$posZ] = $cube;

                if(!isset($cubesBySide['top'][$posX][$posZ]))
                    $cubesBySide['top'][$posX][$posZ] = $cube;
                else if($posY > (int) $cubesBySide['top'][$posX][$posZ]['pos_y'])
                    $cubesBySide['top'][$posX][$posZ] = $cube;

                if(!isset($cubesBySide['bottom'][$posX][$posZ]))
                    $cubesBySide['bottom'][$posX][$posZ] = $cube;
                else if($posY < (int) $cubesBySide['bottom'][$posX][$posZ]['pos_y'])
                    $cubesBySide['bottom'][$posX][$posZ] = $cube;
            }

            $hasSingleColorSide = false;
            foreach($cubesBySide as $side => $cubes) {
                if($isSideSingleColor($cubes)){
                    $hasSingleColorSide = true;
                    break;
                }
            }

            $cardBonus = $hasSingleColorSide ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }

    private function getCardBonusFor3Colors(array $scores, array $pyramidDataByPlayerId): array {
        $bonusCardID = BONUS_CARD_3_COLORS;

        foreach ($pyramidDataByPlayerId as $playerId => $pyramidData) {
            $uniqueColors = [];
            foreach ($pyramidData as $cube) 
                $uniqueColors[$cube['color']] = 1;
            
            $cardBonus = count($uniqueColors) == 3 ? BONUS_CARD_POINTS : 0;
            $scores[$playerId]['bonus_card_points'][$bonusCardID] = $cardBonus;
        }

        return $scores;
    }
}
