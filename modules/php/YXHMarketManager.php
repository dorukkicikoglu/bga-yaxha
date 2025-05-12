<?php

class YXHMarketManager extends APP_DbObject
{
    public $parent;

    function __construct($parent)
    {
        $this->parent = $parent;
    }

    public function drawNewCubes($notify = true)
    {
        $playerCount = $this->parent->getPlayersNumber();
        for ($i = 0; $i < $playerCount; $i++)
            $this->DbQuery( "UPDATE cubes SET card_location = 'market', card_location_arg = $i WHERE card_location = 'bag' ORDER BY card_location_arg LIMIT ".CUBES_PER_MARKET_TILE );

        if(!$notify)
            return;

        $this->parent->notify->all('newCubesDrawn', '', ['marketData' => $this->getMarketData()]);
    }

    public function getMarketData(): array
    {
        $marketCubes = [];
        $uncollectedMarketCubes = $this->getCollectionFromDb("SELECT card_id as cube_id, card_location as location, card_location_arg as market_index, color FROM cubes WHERE card_location IN ('market', 'to_discard')");

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

    function getMarketTileSelectionLogHTML($marketIndex){ return '<span style="position: absolute; opacity: 0; width: 0px; height: 0px; outline: 1px solid #000;">MARKET TILE </span><span style="background-color:#'.MARKET_TILE_COLORS[$marketIndex].';display: inline-block; width: 18px; height: 18px; text-align: center; line-height: 18px; outline: 1px solid #000;">'.($marketIndex + 1).'</span>'; }
    function getCubeLogHTML($colorIndex){ return '<div style="display: inline-block; outline: 1px solid #000; margin: 0 2px; background-color: #'.$colorCode = CUBE_COLORS[$colorIndex]['colorCode'].'; width: 18px; height: 18px;"><span style="position: absolute;opacity: 0;width: 0px;height: 0px;">&nbsp;'.$colorName = CUBE_COLORS[$colorIndex]['name'].'&nbsp;</span></div>'; }

    public function handleAllMarketTileSelectionsMade()
    {
        $selectedMarketIndexes = $this->getCollectionFromDb("SELECT player_id, selected_market_index, collected_market_index, turn_order FROM player WHERE player_zombie = 0");
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

        foreach ($pendingPlayers as $player)
            $this->parent->incStat(1, 'player_times_market_tile_denied', $player['player_id']);

        $this->parent->incStat(count($pendingPlayers), 'table_times_market_tile_denied');

        foreach ($collectingPlayers as $index => $player){
            $this->DbQuery("UPDATE player SET collected_market_index = selected_market_index WHERE player_id = " . $player['player_id']);
            $collectingPlayers[$index]['collected_market_index'] = $player['selected_market_index'];
            $collectingPlayers[$index]['collected_cubes'] = $this->getObjectListFromDB("SELECT card_id as cube_id, color FROM cubes WHERE card_location = 'market' AND card_location_arg = " . $player['selected_market_index']);
        }

        $collectedTilesData = []; //needed for the game replay page
        $pendingTilesData = []; //needed for the game replay page
        foreach($collectingPlayers as $playerData){
            $collectingLogHTML = $this->parent->getPlayerNameById($playerData['player_id']).' ← '.$this->getMarketTileSelectionLogHTML($playerData['selected_market_index']).' &nbsp; ';
            foreach($playerData['collected_cubes'] as $cube)
                $collectingLogHTML .= $this->getCubeLogHTML($cube['color']);
            $collectedTilesData[] = $collectingLogHTML;
        }
            
        foreach($pendingPlayers as $playerData)
            $pendingTilesData[] = $this->parent->getPlayerNameById($playerData['player_id']).' ⏹ '.$this->getMarketTileSelectionLogHTML($playerData['selected_market_index']);
        $marketTilesDataStr = implode(', ', $collectedTilesData).'<br>'.implode(', ', $pendingTilesData);

        $this->parent->notify->all('animateAllMarketTileSelections', '${REVEALED_MARKET_TILES_DATA_STR}', [
            'LOG_CLASS' => 'all-selected-tiles-log',
            'preserve' => ['LOG_CLASS', 'collectedMarketTilesData'],
            'collectedMarketTilesData' => ['collectingPlayers' => $collectingPlayers, 'pendingPlayers' => $pendingPlayers],
            'REVEALED_MARKET_TILES_DATA_STR' => $marketTilesDataStr
        ]);

        $this->parent->gamestate->nextState('getNextPendingPlayerToSelectMarketTile');
    }

    public function swapTurnOrders(){
        // Get all players who played the same card
        $players = $this->getCollectionFromDb("SELECT player_id, selected_market_index, turn_order FROM player");
        
        // Group players by their selected market index
        $playersBySelectedMarketIndex = array();
        foreach ($players as $player) {
            $marketIndex = $player['selected_market_index'];
            if (!isset($playersBySelectedMarketIndex[$marketIndex])) {
                $playersBySelectedMarketIndex[$marketIndex] = array();
            }
            unset($player['selected_market_index']);
            $playersBySelectedMarketIndex[$marketIndex][] = $player;
        }
        
        $swaps = [];
        // Process each group of players who selected the same market tile
        foreach($playersBySelectedMarketIndex as $marketIndex => $playersGroup) {
            $count = count($playersGroup);

            if($count <= 1)
                continue;

            // Sort players by turn order
            usort($playersGroup, function($a, $b) {
                return $a['turn_order'] - $b['turn_order'];
            });

            if($count === 2) {
                $swaps[] = [$playersGroup[0], $playersGroup[1]];
            } else if ($count === 3) {
                $swaps[] = [$playersGroup[0], $playersGroup[2]];
            } else if ($count === 4) {
                $swaps[] = [$playersGroup[0], $playersGroup[3]];
                $swaps[] = [$playersGroup[1], $playersGroup[2]];
            }
        }

        function makeInlineTurnOrderCardHTML($turnOrderIn){ return '<span style="background-color:#222838; color:#EE894A; display: inline-block; width: 18px; height: 18px; text-align: center; line-height: 18px; outline: 1px solid #000;">'.$turnOrderIn.'</span>'; }

        foreach($swaps as $swap){
            $this->DbQuery("UPDATE player SET turn_order = {$swap[1]['turn_order']} WHERE player_id = {$swap[0]['player_id']}");
            $this->DbQuery("UPDATE player SET turn_order = {$swap[0]['turn_order']} WHERE player_id = {$swap[1]['player_id']}");

            $swapTurnOrdersDataStr = $this->parent->getPlayerNameById($swap[0]['player_id']).'&nbsp;'.makeInlineTurnOrderCardHTML($swap[0]['turn_order']).' ↔ '.makeInlineTurnOrderCardHTML($swap[1]['turn_order']).'&nbsp;'.$this->parent->getPlayerNameById($swap[1]['player_id']);

            $this->parent->notify->all('swapTurnOrders', '${SWAP_TURN_ORDERS_DATA_STR}', [
                'LOG_CLASS' => 'swap-turn-orders-log',
                'preserve' => ['LOG_CLASS', 'swapData'],
                'swapData' => $swap,
                'SWAP_TURN_ORDERS_DATA_STR' => $swapTurnOrdersDataStr
            ]);
        }
    }
}
