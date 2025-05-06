<?php

if (!defined('RANDOM_BONUS_CARDS_OPTION')) { // guard since this included multiple times
    define('RANDOM_BONUS_CARDS_OPTION', 2);
    define('BEGINNER_BONUS_CARDS_IDS', [0, 1, 2, 3, 4]);

    define('SETUP_BONUS_CARDS_COUNT', 3);
    define('ROUND_COUNT', 10);

    define('CUBE_COLOR_ORANGE', 0);
    define('CUBE_COLOR_YELLOW', 1);
    define('CUBE_COLOR_BLUE', 2);
    define('CUBE_COLOR_GREEN', 3);
    define('CUBE_COLOR_WHITE', 4);
    define('CUBE_COLORS', [
        CUBE_COLOR_ORANGE => ['name' => 'ORANGE', 'colorCode' => 'da6e2d'],
        CUBE_COLOR_YELLOW => ['name' => 'YELLOW', 'colorCode' => 'f5d187'],
        CUBE_COLOR_BLUE => ['name' => 'BLUE', 'colorCode' => '304f5e'],
        CUBE_COLOR_GREEN => ['name' => 'GREEN', 'colorCode' => 'c3dcc7'],
        CUBE_COLOR_WHITE => ['name' => 'WHITE', 'colorCode' => 'dcd9de'],
    ]);

    define('CUBES_PER_COLOR', 24);
    define('CUBES_PER_MARKET_TILE', 3);

    define('BONUS_CARD_POINTS', 5);

    define('BONUS_CARD_LARGEST_ORANGE', 0);
    define('BONUS_CARD_LARGEST_BLUE', 1);
    define('BONUS_CARD_LARGEST_GREEN', 2);
    define('BONUS_CARD_LARGEST_YELLOW', 3);
    define('BONUS_CARD_LARGEST_WHITE', 4);
    define('BONUS_CARD_LARGER_RIGHT_ORANGE', 5);
    define('BONUS_CARD_LARGER_RIGHT_BLUE', 6);
    define('BONUS_CARD_LARGER_RIGHT_GREEN', 7);
    define('BONUS_CARD_LARGER_RIGHT_YELLOW', 8);
    define('BONUS_CARD_LARGER_RIGHT_WHITE', 9);
    define('BONUS_CARD_LARGEST_GROUP_ANY_COLOR', 10);
    define('BONUS_CARD_LARGEST_GROUP_ANY_COLOR_LEVEL_1', 11);
    define('BONUS_CARD_GROUP_WITH_MOST_LEVELS', 12);
    define('BONUS_CARD_SECOND_LARGEST_GROUP', 13);
    define('BONUS_CARD_5_COLORS_LEVEL_1', 14);
    define('BONUS_CARD_SINGLE_COLOR_ONE_SIDE', 15);
    define('BONUS_CARD_3_COLORS', 16);
    define('BONUS_CARD_5_COLORS_LEVEL_2', 17);
    
    define('BONUS_CARDS_DATA', [
        BONUS_CARD_LARGEST_ORANGE => ['id' => BONUS_CARD_LARGEST_ORANGE, 'statName' => 'player_bonus_card_largest_orange', 'tooltip_text' => _('5 bonus points for the *largest group of orange cubes*')],
        BONUS_CARD_LARGEST_BLUE => ['id' => BONUS_CARD_LARGEST_BLUE, 'statName' => 'player_bonus_card_largest_blue', 'tooltip_text' => _('5 bonus points for the *largest group of blue cubes*')],
        BONUS_CARD_LARGEST_GREEN => ['id' => BONUS_CARD_LARGEST_GREEN, 'statName' => 'player_bonus_card_largest_green', 'tooltip_text' => _('5 bonus points for the *largest group of green cubes*')],
        BONUS_CARD_LARGEST_YELLOW => ['id' => BONUS_CARD_LARGEST_YELLOW, 'statName' => 'player_bonus_card_largest_yellow', 'tooltip_text' => _('5 bonus points for the *largest group of yellow cubes*')],
        BONUS_CARD_LARGEST_WHITE => ['id' => BONUS_CARD_LARGEST_WHITE, 'statName' => 'player_bonus_card_largest_white', 'tooltip_text' => _('5 bonus points for the *largest group of white cubes*')],
        BONUS_CARD_LARGER_RIGHT_ORANGE => ['id' => BONUS_CARD_LARGER_RIGHT_ORANGE, 'statName' => 'player_bonus_card_larger_right_orange', 'tooltip_text' => _('5 bonus points for having the *larger group of orange cubes* compared to your neighbor on your *right* (${rightPlayer})')],
        BONUS_CARD_LARGER_RIGHT_BLUE => ['id' => BONUS_CARD_LARGER_RIGHT_BLUE, 'statName' => 'player_bonus_card_larger_right_blue', 'tooltip_text' => _('5 bonus points for having the *larger group of blue cubes* compared to your neighbor on your *right* (${rightPlayer})')],
        BONUS_CARD_LARGER_RIGHT_GREEN => ['id' => BONUS_CARD_LARGER_RIGHT_GREEN, 'statName' => 'player_bonus_card_larger_right_green', 'tooltip_text' => _('5 bonus points for having the *larger group of green cubes* compared to your neighbor on your *right* (${rightPlayer})')],
        BONUS_CARD_LARGER_RIGHT_YELLOW => ['id' => BONUS_CARD_LARGER_RIGHT_YELLOW, 'statName' => 'player_bonus_card_larger_right_yellow', 'tooltip_text' => _('5 bonus points for having the *larger group of yellow cubes* compared to your neighbor on your *right* (${rightPlayer})')],
        BONUS_CARD_LARGER_RIGHT_WHITE => ['id' => BONUS_CARD_LARGER_RIGHT_WHITE, 'statName' => 'player_bonus_card_larger_right_white', 'tooltip_text' => _('5 bonus points for having the *larger group of white cubes* compared to your neighbor on your *right* (${rightPlayer})')],
        BONUS_CARD_LARGEST_GROUP_ANY_COLOR => ['id' => BONUS_CARD_LARGEST_GROUP_ANY_COLOR, 'statName' => 'player_bonus_card_largest_group_any_color', 'tooltip_text' => _('5 bonus points for the *largest group of cubes of a single color*, regardless of the color')],
        BONUS_CARD_LARGEST_GROUP_ANY_COLOR_LEVEL_1 => ['id' => BONUS_CARD_LARGEST_GROUP_ANY_COLOR_LEVEL_1, 'statName' => 'player_bonus_card_largest_group_any_color_level_1', 'tooltip_text' => _('5 bonus points for the *largest group of cubes of a single color* at least partially on level 1. (Only the cubes on level 1 are counted)')],
        BONUS_CARD_GROUP_WITH_MOST_LEVELS => ['id' => BONUS_CARD_GROUP_WITH_MOST_LEVELS, 'statName' => 'player_bonus_card_group_with_most_levels', 'tooltip_text' => _('5 bonus points for the *group of cubes of a single color* across the most levels (maximum 4 levels)')],
        BONUS_CARD_SECOND_LARGEST_GROUP => ['id' => BONUS_CARD_SECOND_LARGEST_GROUP, 'statName' => 'player_bonus_card_second_largest_group', 'tooltip_text' => _('5 bonus points for the *second largest group* of cubes of a single color, regardless of the color')],
        BONUS_CARD_5_COLORS_LEVEL_1 => ['id' => BONUS_CARD_5_COLORS_LEVEL_1, 'statName' => 'player_bonus_card_5_colors_level_1', 'tooltip_text' => _('5 bonus points for having *5 colors visible on level 1*')],
        BONUS_CARD_SINGLE_COLOR_ONE_SIDE => ['id' => BONUS_CARD_SINGLE_COLOR_ONE_SIDE, 'statName' => 'player_bonus_card_single_color_one_side', 'tooltip_text' => _('5 bonus points for having a *single color on one side* of your pyramid')],
        BONUS_CARD_3_COLORS => ['id' => BONUS_CARD_3_COLORS, 'statName' => 'player_bonus_card_3_colors', 'tooltip_text' => _('5 bonus points for having *exactly 3 colors visible* on your pyramid')],
        BONUS_CARD_5_COLORS_LEVEL_2 => ['id' => BONUS_CARD_5_COLORS_LEVEL_2, 'statName' => 'player_bonus_card_5_colors_level_2', 'tooltip_text' => _('5 bonus points for having *5 colors visible on level 2*')],
    ]);

    define('MARKET_TILE_COLORS', ['fbe5b2', 'cae2cb', 'f0d0d4', 'c6dff3']);
    define('PYRAMID_MAX_SIZE', 4);

    define('LARGEST_GROUP_POINTS', [0, 1, 2, 4, 6, 9, 12, 15, 18, 21, 25, 30, 36]);
}

?>
