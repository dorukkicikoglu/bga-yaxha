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
 * states.inc.php
 *
 * yaxha game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: $this->checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

if (!defined('STATE_GAME_SETUP')) { // guard since this included multiple times
    define("STATE_GAME_SETUP", 1);
    define("STATE_ALL_SELECT_MARKET_TILE", 2);
    define("STATE_ALL_MARKET_TILE_SELECTIONS_MADE", 3);
    define("STATE_GET_NEXT_PENDING_PLAYER_TO_SELECT_MARKET_TILE", 4);
    define("STATE_INDIVIDUAL_PLAYER_SELECT_MARKET_TILE", 5);
    define("STATE_BUILD_PYRAMID", 10);
    define("STATE_ALL_PYRAMIDS_BUILT", 11);
    define("STATE_NEW_CUBES_DRAWN", 12);
    define("STATE_END_GAME_SCORING", 50);
    define("STATE_GAME_END", 99);
}

$machinestates = [

    // The initial state. Please do not modify.

    STATE_GAME_SETUP => array(
        "name" => "gameSetup",
        "description" => "",
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => ["" => 2]
    ),

    // Note: ID=2 => your first state
    STATE_ALL_SELECT_MARKET_TILE => [
        "name" => "allSelectMarketTile",
        "description" => clienttranslate('Waiting for other players to select a Market Tile'),
        "descriptionmyturn" => clienttranslate('${you} must select a Market Tile'),
        "type" => "multipleactiveplayer",
        "args" => "argAllSelectMarketTile",
        "action" => "stAllSelectMarketTile",
        "possibleactions" => array("actAllSelectMarketTile", "actRevertAllSelectMarketTile"),
        "updateGameProgression" => true,
        "transitions" => ["allMarketTileSelectionsMade" => STATE_ALL_MARKET_TILE_SELECTIONS_MADE, "zombiePass" => STATE_ALL_MARKET_TILE_SELECTIONS_MADE]
    ],

    STATE_ALL_MARKET_TILE_SELECTIONS_MADE => [
        "name" => "allMarketTileSelectionsMade",
        "description" => clienttranslate('Revealing selections'),
        "type" => "game",
        "action" => "stAllMarketTileSelectionsMade",
        "transitions" => ["getNextPendingPlayerToSelectMarketTile" => STATE_GET_NEXT_PENDING_PLAYER_TO_SELECT_MARKET_TILE]
    ],

    STATE_GET_NEXT_PENDING_PLAYER_TO_SELECT_MARKET_TILE => [
        "name" => "getNextPendingPlayerToSelectMarketTile",
        "description" => clienttranslate('Selections revealed'),
        "type" => "game",
        "action" => "stGetNextPendingPlayerToSelectMarketTile",
        "transitions" => ["individualPlayerSelectMarketTile" => STATE_INDIVIDUAL_PLAYER_SELECT_MARKET_TILE, "buildPyramid" => STATE_BUILD_PYRAMID]
    ],

    STATE_INDIVIDUAL_PLAYER_SELECT_MARKET_TILE => [
        "name" => "individualPlayerSelectMarketTile",
        "description" => clienttranslate('${actplayer} must select an available Market Tile'),
        "descriptionmyturn" => clienttranslate('${you} must select an available Market Tile'),
        "type" => "activeplayer",
        "args" => "argIndividualPlayerSelectMarketTile",
        "possibleactions" => ["actIndividualPlayerSelectMarketTile"],
        "transitions" => array( "getNextPendingPlayerToSelectMarketTile" => STATE_GET_NEXT_PENDING_PLAYER_TO_SELECT_MARKET_TILE, "zombiePass" => STATE_INDIVIDUAL_PLAYER_SELECT_MARKET_TILE )
    ],
    
    STATE_BUILD_PYRAMID => [
        "name" => "buildPyramid",
        "description" => clienttranslate('Waiting for other players to build their Pyramids'),
        "descriptionmyturn" => clienttranslate('${you} must place your cubes in your Pyramid'),
        "type" => "multipleactiveplayer",
        "args" => "argBuildPyramid",
        "action" => "stBuildPyramid",
        "possibleactions" => ["actBuildPyramid"],
        "transitions" => array( "allPyramidsBuilt" => STATE_ALL_PYRAMIDS_BUILT)
    ],

    STATE_ALL_PYRAMIDS_BUILT => [
        "name" => "allPyramidsBuilt",
        "description" => clienttranslate('Placing cubes in pyramids...'),
        "type" => "game",
        "action" => "stAllPyramidsBuilt",
        "transitions" => ["newCubesDrawn" => STATE_NEW_CUBES_DRAWN]
    ],

    STATE_NEW_CUBES_DRAWN => [
        "name" => "newCubesDrawn",
        "description" => clienttranslate('Drawing new cubes!'),
        "type" => "game",
        "args" => "argNewCubesDrawn",
        "action" => "stNewCubesDrawn",
        "transitions" => ["allSelectMarketTile" => STATE_ALL_SELECT_MARKET_TILE]
    ],

    STATE_END_GAME_SCORING => array(
        "name" => "endGameScoring",
        "description" => clienttranslate('Scores coming up!'),
        "type" => "game",
        "action" => "stEndGameScoring",
        "updateGameProgression" => true,
        "transitions" => array("gameEnd" => STATE_GAME_END)
    ),

    // Final state.
    // Please do not modify (and do not overload action/args methods).
    STATE_GAME_END => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    ],

];



