<?php
/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * yaxha implementation : © Doruk Kicikoglu <doruk.kicikoglu@gmail.com>
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
use YXHMarketManager;
use YXHPyramidManager;
use YXHScoringManager;

require_once(APP_GAMEMODULE_PATH . "module/table/table.game.php");

class Game extends \Table
{
    public YXHGlobalsManager $globalsManager;
    public YXHMarketManager $marketManager;
    public YXHPyramidManager $pyramidManager;
    public YXHScoringManager $scoringManager;
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
        require_once 'YXHMarketManager.php';
        require_once 'YXHPyramidManager.php'; 
        require_once 'YXHScoringManager.php';
        require_once 'YXHBonusCardsManager.php';

        $this->globalsManager = new YXHGlobalsManager($this, 
            $globalKeys = array(
                'rounds_remaining' => 20,
            ),
            $userPrefs = array()
        );

        $this->marketManager = new YXHMarketManager($this);
        $this->pyramidManager = new YXHPyramidManager($this);
        $this->scoringManager = new YXHScoringManager($this);

        $this->cubesBag = self::getNew("module.common.deck");
        $this->cubesBag->init("cubes");
    }

    /**
     * Player selects a Market Tile to take cubes from
     * 
     * @param int $marketIndex The index of the selected Market Tile
     * @throws BgaUserException
     */
    #[CheckAction(false)]
    public function actAllSelectMarketTile(int $marketIndex): void
    {
        $this->gamestate->checkPossibleAction('actAllSelectMarketTile');

        // Check if market index is valid
        $playerCount = $this->getPlayersNumber();
        if ($marketIndex < 0 || $marketIndex >= $playerCount) 
            throw new \BgaUserException(sprintf( clienttranslate('Invalid Market Tile index: %d. Must be between 0 and %d'), $marketIndex, $playerCount - 1 ));

        $currentPlayerID = (int) $this->getCurrentPlayerId();
        if ($this->isPlayerZombie($currentPlayerID))
            return;

        $madeSelectionThisRound = $this->getUniqueValueFromDB("SELECT made_market_index_selection_this_round FROM player WHERE player_id = $currentPlayerID");

        if($madeSelectionThisRound == 'false')
            $this->giveExtraTime($currentPlayerID);
        else $this->not_a_move_notification = true; // note: do not increase the move counter
    
        $this->DbQuery("UPDATE player SET selected_market_index = $marketIndex, made_market_index_selection_this_round = 'true' WHERE player_id = $currentPlayerID");

        $this->notify->player($currentPlayerID, 'marketIndexSelectionConfirmed', '', ['confirmed_selected_market_index' => $marketIndex]);

        $this->gamestate->setPlayerNonMultiactive($currentPlayerID, 'allMarketTileSelectionsMade');
    }

    /**
     * Revert a player's Market Tile selection during the simultaneous selection phase
     * 
     * This allows a player to undo their Market Tile selection and make a different choice.
     * The player will be set back to active status to make a new selection.
     * 
     * @throws BgaUserException if the action is not currently allowed
     */
    #[CheckAction(false)]
    public function actRevertAllSelectMarketTile($zombieCallerPlayerID = null): void
    {
        $this->gamestate->checkPossibleAction('actRevertAllSelectMarketTile');

        $reverterPlayerID = $zombieCallerPlayerID ? $zombieCallerPlayerID : (int) $this->getCurrentPlayerId();
        if (!$zombieCallerPlayerID && $this->isPlayerZombie($reverterPlayerID))
            return;
        
        $this->DbQuery("UPDATE player SET selected_market_index = NULL WHERE player_id = $reverterPlayerID");

        $this->notify->player($reverterPlayerID, 'marketIndexSelectionReverted', '', []);

        $this->gamestate->setPlayersMultiactive([$reverterPlayerID], '');

        $this->not_a_move_notification = true; // note: do not increase the move counter
        $this->notify->player($reverterPlayerID, 'marketIndexSelectionReverted', '', []);
    }
    
    #[CheckAction(false)]
    public function actIndividualPlayerSelectMarketTile(int $marketIndex): void
    {
        $this->gamestate->checkPossibleAction('actIndividualPlayerSelectMarketTile');

        $activePlayerID = (int) $this->getActivePlayerId();
        
        // Check if market index is valid
        $playerCount = $this->getPlayersNumber();
        if ($marketIndex < 0 || $marketIndex >= $playerCount) 
            throw new \BgaUserException(sprintf( clienttranslate('Invalid Market Tile index: %d. Must be between 0 and %d'), $marketIndex, $playerCount - 1 ));
    
        // Check if market index is already collected by another player
        $tileAlreadyCollected = $this->getUniqueValueFromDB("SELECT COUNT(*) FROM player WHERE collected_market_index = $marketIndex");
        if ($tileAlreadyCollected > 0)
            throw new \BgaUserException(clienttranslate("This Market Tile has already been collected by another player"));

        // Check that player hasn't already collected a Market Tile this round
        $playerAlreadyCollected = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $activePlayerID");
        if($playerAlreadyCollected !== null)
            throw new \BgaUserException(clienttranslate("You have already collected a Market Tile this round"));

        $collectedCubes = $this->getObjectListFromDB("SELECT card_id as cube_id, color FROM cubes WHERE card_location = 'market' AND card_location_arg = " . $marketIndex);
        $logHTML = $this->getPlayerNameById($activePlayerID).' ← '.$this->marketManager->getMarketTileSelectionLogHTML($marketIndex).'&nbsp;';
        foreach($collectedCubes as $cube)
            $logHTML .= $this->marketManager->getCubeLogHTML($cube['color']);

        $this->DbQuery("UPDATE player SET collected_market_index = $marketIndex WHERE player_id = $activePlayerID");

        $this->notify->all('individualPlayerCollected', '${INDIVIDUAL_MARKET_TILES_COLLECTION_STR}', array(
            'LOG_CLASS' => 'individual-collected-tiles-log',
            'preserve' => ['LOG_CLASS', 'player_id', 'collected_market_index', 'collected_cubes'],
            'player_id' => $activePlayerID,
            'collected_market_index' => $marketIndex,
            'collected_cubes' => $collectedCubes,
            'INDIVIDUAL_MARKET_TILES_COLLECTION_STR' => $logHTML
        ));

        $this->giveExtraTime($activePlayerID);

        $this->gamestate->nextState('getNextPendingPlayerToSelectMarketTile');
    }
    
    #[CheckAction(false)]
    public function actAddCubeToPyramid(int $cube_id, int $pos_x, int $pos_y, int $pos_z): void
    {
        $this->pyramidManager->addCubeToPyramid((int) $this->getCurrentPlayerId(), $cube_id, $pos_x, $pos_y, $pos_z);
    }
    
    #[CheckAction(false)]
    public function actMoveCubeInPyramid(int $cube_id, int $pos_x, int $pos_y, int $pos_z): void
    {
        $this->pyramidManager->moveCubeInPyramid((int) $this->getCurrentPlayerId(), $cube_id, $pos_x, $pos_y, $pos_z);
    }
    
    #[CheckAction(false)]
    public function actPyramidCubeColorSwitched(int $cube_id): void
    {
        $this->pyramidManager->switchCubeColor((int) $this->getCurrentPlayerId(), $cube_id);
    }

    #[CheckAction(false)]
    public function actUndoBuildPyramid(): void
    {
        $this->pyramidManager->undoBuildPyramid((int) $this->getCurrentPlayerId());
    }

    #[CheckAction(false)]
    public function actConfirmBuildPyramid(): void
    {
        $this->pyramidManager->confirmBuildPyramid((int) $this->getCurrentPlayerId());
    }

    public function argIndividualPlayerSelectMarketTile(): array{
        $possibleMarketIndexes = [];
        $tileCount = $this->getPlayersNumber(); //tile count is the same as the number of players

        $possibleMarketIndexes = array_diff(range(0, $tileCount - 1), $this->getObjectListFromDB("SELECT collected_market_index FROM player WHERE collected_market_index IS NOT NULL", true));
        $possibleMarketIndexes = array_values($possibleMarketIndexes);

        return [
            'possible_market_indexes' => $possibleMarketIndexes,
            'collectedMarketTilesData' => $this->marketManager->getCollectedMarketTiles()
        ];
    }

    public function argNewCubesDrawn(): array{
        return ['marketData' => $this->marketManager->getMarketData()];
    }

    public function isPlayerZombie(int $playerID): bool{
        return $this->getUniqueValueFromDB("SELECT player_zombie FROM player WHERE player_id = $playerID") == 1;
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
        $roundsRemaining = (int) $this->globalsManager->get('rounds_remaining');
        $progress = (ROUND_COUNT - $roundsRemaining) / ROUND_COUNT;
        // Check if any players haven't collected market tiles yet
        $pendingPlayers = $this->getUniqueValueFromDB("SELECT COUNT(*) FROM player WHERE collected_market_index IS NULL");
        $everyoneHasCollected = ($pendingPlayers <= 0);
        if($everyoneHasCollected)
            $progress += 0.5 * (1 / ROUND_COUNT);
        
        $progress = (int) ($progress * 100);
        return $progress;
    }

    public function stAllSelectMarketTile(): void {
        $this->DbQuery("UPDATE player SET made_market_index_selection_this_round = 'false', selected_market_index = NULL, collected_market_index = NULL");
        $this->gamestate->setAllPlayersMultiactive();
    }

    public function stAllMarketTileSelectionsMade(): void {
        $this->marketManager->handleAllMarketTileSelectionsMade();
    }

    public function stGetNextPendingPlayerToSelectMarketTile(): void {
        $waitingPlayers = $this->getObjectListFromDB("SELECT * FROM player WHERE player_zombie = 0 AND collected_market_index IS NULL ORDER BY turn_order ASC");

        if (!$waitingPlayers) { // No more pending players to select Market Tiles
            $this->gamestate->nextState('buildPyramid');
        } else { // Activate next player to make their selection
            $nextPlayer = array_shift($waitingPlayers);
            $this->gamestate->changeActivePlayer($nextPlayer['player_id']);
            $this->gamestate->nextState('individualPlayerSelectMarketTile');

            if(!$waitingPlayers){
                $playerCount = $this->getPlayersNumber();
                $possibleMarketIndexes = array();
                for ($i = 0; $i < $playerCount; $i++)
                    $possibleMarketIndexes[$i] = $i;

                $collectedIndexes = $this->getObjectListFromDB("SELECT collected_market_index FROM player WHERE collected_market_index IS NOT NULL", true);
                foreach($collectedIndexes as $collectedIndex)
                    unset($possibleMarketIndexes[(int) $collectedIndex]);

                if(count($possibleMarketIndexes) == 1){ //there is only one player and one market tile left - there may be multiple market tiles if there are zombie players
                    $firstPossibleMarketIndex = array_keys($possibleMarketIndexes)[0];
                    $this->actIndividualPlayerSelectMarketTile($firstPossibleMarketIndex);
                }
            }
        }
    }

    public function stBuildPyramid(): void {
        $this->marketManager->swapTurnOrders();
        
        $players = $this->loadPlayersBasicInfos();
        $playersToActivate = $this->getCollectionFromDB("SELECT player_id, are_cubes_built FROM player WHERE are_cubes_built = 'false' AND player_zombie = 0");
        $playersToDeactivate = [];

        foreach($players as $playerID => $player){
            if(!isset($playersToActivate[$playerID]))
                $playersToDeactivate[] = $playerID;
        }
        $playersToActivate = array_keys($playersToActivate);

        foreach ($playersToDeactivate as $playerId)
            $this->gamestate->setPlayerNonMultiactive($playerId, 'allPyramidsBuilt');

        $this->gamestate->setPlayersMultiactive($playersToActivate, 'allPyramidsBuilt', true);
    }

    public function stAllPyramidsBuilt(): void{
        $discardedCubesByPlayer = $this->getCollectionFromDB("
            SELECT p.player_id, COUNT(c.card_id) as discard_count 
            FROM player p
            LEFT JOIN cubes c ON c.card_location = 'to_discard' AND c.card_location_arg = p.collected_market_index
            GROUP BY p.player_id
        ");

        $discardedCubesCount = 0;
        foreach($discardedCubesByPlayer as $playerID => $data) {
            $this->incStat($data['discard_count'], 'player_discarded_cubes_count', $playerID);
            $discardedCubesCount += $data['discard_count'];
        }

        $this->incStat($discardedCubesCount, 'table_discarded_cubes_count');
        $this->DbQuery("UPDATE cubes SET card_location = 'discarded' WHERE card_location = 'to_discard'");

        // Move unconfirmed cubes from zombie players' pyramids to discard pile
        $this->DbQuery("UPDATE cubes SET card_location = 'discarded', order_in_construction = NULL
            WHERE card_location = 'pyramid' AND order_in_construction IS NOT NULL 
            AND card_location_arg IN (
                SELECT player_id FROM player WHERE player_zombie = 1
            )"
        );

        $builtCubes = $this->getObjectListFromDB("SELECT card_location_arg as owner_id, card_id as cube_id, color, pos_x, pos_y, pos_z FROM cubes WHERE card_location = 'pyramid' AND order_in_construction IS NOT NULL ORDER BY order_in_construction ASC");
        
        $builtCubesByPlayer = array();
        foreach($builtCubes as $cube) {
            $ownerID = (int) $cube['owner_id'];
            if(!isset($builtCubesByPlayer[$ownerID]))
                $builtCubesByPlayer[$ownerID] = [];

            $builtCubesByPlayer[$ownerID][] = $cube;
        }

        $this->DbQuery("UPDATE cubes SET order_in_construction = NULL");
        $this->DbQuery("UPDATE player SET 
            are_cubes_built = 'false',
            cubes_built_this_round = 'false',
            made_market_index_selection_this_round = 'false', 
            selected_market_index = NULL,
            collected_market_index = NULL");

        $this->globalsManager->set('rounds_remaining', (int) $this->globalsManager->get('rounds_remaining') - 1);
        
        $builtCubesDataStr = '';
        foreach($builtCubesByPlayer as $playerID => $cubes)
            $builtCubesDataStr .= $this->getPlayerNameById($playerID).' ↓ '.implode('', array_map(fn($cube) => $this->marketManager->getCubeLogHTML($cube['color']), $cubes)).'<br>';

        $this->notify->all('displayBuiltCubes', '${DISPLAY_BUILT_CUBES_STR}', [
            'LOG_CLASS' => 'display-built-cubes-log',
            'preserve' => ['LOG_CLASS', 'built_cubes'],
            'built_cubes' => $builtCubesByPlayer,
            'DISPLAY_BUILT_CUBES_STR' => $builtCubesDataStr
        ]);

        if((int) $this->globalsManager->get('rounds_remaining') == 0)
            $this->gamestate->nextState('endGameScoring');
        else $this->gamestate->nextState('newCubesDrawn');
    }

    public function stNewCubesDrawn(): void {
        $this->marketManager->drawNewCubes();
        $this->gamestate->nextState('allSelectMarketTile');
    }

    public function stEndGameScoring(): void {
        $endGameScoring = $this->scoringManager->getEndGameScoring(); 

        $totalPointsFromCubeColors = 0;
        $totalPointsFromBonusCards = 0;
        $playerCount = count($endGameScoring['player_scores']);

        foreach($endGameScoring['player_scores'] as $playerScoreData) {
            $playerID = $playerScoreData['player_id'];
            $playerColorTotalScore = array_sum($playerScoreData['color_points']);
            $playerColorAverageScore = $playerColorTotalScore / count(CUBE_COLORS);
    
            $this->setStat($playerColorTotalScore, 'player_total_points_from_cube_colors', $playerID);
            $this->setStat($playerColorAverageScore, 'player_avg_points_from_cube_colors', $playerID);

            $totalPointsFromCubeColors += $playerColorTotalScore;

            $playerBonusCardTotalScore = array_sum($playerScoreData['bonus_card_points']);
            $playerBonusCardAverageScore = $playerBonusCardTotalScore / SETUP_BONUS_CARDS_COUNT;
  
            $this->setStat($playerBonusCardTotalScore, 'player_total_points_from_bonus_cards', $playerID);
            $this->setStat($playerBonusCardAverageScore, 'player_avg_points_from_bonus_cards', $playerID);

            $totalPointsFromBonusCards += $playerBonusCardTotalScore;

            foreach($playerScoreData['bonus_card_points'] as $bonusCardData){
                $bonusCardID = $bonusCardData['bonus_card_id'];
                $bonusCardPoints = $bonusCardData['bonus_card_points'];
                $this->setStat($bonusCardPoints, BONUS_CARDS_DATA[$bonusCardID]['statName'], $playerID);
            }
        }

        $avgPointsFromCubeColors = $totalPointsFromCubeColors / $playerCount;
        
        $this->setStat($avgPointsFromCubeColors, 'table_avg_points_from_cube_colors');
        $this->setStat($totalPointsFromCubeColors, 'table_total_points_from_cube_colors');
        
        $avgPointsFromBonusCards = $totalPointsFromBonusCards / $playerCount;

        $this->setStat($avgPointsFromBonusCards, 'table_avg_points_from_bonus_cards');
        $this->setStat($totalPointsFromBonusCards, 'table_total_points_from_bonus_cards');
        
        foreach($endGameScoring['player_scores'] as $playerID => $playerScoreData){
            $playerTotal = $playerScoreData['total'];
            $this->DbQuery("UPDATE player SET player_score = $playerTotal WHERE player_id = $playerID");
        }

        $this->notifyAllPlayers('displayEndGameScore', '', array(
            'endGameScoring' => $endGameScoring
        ));
        
        $this->gamestate->nextState('gameEnd');
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
        $result["players"] = $this->getCollectionFromDb("SELECT player_id, player_no, player_score score, turn_order, are_cubes_built = 'true' as are_cubes_built FROM player");

        $result['marketData'] = $this->marketManager->getMarketData();
        $result['bonusCardIDs'] = $this->getObjectListFromDB("SELECT bonus_card_id FROM bonus_cards ORDER BY bonus_card_position", true);
        $result['CUBE_COLORS'] = CUBE_COLORS;
        $result['BONUS_CARDS_DATA'] = BONUS_CARDS_DATA;
        $result['MARKET_TILE_COLORS'] = MARKET_TILE_COLORS;
        $result['PYRAMID_MAX_SIZE'] = PYRAMID_MAX_SIZE;
        $result['CUBES_PER_MARKET_TILE'] = CUBES_PER_MARKET_TILE;
        $result['pyramidData'] = $this->pyramidManager->getPyramidsData();

        $current_player_id = (int) $this->getCurrentPlayerId();
        $result['pyramidData'][$current_player_id] = $this->pyramidManager->getPlayerPyramidData($current_player_id, true);

        $result['collectedMarketTilesData'] = $this->marketManager->getCollectedMarketTiles($current_player_id);

        $result['nextPlayerTable'] = $this->getNextPlayerTable();

        if($this->gamestate->state()['name'] == 'gameEnd')
            $result['endGameScoring'] = $this->scoringManager->getEndGameScoring();

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
    
        // Init game statistics.
        $this->initGameStatistics();
        
        // Get the bonus cards preference from options
        $isRandomBonusCardsSetup = (int) $this->tableOptions->get(100) == (int) RANDOM_BONUS_CARDS_OPTION;

        $bonus_cards = $isRandomBonusCardsSetup ? range(0, 11) : BEGINNER_BONUS_CARDS_IDS;
        if($this->getPlayersNumber() == 2) //in a 2 player game, remove bonus_cards that compare to the player sitting on the right
            $bonus_cards = array_diff($bonus_cards, [5,6,7,8,9]);
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

        $this->marketManager->drawNewCubes(false);

        // Activate first player once everything has been initialized and ready.
        $this->activeNextPlayer();
    }

    public function initGameStatistics(): void {
        // Table statistics
        $this->initStat("table", "table_discarded_cubes_count", 0);
        $this->initStat("table", "table_times_market_tile_denied", 0);
        $this->initStat("table", "table_avg_points_from_cube_colors", 0);
        $this->initStat("table", "table_total_points_from_cube_colors", 0);
        $this->initStat("table", "table_avg_points_from_bonus_cards", 0);
        $this->initStat("table", "table_total_points_from_bonus_cards", 0);

        // Player statistics
        $this->initStat("player", "player_discarded_cubes_count", 0);
        $this->initStat("player", "player_times_market_tile_denied", 0);
        $this->initStat("player", "player_avg_points_from_cube_colors", 0);
        $this->initStat("player", "player_total_points_from_cube_colors", 0);
        $this->initStat("player", "player_avg_points_from_bonus_cards", 0);
        $this->initStat("player", "player_total_points_from_bonus_cards", 0);
        $this->initStat("player", "player_bonus_card_largest_orange", 0);
        $this->initStat("player", "player_bonus_card_largest_blue", 0);
        $this->initStat("player", "player_bonus_card_largest_green", 0);
        $this->initStat("player", "player_bonus_card_largest_yellow", 0);
        $this->initStat("player", "player_bonus_card_largest_white", 0);
        $this->initStat("player", "player_bonus_card_larger_right_orange", 0);
        $this->initStat("player", "player_bonus_card_larger_right_blue", 0);
        $this->initStat("player", "player_bonus_card_larger_right_green", 0);
        $this->initStat("player", "player_bonus_card_larger_right_yellow", 0);
        $this->initStat("player", "player_bonus_card_larger_right_white", 0);
        $this->initStat("player", "player_bonus_card_largest_group_any_color", 0);
        $this->initStat("player", "player_bonus_card_largest_group_any_color_level_1", 0);
        $this->initStat("player", "player_bonus_card_group_with_most_levels", 0);
        $this->initStat("player", "player_bonus_card_second_largest_group", 0);
        $this->initStat("player", "player_bonus_card_5_colors_level_1", 0);
        $this->initStat("player", "player_bonus_card_single_color_one_side", 0);
        $this->initStat("player", "player_bonus_card_3_colors", 0);
        $this->initStat("player", "player_bonus_card_5_colors_level_2", 0);
    }

    //////////////////////////////////////////////////////////////////////////////
    ////////////// Debug functions
    //////////////////////////////////////////////////////////////////////////////
    
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
                case "individualPlayerSelectMarketTile":
                    $this->notify->all('zombieIndividualPlayerCollection', '', ['player_id' => $active_player]);
                    $this->gamestate->nextState('zombiePass');
                    break;
                default:
                    $this->message("Unhandled zombieTurn state (activeplayer)", $state_name);
                    break;
            }
            return;
        }

        // Make sure player is in a non-blocking status for role turn.
        if ($state["type"] === "multipleactiveplayer") {
            switch ($state_name) {
                case "allSelectMarketTile":
                    $this->actRevertAllSelectMarketTile($active_player);
                    $this->gamestate->setPlayerNonMultiactive($active_player, 'zombiePass');
                    break;
                case "buildPyramid":
                    $collectedMarketIndex = $this->getUniqueValueFromDB("SELECT collected_market_index FROM player WHERE player_id = $active_player");

                    $this->DbQuery("UPDATE cubes SET card_location = 'discarded' WHERE card_location = 'market' AND card_location_arg = $collectedMarketIndex");
                    $this->gamestate->setPlayerNonMultiactive($active_player, 'zombiePass');

                    break;
                default:
                    $this->message("Unhandled zombieTurn state (multipleactiveplayer)", $state_name);
                    break;
            }
            $this->gamestate->setPlayerNonMultiactive($active_player, '');
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }
}
