<?php

class YXHPyramidManager extends APP_DbObject{
    public $parent;
    
    function __construct($parent) {
        $this->parent = $parent;
    }

    public function getPyramidsData(array $players = [], bool $includeInConstruction = false): array {
        $pyramidsData = [];

        if(empty($players))
            $players = self::getObjectListFromDB("SELECT player_id FROM player", true);

        foreach ($players as $playerID)
            $pyramidsData[$playerID] = [];

        $sql = "SELECT card_id as cube_id, card_location_arg as owner_id, color, pos_x, pos_y, pos_z, order_in_construction FROM cubes WHERE card_location = 'pyramid' AND card_location_arg IN (" . implode(',', $players) . ")";
        if(!$includeInConstruction)
            $sql .= " AND order_in_construction IS NULL";

        $cubes = self::getObjectListFromDB($sql);

        foreach($cubes as $cube)
            $pyramidsData[$cube['owner_id']][] = $cube;

        foreach ($pyramidsData as $playerID => &$cubes) {
            usort($cubes, function($a, $b) {
                return (int) $a['pos_z'] - (int) $b['pos_z'];
            });
        }

        return $pyramidsData;
    }
    function getPlayerPyramidData(int $ownerID, bool $includeInConstruction = false){ $pyramids = $this->getPyramidsData([$ownerID], $includeInConstruction); return (isset($pyramids[$ownerID]) ? $pyramids[$ownerID] : []); }

    public function addCubeToPyramid($playerID, $cubeID, $posX, $posY, $posZ) {
        $this->checkBuildableState();
        $this->doesPlayerOwnCubeOnMarketTile($playerID, $cubeID);
        $this->isMoveValid($playerID, $cubeID, $posX, $posY, $posZ);
        
        // Get highest order_in_construction value for this player's cubes, defaulting to 0 if none exist
        $newOrderInConstruction = 1 + $this->getUniqueValueFromDB("SELECT COALESCE(MAX(order_in_construction), 0) FROM cubes WHERE order_in_construction IS NOT NULL AND card_location_arg = $playerID");

        $this->DbQuery("UPDATE cubes SET pos_x = $posX, pos_y = $posY, pos_z = $posZ, card_location = 'pyramid', card_location_arg = $playerID, order_in_construction = $newOrderInConstruction WHERE card_id = $cubeID");
        $this->parent->notify->player($playerID, 'cubePlacedInPyramid', '', []);
    }

    private function isMoveValid($playerID, $cubeID, $posX, $posY, $posZ){
        $cubeID = (int) $cubeID;
        $posX = (int) $posX;
        $posY = (int) $posY;
        $posZ = (int) $posZ;

        $cubeColor = (int) $this->getUniqueValueFromDB("SELECT color FROM cubes WHERE card_id = $cubeID");
        if($cubeColor === null || $cubeColor === false)
            throw new \BgaUserException(clienttranslate("Cube not found"));

        $pyramidData = $this->getPlayerPyramidData($playerID, true);
        if(empty($pyramidData))
            return;

        $thisLayerCubeCoordsXY_Color = [];
        $bottomLayerCubeCoordsXY_Color = [];
        $minX = $posX; $minY = $posY;
        $maxX = $posX; $maxY = $posY;

        foreach($pyramidData as $index => $cube){
            if((int) $cube['cube_id'] == $cubeID) //the last cube in construction might be in the pyramid
                continue;

            $pyrCubeX = (int) $cube['pos_x'];
            $pyrCubeY = (int) $cube['pos_y'];
            $pyrCubeZ = (int) $cube['pos_z'];
            $neighColor = (int) $cube['color'];

            if($pyrCubeX == $posX && $pyrCubeY == $posY && $pyrCubeZ == $posZ)
                throw new \BgaUserException(clienttranslate("Cube position already occupied"));
            
            if($pyrCubeZ == $posZ){
                $thisLayerCubeCoordsXY_Color[$pyrCubeX] = $thisLayerCubeCoordsXY_Color[$pyrCubeX] ?? [];
                $thisLayerCubeCoordsXY_Color[$pyrCubeX][$pyrCubeY] = $neighColor;
                
                $minX = min($minX, $pyrCubeX); $minY = min($minY, $pyrCubeY);
                $maxX = max($maxX, $pyrCubeX); $maxY = max($maxY, $pyrCubeY);
            } else if($pyrCubeZ == $posZ - 1) {
                $bottomLayerCubeCoordsXY_Color[$pyrCubeX][$pyrCubeY] = $neighColor;
            }
        }

        $layerSize = PYRAMID_MAX_SIZE - $posZ;
        if(($maxX - $minX) >= $layerSize || ($maxY - $minY) >= $layerSize)
            throw new \BgaUserException(clienttranslate("Cube position exceeds the layer size"));

        $neighborColors = [];

        $neighbors = [
            [$posX - 1, $posY],
            [$posX + 1, $posY], 
            [$posX, $posY + 1],
            [$posX, $posY - 1]
        ];

        foreach ($neighbors as $neighbor) {
            $neighX = $neighbor[0];
            $neighY = $neighbor[1];
            if (isset($thisLayerCubeCoordsXY_Color[$neighX][$neighY])) {
                $neighborColors[$thisLayerCubeCoordsXY_Color[$neighX][$neighY]] = 1;
            }
        }

        if($posZ == 0 && empty($neighborColors))
            throw new \BgaUserException(clienttranslate("Bottom layer cubes must be adjacent to another cube"));

        if($posZ > 0){
            $bottomNeighbors = [
                [$posX, $posY],
                [$posX + 1, $posY],
                [$posX, $posY + 1],
                [$posX + 1, $posY + 1]
            ];

            foreach ($bottomNeighbors as $neighbor) {
                $neighX = $neighbor[0];
                $neighY = $neighbor[1];
                if (isset($bottomLayerCubeCoordsXY_Color[$neighX][$neighY]))
                    $neighborColors[$bottomLayerCubeCoordsXY_Color[$neighX][$neighY]] = 1;
                else throw new \BgaUserException(clienttranslate("Bottom layer cube not found"));
            }
            
            if($posZ > 0 && !isset($neighborColors[$cubeColor]))
                throw new \BgaUserException(clienttranslate("No cube with the same color in contact"));
        }
    }

    public function moveCubeInPyramid($playerID, $cubeID, $posX, $posY, $posZ) {
        $this->checkBuildableState();
        $cube = $this->getObjectFromDB("SELECT card_location, card_location_arg, order_in_construction FROM cubes WHERE card_id = $cubeID");

        if ($cube['order_in_construction'] == null || $cube['card_location_arg'] != $playerID)
            throw new \BgaUserException(clienttranslate("You can only move cubes that you have placed in your pyramid"));

        if ($cube['order_in_construction'] != CUBES_PER_MARKET_TILE)
            throw new \BgaUserException(clienttranslate("You can only move the last cube placed"));

        $this->isMoveValid($playerID, $cubeID, $posX, $posY, $posZ);
        $this->DbQuery("UPDATE cubes SET pos_x = $posX, pos_y = $posY, pos_z = $posZ WHERE card_id = $cubeID");
    }

    public function switchCubeColor($playerID, $cubeID): void {
        $this->checkBuildableState();
        $this->doesPlayerOwnCubeOnMarketTile($playerID, $cubeID);

        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $playerID");

        $lastAddedCube = $this->getObjectFromDB("SELECT * FROM cubes WHERE order_in_construction IS NOT NULL AND card_location_arg = $playerID ORDER BY order_in_construction DESC LIMIT 1");
        if (!$lastAddedCube)
            throw new \BgaUserException(clienttranslate("No cube found in construction"));

        $this->DbQuery("UPDATE cubes SET 
            card_location = 'market', 
            card_location_arg = $playerMarketIndex, 
            pos_x = NULL, 
            pos_y = NULL, 
            pos_z = NULL, 
            order_in_construction = NUll
            WHERE card_id = ".$lastAddedCube['card_id']);

        $this->DbQuery("UPDATE cubes SET card_location = 'pyramid', pos_x = ".$lastAddedCube['pos_x'].", pos_y = ".$lastAddedCube['pos_y'].", pos_z = ".$lastAddedCube['pos_z'].", card_location_arg = $playerID, order_in_construction = ".$lastAddedCube['order_in_construction']." WHERE card_id = $cubeID");
    }

    public function undoBuildPyramid($playerID): void {
        $this->checkBuildableState();
        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $playerID");

        if($playerMarketIndex === null)
            throw new \BgaUserException(clienttranslate("You have not selected any Market Tile to undo build"));

        $this->DbQuery("UPDATE cubes SET card_location = 'market', card_location_arg = $playerMarketIndex, pos_x = NULL, pos_y = NULL, pos_z = NULL, order_in_construction = NULL WHERE (order_in_construction IS NOT NULL AND card_location_arg = $playerID) OR (card_location = 'to_discard' AND card_location_arg = $playerMarketIndex)");
        $this->DbQuery("UPDATE player SET built_cubes_this_round = 'false' WHERE player_id = $playerID");
        $this->parent->notify->player($playerID, 'undoneBuildPyramid', '', []);

        if ($this->parent->gamestate->state()['name'] === 'buildPyramid')
            $this->parent->gamestate->setPlayersMultiactive([$playerID], 'buildPyramid');
    }

    private function doesPlayerOwnCubeOnMarketTile($playerID, $cubeID): void{
        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $playerID");
        
        if ($playerMarketIndex === null)
            throw new \BgaUserException(clienttranslate("You have not selected any Market Tile yet"));

        $cubeRow = $this->getObjectFromDB("SELECT card_location, card_location_arg FROM cubes WHERE card_id = $cubeID");

        if ($cubeRow['card_location'] !== 'market' || $cubeRow['card_location_arg'] !== $playerMarketIndex)
            throw new \BgaUserException(clienttranslate("You can only place cubes from your collected Market Tile"));
    }

    public function confirmBuildPyramid($playerID): void {
        $playerHasBuilt = $this->getUniqueValueFromDB("SELECT built_cubes_this_round FROM player WHERE player_id = $playerID");
        if ($playerHasBuilt === 'true')
            throw new \BgaUserException(clienttranslate("You have already built your pyramid this round"));

        $unbuiltCubes = $this->checkUnbuiltCubesAreNotBuildable($playerID);

        foreach ($unbuiltCubes as $cube)
            $this->DbQuery("UPDATE cubes SET card_location = 'to_discard' WHERE card_id = ".$cube['card_id']);

        $this->DbQuery("UPDATE player SET built_cubes_this_round = 'true' WHERE player_id = $playerID");
        $this->parent->notify->player($playerID, 'confirmedBuildPyramid', '');

        if ($this->parent->gamestate->state()['name'] === 'buildPyramid')
            $this->parent->gamestate->setPlayerNonMultiactive($playerID, 'allPyramidsBuilt');
    }

    private function checkUnbuiltCubesAreNotBuildable($playerID): array {
        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $playerID");
        $unbuiltCubes = self::getObjectListFromDB("SELECT * FROM cubes WHERE card_location = 'market' AND card_location_arg = $playerMarketIndex");
        if (count($unbuiltCubes) <= 0)
            return [];

        $pyramidData = $this->getPlayerPyramidData($playerID, true);

        // Count cubes in base layer (z=0)
        $baseLayerCount = 0;
        foreach ($pyramidData as $cube)
            if ((int) $cube['pos_z'] === 0)
                $baseLayerCount++;

        if ($baseLayerCount < PYRAMID_MAX_SIZE * PYRAMID_MAX_SIZE)
            throw new \BgaUserException(clienttranslate("Remaining cube can be placed in the bottom layer"));

        // Get cubes still on player's market tile
        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $playerID");

        $unbuiltColors = [];
        foreach ($unbuiltCubes as $unbuiltCube)
            $unbuiltColors[] = (int) $unbuiltCube['color'];

        $cubeCoordsXYZ = [];
        $cubesByColor =  [];
        foreach ($pyramidData as $cube) {
            $cubeColor = (int) $cube['color'];
            $x = (int) $cube['pos_x'];
            $y = (int) $cube['pos_y']; 
            $z = (int) $cube['pos_z'];
            $cubeCoordsXYZ[$x][$y][$z] = $cube;
            $cubesByColor[$cubeColor][] = $cube;
        }

        // Check each unbuilt cube's color against pyramid cubes
        foreach ($unbuiltColors as $unbuiltColor) {
            // Check each pyramid cube
            foreach ($cubesByColor[$unbuiltColor] as $cube) {
                $x = (int) $cube['pos_x'];
                $y = (int) $cube['pos_y'];
                $z = (int) $cube['pos_z'];

                $neighborPositions = [ //coords follow clockwise order starting from top left - the last one is the cube above
                    [[$x, $y + 1], [$x + 1, $y + 1], [$x + 1, $y], [$x, $y]], // A - cube is on bottom left
                    [[$x + 1, $y], [$x + 1, $y - 1], [$x, $y - 1], [$x, $y - 1]], // B - cube is on top left
                    [[$x - 1, $y], [$x, $y - 1], [$x - 1, $y - 1], [$x - 1, $y - 1]], // C - cube is on top right
                    [[$x - 1, $y + 1], [$x, $y + 1], [$x - 1, $y], [$x - 1, $y]], // D - cube is on bottom right
                ];
                
                foreach ($neighborPositions as $neighborPosition) {
                    $neighAPos = $neighborPosition[0];
                    $neighBPos = $neighborPosition[1];
                    $neighCPos = $neighborPosition[2];
                    $abovePos = $neighborPosition[3];

                    // Check if has required neighbors
                    $hasNeighborA = isset($cubeCoordsXYZ[$neighAPos[0]][$neighAPos[1]][$z]);
                    $hasNeighborB = isset($cubeCoordsXYZ[$neighBPos[0]][$neighBPos[1]][$z]);
                    $hasNeighborC = isset($cubeCoordsXYZ[$neighCPos[0]][$neighCPos[1]][$z]);
                    
                    // Check if space above is empty
                    $hasAbove = isset($cubeCoordsXYZ[$abovePos[0]][$abovePos[1]][$z + 1]);

                    if ($hasNeighborA && $hasNeighborB && $hasNeighborC && !$hasAbove)
                        throw new \BgaUserException(clienttranslate("Remaining cube can be placed on a higher level"));
                }
            }
        }

        return $unbuiltCubes;
    }

    public function checkBuildableState() {
        $state = $this->parent->gamestate->state();
        if (!in_array($state['name'], ['individualPlayerSelectMarketTile', 'buildPyramid']))
            throw new \BgaUserException(clienttranslate("Not allowed at this game state"));
    }
}

?>