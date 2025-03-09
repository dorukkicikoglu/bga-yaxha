<?php

if (!defined('RANDOM_BONUS_CARDS_OPTION')) { // guard since this included multiple times
    define('RANDOM_BONUS_CARDS_OPTION', 2);
    define('BEGINNER_BONUS_CARDS_IDS', [4, 7, 11]); //ekmek bu sayilari degistir

    define('SETUP_BONUS_CARDS_COUNT', 3);
    define('ROUND_COUNT', 10);
    define('CUBE_COLORS', [
        0 => ['name' => 'ORANGE', 'colorCode' => 'da6e2d'],
        1 => ['name' => 'YELLOW', 'colorCode' => 'f5d187'],
        2 => ['name' => 'BLUE', 'colorCode' => '304f5e'],
        3 => ['name' => 'GREEN', 'colorCode' => 'c3dcc7'],
        4 => ['name' => 'WHITE', 'colorCode' => 'dcd9de'],
    ]);
    define('CUBES_PER_COLOR', 24);
    define('CUBES_PER_MARKET_TILE', 3);

    define('BONUS_CARDS_DATA', [
        0 => ['id' => 0, 'tooltip_text' => '5 bonus points for the <b>largest group of orange cubes</b>'],
        1 => ['id' => 1, 'tooltip_text' => '5 bonus points for the <b>largest group of blue cubes</b>'],
        2 => ['id' => 2, 'tooltip_text' => '5 bonus points for the <b>largest group of green cubes</b>'],
        3 => ['id' => 3, 'tooltip_text' => '5 bonus points for the <b>largest group of yellow cubes</b>'],
        4 => ['id' => 4, 'tooltip_text' => '5 bonus points for the <b>largest group of white cubes</b>'],
        5 => ['id' => 5, 'tooltip_text' => '5 bonus points for having the <b>larger group of orange cubes</b> compared to your neighbor on your left'],
        6 => ['id' => 6, 'tooltip_text' => '5 bonus points for having the <b>larger group of blue cubes</b> compared to your neighbor on your left'],
        7 => ['id' => 7, 'tooltip_text' => '5 bonus points for having the <b>larger group of green cubes</b> compared to your neighbor on your left'],
        8 => ['id' => 8, 'tooltip_text' => '5 bonus points for having the <b>larger group of yellow cubes</b> compared to your neighbor on your left'],
        9 => ['id' => 9, 'tooltip_text' => '5 bonus points for having the <b>larger group of white cubes</b> compared to your neighbor on your left'],
        10 => ['id' => 10, 'tooltip_text' => '5 bonus points for the <b>largest group of cubes of a single color</b>, regardless of the color'],
        11 => ['id' => 11, 'tooltip_text' => '5 bonus points for the <b>largest group of cubes of a single color</b> at least partially on level 1. (Only the cubes on level 1 are counted)'],
        12 => ['id' => 12, 'tooltip_text' => '5 bonus points for the group of cubes of a <b>single color across the most levels</b> (maximum 4 levels)'],
        13 => ['id' => 13, 'tooltip_text' => '5 bonus points for the <b>second largest group</b> of cubes of a single color, regardless of the color'],
        14 => ['id' => 14, 'tooltip_text' => '5 bonus points for having <b>5 colors visible on level 1</b>'],
        15 => ['id' => 15, 'tooltip_text' => '5 bonus points for having a <b>single color on one side</b> of your pyramid'],
        16 => ['id' => 16, 'tooltip_text' => '5 bonus points for having <b>exactly 3 colors visible</b> on your pyramid'],
        17 => ['id' => 17, 'tooltip_text' => '5 bonus points for having <b>5 colors visible on level 2</b>']
    ]);
}

?>
