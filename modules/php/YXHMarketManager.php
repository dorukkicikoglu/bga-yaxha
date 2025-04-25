<?php

class YXHMarketManager extends APP_DbObject
{
    public $parent;

    function __construct($parent)
    {
        $this->parent = $parent;
    }

    public function getMarketData(): array
    {
        $marketCubes = [];
        $uncollectedMarketCubes = $this->getCollectionFromDb("SELECT card_id as cube_id, card_location as location, card_location_arg as market_index, color FROM cubes WHERE card_location = 'market'");

        foreach ($uncollectedMarketCubes as $cube) {
            $marketCubes[$cube['market_index']][] = $cube;
        }

        $cubesInConstruction = $this->getCollectionFromDb("SELECT card_id as cube_id, card_location as location, card_location_arg as owner_id, color FROM cubes WHERE order_in_construction IS NOT NULL");
        if ($cubesInConstruction) {
            $collectedMarketTilesData = $this->getCollectedMarketTiles();
            $collectedMarketTilesByPlayer = [];
            foreach ($collectedMarketTilesData as $tile)
                $collectedMarketTilesByPlayer[$tile['player_id']] = $tile['collected_market_index'];

            foreach($cubesInConstruction as $cube)
                $marketCubes[$collectedMarketTilesByPlayer[$cube['owner_id']]][] = $cube;
        }
        return $marketCubes;
    }

    public function getCollectedMarketTiles()
    {
        $players = $this->getObjectListFromDB("SELECT player_id, selected_market_index, collected_market_index, turn_order FROM player ORDER BY turn_order");

        $selectionsMade = true;
        foreach($players as $player)
            if($player['selected_market_index'] === null)
                $selectionsMade = false;

        foreach($players as $playerIndex => $player){
            if(!$selectionsMade)
                $players[$playerIndex]['type'] = 'market_inactive';
            else if($player['collected_market_index'] !== null)
                $players[$playerIndex]['type'] = 'collecting';
            else $players[$playerIndex]['type'] = 'pending';
        }

        return $players;
    }

    function getMarketTileSelectionLogHTML($marketIndex){
        return '<span style="position: absolute; opacity: 0; width: 0px; height: 0px;">MARKET TILE </span><span style="background-color:#'.MARKET_TILE_COLORS[$marketIndex].';display: inline-block; width: 18px; height: 18px; text-align: center; line-height: 18px;">'.($marketIndex + 1).'</span>';
    }

    public function handleAllMarketTileSelectionsMade()
    {
        $selectedMarketIndexes = self::getCollectionFromDb("SELECT player_id, selected_market_index, collected_market_index, turn_order FROM player WHERE player_zombie = 0");
        $playersBySelectedMarketIndex = array_reduce($selectedMarketIndexes, function($acc, $player) {
            $acc[$player['selected_market_index']][] = $player;
            return $acc;
        }, []);

        $pendingPlayers = [];
        $collectingPlayers = [];
        
        foreach($playersBySelectedMarketIndex as $selectedMarketIndex => $players){
            if(count($players) == 1) {
                $collectingPlayers = array_merge($collectingPlayers, $players);
            } else if(count($players) > 1){
                $lowestTurnOrder = PHP_INT_MAX;
                $lowestTurnOrderPlayerIndex = null;
                
                foreach ($players as $playerIndex => $player) {
                    if ($player['turn_order'] < $lowestTurnOrder) {
                        $lowestTurnOrder = min($lowestTurnOrder, $player['turn_order']);
                        $lowestTurnOrderPlayerIndex = $playerIndex;
                    }
                }

                foreach ($players as $playerIndex => $player) { 
                    if ($playerIndex == $lowestTurnOrderPlayerIndex)
                        $collectingPlayers[] = $player;
                    else $pendingPlayers[] = $player;
                }
            }
        }

        foreach ($collectingPlayers as $index => $player){
            self::DbQuery("UPDATE player SET collected_market_index = selected_market_index WHERE player_id = " . $player['player_id']);
            $collectingPlayers[$index]['collected_market_index'] = $player['selected_market_index'];
        }

        $collectedTilesData = []; //needed for the game replay page
        $pendingTilesData = []; //needed for the game replay page
        foreach($collectingPlayers as $playerData)
            $collectedTilesData[] = $this->parent->getPlayerNameById($playerData['player_id']).' ← '.$this->getMarketTileSelectionLogHTML($playerData['selected_market_index']);
        foreach($pendingPlayers as $playerData)
            $pendingTilesData[] = $this->parent->getPlayerNameById($playerData['player_id']).' ⏹ '.$this->getMarketTileSelectionLogHTML($playerData['selected_market_index']);
        $marketTilesDataStr = implode(', ', $collectedTilesData).'<br>'.implode(', ', $pendingTilesData);

        $this->parent->notify->all('animateAllMarketTileSelections', '${REVEALED_MARKET_TILES_DATA_STR}', array(
            'LOG_CLASS' => 'all-selected-tiles-log',
            'preserve' => ['LOG_CLASS', 'collectedMarketTilesData'],
            'collectedMarketTilesData' => ['collectingPlayers' => $collectingPlayers, 'pendingPlayers' => $pendingPlayers],
            'REVEALED_MARKET_TILES_DATA_STR' => $marketTilesDataStr
        ));

        $this->parent->gamestate->nextState('getNextPendingPlayerToSelectMarketTile');
    }
}
