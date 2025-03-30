<?php

class YXHPyramidManager extends APP_DbObject{
    public $parent;
    
    function __construct($parent) {
        $this->parent = $parent;
    }

    public function getPyramidsData($players = false) {
        $pyramidsData = [];

        if(!$players)
            $players = self::getObjectListFromDB("SELECT player_id FROM player", true);

        foreach ($players as $player_id) {
            $pyramidsData[$player_id] = [];
        }

        return $pyramidsData;
        return; //ekmek devam et
        // $gridsData = array();

        // if(!$players){ //ekmek sil
        //     $players = self::getObjectListFromDB("SELECT player_id FROM player", true);
        //     $cardLocation = 'LIKE grid_%';
        // } else {
        //     if(!is_array($players))
        //         $players = array($players);
        //     $locations = array();
        //     foreach ($players as $player_id)
        //         $locations[] = "grid_$player_id";
    
        //     $cardLocation = 'IN '.implode(',', $locations);
        // }

        // $playersGotBonus = self::getCollectionFromDB("SELECT player_id, got_bonus FROM player", true);

        // foreach($players as $player_id)
        //     $gridsData[$player_id] = array('tiles' => array(), 'statues' => array(), 'gotBonus' => $playersGotBonus[$player_id] == 'true');

        // $placedTiles = $this->parent->getTiles(array('card_location' => $cardLocation, 'card_location_arg' => PLACED_PERM_TILE_STATUS));

        // foreach($placedTiles as $tileRow){
        //     $tileOwnerID = mb_split('^grid_', $tileRow['location'])[1];
        //     $gridsData[$tileOwnerID]['tiles'][$tileRow['tile_id']] = $tileRow;

        //     if(isset($tileRow['statues'])){
        //         $statues = str_split($tileRow['statues']);
        //         foreach ($statues as $statue) {
        //             $gridsData[$tileOwnerID]['statues'][$statue] ??= 0;
        //             $gridsData[$tileOwnerID]['statues'][$statue]++;
        //         }   
        //     }
        // }

        // return $gridsData;
    }
    function getPlayerPyramidData($ownerID){ $pyramids = $this->getPyramidsData([$ownerID]); return (isset($pyramids[$ownerID]) ? $pyramids[$ownerID] : null); }

    public function getPossibleMoves() {
        $players = self::getObjectListFromDB("SELECT player_id FROM player", true);
        $possibleMoves = [];
        foreach ($players as $player_id) {
            $pyramidData = $this->getPlayerPyramidData($player_id);

            if(!$pyramidData){
                $possibleMoves[$player_id] = [[0, 0, 0]];
                continue;
            }

            $possibleMovesDict = array();
            $tileCoordsDict = array();

            // $minX = INF; $minY = INF;
            // $maxX = -INF; $maxY = -INF;

            // foreach($gridData['tiles'] as $tileID => $tile){
            //     $posX = (int) $tile['pos_x'];
            //     $posY = (int) $tile['pos_y'];
            //     $tileCoordsDict[$posX] = $tileCoordsDict[$posX] ?? array();
            //     $tileCoordsDict[$posX][$posY] = 1;

            //     $possibleMovesDict[$posX][$posY + 1] = 1;
            //     $possibleMovesDict[$posX][$posY - 1] = 1;
            //     $possibleMovesDict[$posX + 1][$posY] = 1;
            //     $possibleMovesDict[$posX - 1][$posY] = 1;

            //     $minX = min($minX, $posX); $minY = min($minY, $posY);
            //     $maxX = max($maxX, $posX); $maxY = max($maxY, $posY);
            // }

            // $xFilled = ($maxX - $minX) >= GRID_MAX_SIZE - 1;
            // $yFilled = ($maxY - $minY) >= GRID_MAX_SIZE - 1;

            // if($xFilled){
            //     unset($possibleMovesDict[$minX - 1]);
            //     unset($possibleMovesDict[$maxX + 1]);
            // }
            
            // if($yFilled){
            //     foreach($possibleMovesDict as $x => $row){
            //         unset($possibleMovesDict[$x][$minY - 1]);
            //         unset($possibleMovesDict[$x][$maxY + 1]);
            //     }
            // }

            // //remove occupied cells
            // foreach($tileCoordsDict as $posX => $row)
            //     foreach($row as $posY => $val)
            //         unset($possibleMovesDict[$posX][$posY]);

            // if($returnDict)
            //     return $possibleMovesDict;

            // $possibleMoves = array();
            // foreach($possibleMovesDict as $posX => $row)
            //     foreach($row as $posY => $val)
            //         $possibleMoves[] = [$posX, $posY];
            
            $possibleMoves[$player_id] = [];
        }
        
        return $possibleMoves;
    }
}

?>