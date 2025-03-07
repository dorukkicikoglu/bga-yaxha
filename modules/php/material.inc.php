<?php

if (!defined('BONUS_CARD_COUNT')) { // guard since this included multiple times
    define('BONUS_CARD_COUNT', 3);
    define('ROUND_COUNT', 10);
    define('CUBE_COLORS', [
        0 => ['name' => 'ORANGE', 'colorCode' => 'da6e2d'],
        1 => ['name' => 'YELLOW', 'colorCode' => 'f5d187'],
        2 => ['name' => 'BLUE', 'colorCode' => '304f5e'],
        3 => ['name' => 'GREEN', 'colorCode' => 'c3dcc7'],
        4 => ['name' => 'LILA', 'colorCode' => 'dcd9de'],
    ]);
    define('CUBES_PER_COLOR', 24);
    define('CUBES_PER_MARKET_TILE', 3);
}

?>
