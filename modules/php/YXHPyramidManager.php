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

        foreach ($players as $player_id)
            $pyramidsData[$player_id] = [];

        $sql = "SELECT card_id as cube_id, card_location_arg as owner_id, color, pos_x, pos_y, pos_z, order_in_construction FROM cubes WHERE card_location = 'pyramid' AND card_location_arg IN (" . implode(',', $players) . ")";
        if(!$includeInConstruction)
            $sql .= " AND order_in_construction IS NULL";

        $cubes = self::getObjectListFromDB($sql);

        foreach($cubes as $cube)
            $pyramidsData[$cube['owner_id']][] = $cube;

        foreach ($pyramidsData as $player_id => &$cubes) {
            usort($cubes, function($a, $b) {
                return (int) $a['pos_z'] - (int) $b['pos_z'];
            });
        }

        return $pyramidsData;
    }
    function getPlayerPyramidData(int $ownerID, bool $includeInConstruction = false){ $pyramids = $this->getPyramidsData([$ownerID], $includeInConstruction); return (isset($pyramids[$ownerID]) ? $pyramids[$ownerID] : []); }

    public function getPossibleMoves(?int $player_id_arg = null): array {
        if(!$player_id_arg)
            $players = self::getObjectListFromDB("SELECT player_id FROM player", true);
        else $players = [$player_id_arg];

        $allPossibleMoves = [];
        foreach ($players as $player_id) {
            $pyramidData = $this->getPlayerPyramidData($player_id, true);
            $allPossibleMoves[$player_id] = $this->getPossibleMovesFromPyramidData($pyramidData);
        }

        if($player_id_arg)
            return $allPossibleMoves[$player_id_arg];
        return $allPossibleMoves;
    }

    private function getPossibleMovesFromPyramidData(array $pyramidData): array {
        if(empty($pyramidData))
            return [[0, 0, 0]];

        $possibleMovesDict = [];
        $cubeCoordsDictByLayer = [];
        $cubeCountByLayer = [];

        $minX = INF; $minY = INF;
        $maxX = -INF; $maxY = -INF;

        //calculate possible moves for the bottom layer
        foreach($pyramidData as $cubeID => $cube){
            if($cube['order_in_construction'] == CUBES_PER_MARKET_TILE) //the final cube does not add to the possible moves
                continue;

            $posX = (int) $cube['pos_x'];
            $posY = (int) $cube['pos_y'];
            $posZ = (int) $cube['pos_z'];
            
            $cubeCoordsDictByLayer[$posZ][$posX] = $cubeCoordsDictByLayer[$posZ][$posX] ?? [];
            $cubeCoordsDictByLayer[$posZ][$posX][$posY] = 1;
            
            $cubeCountByLayer[$posZ] = $cubeCountByLayer[$posZ] ?? 0;
            $cubeCountByLayer[$posZ]++;

            $possibleMovesDict[$posX][$posY + 1] = 1;
            $possibleMovesDict[$posX][$posY - 1] = 1;
            $possibleMovesDict[$posX + 1][$posY] = 1;
            $possibleMovesDict[$posX - 1][$posY] = 1;

            $minX = min($minX, $posX); $minY = min($minY, $posY);
            $maxX = max($maxX, $posX); $maxY = max($maxY, $posY);
        }

        $xFilled = ($maxX - $minX) >= PYRAMID_MAX_SIZE - 1;
        $yFilled = ($maxY - $minY) >= PYRAMID_MAX_SIZE - 1;

        if($xFilled){
            unset($possibleMovesDict[$minX - 1]);
            unset($possibleMovesDict[$maxX + 1]);
        }
        
        if($yFilled){
            foreach($possibleMovesDict as $x => $row){
                unset($possibleMovesDict[$x][$minY - 1]);
                unset($possibleMovesDict[$x][$maxY + 1]);
            }
        }

        //remove occupied cells
        if(isset($cubeCoordsDictByLayer[0])){
            foreach($cubeCoordsDictByLayer[0] as $posX => $row)
                foreach($row as $posY => $val)
                    unset($possibleMovesDict[$posX][$posY]);
        }

        $playerPossibleMoves = [];
        foreach($possibleMovesDict as $posX => $row)
            foreach($row as $posY => $val)
                $playerPossibleMoves[] = [$posX, $posY, 0];
        
        //first layer finished, check upper layers
        $posZ = 1;
        while($posZ < PYRAMID_MAX_SIZE){
            if(!isset($cubeCountByLayer[$posZ - 1]) || $cubeCountByLayer[$posZ - 1] < 4)
                break;
            
            foreach($cubeCoordsDictByLayer[$posZ - 1] as $posX => $row){
                foreach($row as $posY => $val){
                    if(isset($cubeCoordsDictByLayer[$posZ][$posX][$posY]))
                        continue;
                    if(!isset($cubeCoordsDictByLayer[$posZ - 1][$posX + 1][$posY]))
                        continue;
                    if(!isset($cubeCoordsDictByLayer[$posZ - 1][$posX][$posY + 1]))
                        continue;
                    if(!isset($cubeCoordsDictByLayer[$posZ - 1][$posX + 1][$posY + 1]))
                        continue;
                    $playerPossibleMoves[] = [$posX, $posY, $posZ];
                }
            }
            
            $posZ++;
        }

        return $playerPossibleMoves ? $playerPossibleMoves : [[0, 0, 0]];
    }

    public function addCubeToPyramid($player_id, $cube_id, $pos_x, $pos_y, $pos_z) {
        $this->checkBuildableState();
        $this->doesPlayerOwnCubeOnMarketTile($player_id, $cube_id);

        // Get highest order_in_construction value for this player's cubes, defaulting to 0 if none exist
        $newOrderInConstruction = 1 + $this->getUniqueValueFromDB("SELECT COALESCE(MAX(order_in_construction), 0) FROM cubes WHERE order_in_construction IS NOT NULL AND card_location_arg = $player_id");

        $possibleMoves = $this->getPossibleMoves($player_id);
        $moveIsValid = in_array([$pos_x, $pos_y, $pos_z], $possibleMoves);
        if (!$moveIsValid)
            throw new \BgaUserException(clienttranslate("Invalid cube position"));

        $this->DbQuery("UPDATE cubes SET pos_x = $pos_x, pos_y = $pos_y, pos_z = $pos_z, card_location = 'pyramid', card_location_arg = $player_id, order_in_construction = $newOrderInConstruction WHERE card_id = $cube_id");
        $this->parent->notify->player($player_id, 'cubePlacedInPyramid', '', []);
    }

    public function moveCubeInPyramid($player_id, $cube_id, $pos_x, $pos_y, $pos_z) {
        $this->checkBuildableState();
        $cube = $this->getObjectFromDB("SELECT card_location, card_location_arg, order_in_construction FROM cubes WHERE card_id = $cube_id");

        if ($cube['order_in_construction'] == null || $cube['card_location_arg'] != $player_id)
            throw new \BgaUserException(clienttranslate("You can only move cubes that you have placed in your pyramid"));

        if ($cube['order_in_construction'] != CUBES_PER_MARKET_TILE)
            throw new \BgaUserException(clienttranslate("You can only move the last cube placed"));

        $possibleMoves = $this->getPossibleMoves($player_id);
        $moveIsValid = in_array([$pos_x, $pos_y, $pos_z], $possibleMoves);
        if (!$moveIsValid)
            throw new \BgaUserException(clienttranslate("Moving to invalid cube position"));
        
        $this->DbQuery("UPDATE cubes SET pos_x = $pos_x, pos_y = $pos_y, pos_z = $pos_z WHERE card_id = $cube_id");
    }

    public function switchCubeColor($player_id, $cube_id): void {
        $this->checkBuildableState();
        $this->doesPlayerOwnCubeOnMarketTile($player_id, $cube_id);

        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $player_id");

        $lastAddedCube = $this->getObjectFromDB("SELECT * FROM cubes WHERE order_in_construction IS NOT NULL AND card_location_arg = $player_id ORDER BY order_in_construction DESC LIMIT 1");
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

        $this->DbQuery("UPDATE cubes SET card_location = 'pyramid', pos_x = ".$lastAddedCube['pos_x'].", pos_y = ".$lastAddedCube['pos_y'].", pos_z = ".$lastAddedCube['pos_z'].", card_location_arg = $player_id, order_in_construction = ".$lastAddedCube['order_in_construction']." WHERE card_id = $cube_id");
    }

    public function undoBuildPyramid($player_id): void {
        $this->checkBuildableState();
        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $player_id");

        if($playerMarketIndex === null)
            throw new \BgaUserException(clienttranslate("You have not selected any Market Tile to undo build"));

        $this->DbQuery("UPDATE cubes SET card_location = 'market', card_location_arg = $playerMarketIndex, pos_x = NULL, pos_y = NULL, pos_z = NULL, order_in_construction = NULL WHERE order_in_construction IS NOT NULL AND card_location_arg = $player_id");
        $this->DbQuery("UPDATE player SET built_cubes_this_round = 'false' WHERE player_id = $player_id");
        $this->parent->notify->player($player_id, 'undoneBuildPyramid', '', []);

        if ($this->parent->gamestate->state()['name'] === 'buildPyramid')
            $this->parent->gamestate->setPlayersMultiactive([$player_id], 'buildPyramid');
    }

    private function doesPlayerOwnCubeOnMarketTile($player_id, $cube_id): void{
        $playerMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $player_id");
        
        if ($playerMarketIndex === null)
            throw new \BgaUserException(clienttranslate("You have not selected any Market Tile yet"));

        $cubeRow = $this->getObjectFromDB("SELECT card_location, card_location_arg FROM cubes WHERE card_id = $cube_id");
        
        if ($cubeRow['card_location'] !== 'market' || $cubeRow['card_location_arg'] !== $playerMarketIndex)
            throw new \BgaUserException(clienttranslate("You can only place cubes from your collected Market Tile"));
    }

    public function confirmBuildPyramid($player_id): void {
        $cubesInConstruction = $this->getUniqueValueFromDB("SELECT COUNT(*) FROM cubes WHERE order_in_construction IS NOT NULL AND card_location_arg = $player_id");
        
        if ($cubesInConstruction != CUBES_PER_MARKET_TILE)
            throw new \BgaUserException(clienttranslate("You must place exactly " . CUBES_PER_MARKET_TILE . " cubes before confirming"));

        // $this->DbQuery("UPDATE cubes SET card_location = 'pyramid' WHERE card_location = 'in_construction' AND card_location_arg = $player_id"); //ekmek sil
        $this->DbQuery("UPDATE player SET built_cubes_this_round = 'true' WHERE player_id = $player_id");
        $this->parent->notify->player($player_id, 'confirmedBuildPyramid', '');

        if ($this->parent->gamestate->state()['name'] === 'buildPyramid')
            $this->parent->gamestate->setPlayerNonMultiactive($player_id, 'allPyramidsBuilt');
    }

    public function checkBuildableState() {
        $state = $this->parent->gamestate->state();
        if (!in_array($state['name'], ['individualPlayerSelectMarketTile', 'buildPyramid']))
            throw new \BgaUserException(clienttranslate("Not allowed at this game state"));
    }
}

?>