<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * yaxha implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */
declare(strict_types=1);

namespace Bga\Games\yaxha;

use \Bga\GameFramework\Actions\CheckAction;

use YXHGlobalsManager;
use YXHPyramidManager;
require_once(APP_GAMEMODULE_PATH . "module/table/table.game.php");

class Game extends \Table
{
    // private static array $CARD_TYPES; //ekmek birgun sil
    public YXHGlobalsManager $globalsManager;
    public YXHPyramidManager $pyramidManager;
    private $cubesBag;

    /**
     * Your global variables labels:
     *
     * Here, you can assign labels to global variables you are using for this game. You can use any number of global
     * variables with IDs between 10 and 99. If your game has options (variants), you also have to associate here a
     * label to the corresponding ID in `gameoptions.inc.php`.
     *
     * NOTE: afterward, you can get/set the global variables with `getGameStateValue`, `setGameStateInitialValue` or
     * `setGameStateValue` functions.
     */
    public function __construct()
    {
        parent::__construct();

        require_once 'material.inc.php'; 
        require_once 'YXHGlobalsManager.php'; 
        require_once 'YXHPyramidManager.php'; 

        $this->globalsManager = new YXHGlobalsManager($this, 
            $globalKeys = array(
                'rounds_remaining' => 20,
            ),
            $userPrefs = array()
        );

        $this->pyramidManager = new YXHPyramidManager($this);

        // self::$CARD_TYPES = [ //ekmek silß
        //     1 => [
        //         "card_name" => clienttranslate('Troll'), // ...
        //     ],
        //     2 => [
        //         "card_name" => clienttranslate('Goblin'), // ...
        //     ],
        //     // ...
        // ];

        $this->cubesBag = self::getNew("module.common.deck");
        $this->cubesBag->init("cubes");

        //ekmek bunu yap
        /* example of notification decorator.
        // automatically complete notification args when needed
        $this->notify->addDecorator(function(string $message, array $args) {
            if (isset($args['player_id']) && !isset($args['player_name']) && str_contains($message, '${player_name}')) {
                $args['player_name'] = $this->getPlayerNameById($args['player_id']);
            }
        
            if (isset($args['card_id']) && !isset($args['card_name']) && str_contains($message, '${card_name}')) {
                $args['card_name'] = self::$CARD_TYPES[$args['card_id']]['card_name'];
                $args['i18n'][] = ['card_name'];
            }
            
            return $args;
        });*/

    }

    /**
     * Player selects a market tile to take cubes from
     * 
     * @param int $marketIndex The index of the selected market tile
     * @throws BgaUserException
     */
    #[CheckAction(false)]
    public function actAllSelectMarketTile(int $marketIndex): void
    {
        $this->gamestate->checkPossibleAction('actAllSelectMarketTile');

        // Check if market index is valid
        $playerCount = $this->getPlayersNumber();
        if ($marketIndex < 0 || $marketIndex >= $playerCount) 
            throw new \BgaUserException(sprintf( clienttranslate('Invalid market tile index: %d. Must be between 0 and %d'), $marketIndex, $playerCount - 1 ));

        $currentPlayerID = (int) $this->getCurrentPlayerId();
    
        $madeSelectionThisRound = $this->getUniqueValueFromDB("SELECT made_market_index_selection_this_round FROM player WHERE player_id = $currentPlayerID");

        if($madeSelectionThisRound == 'false')
            $this->giveExtraTime($currentPlayerID);
        else $this->not_a_move_notification = true; // note: do not increase the move counter
    
        $this->DbQuery("UPDATE player SET selected_market_index = $marketIndex, made_market_index_selection_this_round = 'true' WHERE player_id = $currentPlayerID");

        $this->notify->player($currentPlayerID, 'marketIndexSelectionConfirmed', '', ['confirmed_selected_market_index' => $marketIndex]);

        $this->gamestate->setPlayerNonMultiactive($currentPlayerID, 'allMarketTileSelectionsMade');
    }

    /**
     * Revert a player's market tile selection during the simultaneous selection phase
     * 
     * This allows a player to undo their market tile selection and make a different choice.
     * The player will be set back to active status to make a new selection.
     * 
     * @throws BgaUserException if the action is not currently allowed
     */
    #[CheckAction(false)]
    public function actRevertAllSelectMarketTile(): void
    {
        $this->gamestate->checkPossibleAction('actRevertAllSelectMarketTile');

        $currentPlayerID = (int) $this->getCurrentPlayerId();
        $this->DbQuery("UPDATE player SET selected_market_index = NULL WHERE player_id = $currentPlayerID");

        $this->notify->player($currentPlayerID, 'marketIndexSelectionReverted', '', []);

        $this->gamestate->setPlayersMultiactive([$currentPlayerID], '');

        $this->not_a_move_notification = true; // note: do not increase the move counter
        $this->notify->player($currentPlayerID, 'marketIndexSelectionReverted', '', []);
    }

    
    #[CheckAction(false)]
    public function actIndividualPlayerSelectMarketTile(int $marketIndex): void
    {
        $this->gamestate->checkPossibleAction('actIndividualPlayerSelectMarketTile');

        $currentPlayerID = (int) $this->getCurrentPlayerId();

        if (!$this->gamestate->isPlayerActive($currentPlayerID))
            throw new \BgaUserException(clienttranslate("It is not your turn to select a market tile"));
        
        // Check if market index is valid
        $playerCount = $this->getPlayersNumber();
        if ($marketIndex < 0 || $marketIndex >= $playerCount) 
            throw new \BgaUserException(sprintf( clienttranslate('Invalid market tile index: %d. Must be between 0 and %d'), $marketIndex, $playerCount - 1 ));
    
        // Check if market index is already collected by another player
        $tileAlreadyCollected = $this->getUniqueValueFromDB("SELECT COUNT(*) FROM player WHERE collected_market_index = $marketIndex");
        if ($tileAlreadyCollected > 0)
            throw new \BgaUserException(clienttranslate("This market tile has already been collected by another player"));

        // Check that player hasn't already collected a market tile this round
        $playerAlreadyCollected = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $currentPlayerID");
        if($playerAlreadyCollected !== null)
            throw new \BgaUserException(clienttranslate("You have already collected a market tile this round"));

        $this->giveExtraTime($currentPlayerID);

        $this->DbQuery("UPDATE player SET collected_market_index = $marketIndex WHERE player_id = $currentPlayerID");

        $this->notify->all('individualPlayerCollected', '${INDIVIDUAL_MARKET_TILES_COLLECTION_STR}', array(
            'LOG_CLASS' => 'individual-collected-tiles-log',
            'preserve' => ['LOG_CLASS', 'player_id', 'market_index'],
            'player_id' => $currentPlayerID,
            'collected_market_index' => $marketIndex,
            'INDIVIDUAL_MARKET_TILES_COLLECTION_STR' => $this->getPlayerNameById($currentPlayerID).' ← '.$this->getMarketTileSelectionLogHTML($marketIndex)
        ));

        $this->gamestate->nextState('getNextPendingPlayerToSelectMarketTile');
    }

    public function argAllSelectMarketTile(): array{
        $selectedMarketIndexes = $this->getCollectionFromDb("SELECT player_id, selected_market_index FROM player", true);

        $privateData = [];
        foreach($selectedMarketIndexes as $playerID => $marketIndex)
            $privateData[$playerID]['selected_market_index'] = $marketIndex;

        return ['_private' => $privateData];
    }

    public function argIndividualPlayerSelectMarketTile(): array{
        $possibleMarketIndexes = [];
        $tileCount = $this->getPlayersNumber(); //tile count is the same as the number of players

        $possibleMarketIndexes = array_diff(range(0, $tileCount - 1), $this->getObjectListFromDB("SELECT collected_market_index FROM player WHERE collected_market_index IS NOT NULL", true));
        $possibleMarketIndexes = array_values($possibleMarketIndexes);

        return [
            'possible_market_indexes' => $possibleMarketIndexes,
            'possible_moves' => $this->pyramidManager->getPossibleMoves()
        ];
    }

    /**
     * Compute and return the current game progression.
     *
     * The number returned must be an integer between 0 and 100.
     *
     * This method is called each time we are in a game state with the "updateGameProgression" property set to true.
     *
     * @return int
     * @see ./states.inc.php
     */
    public function getGameProgression()
    {
        // TODO: compute and return the game progression
//ekmek yap
        return 0;
    }

    public function stAllSelectMarketTile(): void {
        self::DbQuery("UPDATE player SET made_market_index_selection_this_round = 'false', selected_market_index = NULL, collected_market_index = NULL");
        $this->gamestate->setAllPlayersMultiactive();
    }

    public function stAllMarketTileSelectionsMade(): void {
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
            $collectedTilesData[] = $this->getPlayerNameById($playerData['player_id']).' ← '.$this->getMarketTileSelectionLogHTML($playerData['selected_market_index']);
        foreach($pendingPlayers as $playerData)
            $pendingTilesData[] = $this->getPlayerNameById($playerData['player_id']).' ← - - '.$this->getMarketTileSelectionLogHTML($playerData['selected_market_index']);
        $marketTilesDataStr = implode(', ', $collectedTilesData).'<br>'.implode(', ', $pendingTilesData);

        $this->notify->all('animateAllMarketTileSelections', '${REVEALED_MARKET_TILES_DATA_STR}', array(
            'LOG_CLASS' => 'all-selected-tiles-log',
            'preserve' => ['LOG_CLASS', 'collectedMarketTilesData'],
            'collectedMarketTilesData' => ['collectingPlayers' => $collectingPlayers, 'pendingPlayers' => $pendingPlayers],
            'REVEALED_MARKET_TILES_DATA_STR' => $marketTilesDataStr
        ));

        $this->gamestate->nextState('getNextPendingPlayerToSelectMarketTile');
    }

    public function stGetNextPendingPlayerToSelectMarketTile(): void {
        $nextPlayer = self::getObjectFromDB("SELECT * FROM player WHERE player_zombie = 0 AND collected_market_index IS NULL ORDER BY turn_order ASC LIMIT 1");

        if ($nextPlayer === null) { // No more pending players to select market tiles
            $this->gamestate->nextState('buildPyramid'); //ekmek devam, bunun multipleactiveplayer olmasi lazim
        } else { // Activate next player to make their selection
            $this->gamestate->changeActivePlayer($nextPlayer['player_id']);
            $this->gamestate->nextState('individualPlayerSelectMarketTile');
        }
    }

    // public function stGetNextPlayerToBuildPyramid(): void {
    //     $nextPlayer = self::getObjectFromDB("SELECT p.* FROM player p 
    //         INNER JOIN cubes c ON p.collected_market_index = c.card_location_arg 
    //         WHERE p.player_zombie = 0 AND c.card_location = 'market' AND p.collected_market_index IS NOT NULL ORDER BY p.turn_order ASC LIMIT 1");

    //     if ($nextPlayer === null) {
    //         // No valid players left, go back to market tile selection
    //         $this->gamestate->nextState('allSelectMarketTile');
    //     } else {
    //         $this->gamestate->changeActivePlayer($nextPlayer['player_id']);
    //         $this->gamestate->nextState('buildPyramid');
    //     }
    // }

    public function stBuildPyramid(): void {
//ekmek sil?
    }

    /**
     * Migrate database.
     *
     * You don't have to care about this until your game has been published on BGA. Once your game is on BGA, this
     * method is called everytime the system detects a game running with your old database scheme. In this case, if you
     * change your database scheme, you just have to apply the needed changes in order to update the game database and
     * allow the game to continue to run with your new version.
     *
     * @param int $from_version
     * @return void
     */
    public function upgradeTableDb($from_version)
    {
//       if ($from_version <= 1404301345)
//       {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            $this->applyDbUpgradeToAllDB( $sql );
//       }
//
//       if ($from_version <= 1405061421)
//       {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            $this->applyDbUpgradeToAllDB( $sql );
//       }
    }

    /*
     * Gather all information about current game situation (visible by the current player).
     *
     * The method is called each time the game interface is displayed to a player, i.e.:
     *
     * - when the game starts
     * - when a player refreshes the game page (F5)
     */
    protected function getAllDatas(): array
    {
        $result = [];

        // WARNING: We must only return information visible by the current player.
        $current_player_id = (int) $this->getCurrentPlayerId();

        // Get information about players.
        // NOTE: you can retrieve some extra field you added for "player" table in `dbmodel.sql` if you need it.
        $result["players"] = $this->getCollectionFromDb("SELECT player_id, player_no, player_score score, turn_order FROM player");

        $result["marketData"] = array_reduce(
            $this->getCollectionFromDb("SELECT card_id as cube_id, card_location as location, card_location_arg as market_index, color FROM cubes WHERE card_location = 'market'"),
            function($acc, $cube) {
                $acc[$cube['market_index']][] = $cube;
                return $acc;
            },
            []
        );

        $result['bonusCardIDs'] = $this->getObjectListFromDB("SELECT bonus_card_id FROM bonus_cards ORDER BY bonus_card_position", true);
        $result['CUBE_COLORS'] = CUBE_COLORS;
        $result['BONUS_CARDS_DATA'] = BONUS_CARDS_DATA;
        $result['MARKET_TILE_COLORS'] = MARKET_TILE_COLORS;
        $result['PYRAMID_MAX_SIZE'] = PYRAMID_MAX_SIZE;
        $result['pyramidData'] = $this->pyramidManager->getPyramidsData();

        $result['playerSelectedMarketIndex'] = $this->getUniqueValueFromDB("SELECT selected_market_index FROM player WHERE player_id = $current_player_id");
        $result['collectedMarketTilesData'] = $this->getObjectListFromDB("SELECT player_id, selected_market_index, collected_market_index, turn_order, CASE WHEN collected_market_index IS NOT NULL THEN 'collecting' ELSE 'pending' END AS type FROM player ORDER BY turn_order");

        return $result;
    }

    /**
     * Returns the game name.
     *
     * IMPORTANT: Please do not modify.
     */
    protected function getGameName()
    {
        return "yaxha";
    }

    /**
     * This method is called only once, when a new game is launched. In this method, you must setup the game
     *  according to the game rules, so that the game is ready to be played.
     */
    protected function setupNewGame($players, $options = [])
    {
        // Set the colors of the players with HTML color code. The default below is red/green/blue/orange/brown. The
        // number of colors defined here must correspond to the maximum number of players allowed for the gams.
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        // Create and shuffle turn order numbers
        $turn_order_numbers = range(1, count($players));
        shuffle($turn_order_numbers);

        foreach ($players as $player_id => $player) {
            // Now you can access both $player_id and $player array
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
                array_shift($turn_order_numbers)  // Add turn_order to the initial INSERT
            ]);
        }

        // Create players based on generic information
        static::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, turn_order) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();

        $this->globalsManager->initValues(array(
            "rounds_remaining" => ROUND_COUNT
        ));
        
        //ekmek stat yap
        // Init game statistics.
        //
        // NOTE: statistics used in this file must be defined in your `stats.inc.php` file.

        // Get the bonus cards preference from options
        $isRandomBonusCardsSetup = (int) $this->tableOptions->get(100) == (int) RANDOM_BONUS_CARDS_OPTION;

        $bonus_cards = $isRandomBonusCardsSetup ? range(0, 11) : BEGINNER_BONUS_CARDS_IDS;
        shuffle($bonus_cards);
        $selected_bonus_cards = array_slice($bonus_cards, 0, SETUP_BONUS_CARDS_COUNT);
        
        // Insert the selected bonus cards into the database
        $values = implode(',', array_map(
            fn($position, $card_id) => sprintf("(%d, %d)", $position + 1, $card_id),
            range(0, SETUP_BONUS_CARDS_COUNT - 1),
            $selected_bonus_cards
        ));
        $this->DbQuery(sprintf("INSERT INTO bonus_cards (bonus_card_position, bonus_card_id) VALUES %s", $values));

        // Create cubes for each color
        $values = [];
        foreach (array_keys(CUBE_COLORS) as $color) {
            for ($i = 0; $i < CUBES_PER_COLOR; $i++) {
                $values[] = sprintf("(NULL, 'cube', 0, 'bag', 0, %d)", $color);
            }
        }
        $this->DbQuery(sprintf("INSERT INTO cubes (card_id, card_type, card_type_arg, card_location, card_location_arg, color) VALUES %s", implode(',', $values)));
        $this->cubesBag->shuffle('bag');

        // Deal 3 cubes to each market tile
        for ($i = 0; $i < count($players); $i++)
            $this->DbQuery( "UPDATE cubes SET card_location = 'market', card_location_arg = $i WHERE card_location = 'bag' ORDER BY card_location_arg LIMIT ".CUBES_PER_MARKET_TILE );

        // Activate first player once everything has been initialized and ready.
        $this->activeNextPlayer();
    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////// Debug functions
    //////////////////////////////////////////////////////////////////////////////

    function getMarketTileSelectionLogHTML($marketIndex){ //ekmek oyun sonu replay page duzgun gorunuyo mu test et
        return '<span style="position: absolute; opacity: 0; width: 0px; height: 0px;">MARKET TILE </span><span style="background-color:#'.MARKET_TILE_COLORS[$marketIndex].';display: inline-block; width: 18px; height: 18px; text-align: center; line-height: 18px;">'.($marketIndex + 1).'</span>';
    }
    
    function message($txt, $desc = '', $color = 'blue') {
        if ($this->getBgaEnvironment() != "studio")
            return;

        if (is_array($txt))
            $txt = json_encode($txt);

        if($desc != '')
            $txt .= "   ".json_encode($desc);

        $this->trace("Logging: <span style='color: $color;'>$txt</span>");
        $this->notify->all('plop',"<textarea style='height: 104px; width: 230px;color:$color'>$txt</textarea>",array());
    }

    //ekmek zombie yap
    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: pass).
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, otherwise it will fail with a
     * "Not logged" error message.
     *
     * @param array{ type: string, name: string } $state
     * @param int $active_player
     * @return void
     * @throws feException if the zombie mode is not supported at this game state.
     */
    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default:
                {
                    $this->gamestate->nextState("zombiePass");
                    break;
                }
            }

            return;
        }

        // Make sure player is in a non-blocking status for role turn.
        if ($state["type"] === "multipleactiveplayer") {
            $this->gamestate->setPlayerNonMultiactive($active_player, '');
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }
}
