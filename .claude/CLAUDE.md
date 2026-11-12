# Yaxha (BGA Studio project)

## Environment
- This is a Board Game Arena Studio project. Only BGA's servers can run it, so the code can't be tested locally.
- `php -l` only checks syntax. It can't catch incompatible method signatures with BGA's parent `Table` class (`\Bga\GameFramework\Table`) or other framework-level errors.

## Deployment (SFTP)
- Files in this folder upload to the Studio over SFTP via the VS Code SFTP extension (`.vscode/sftp.json`, with `uploadOnSave` plus a watcher with `autoUpload` and `autoDelete`).
- Saving a file may push it live to the Studio right away.
- Uploads can fail silently. After any server-side error, first check that the server copy matches the local one before assuming the code is at fault.
- Paths in the `ignore` list of `.vscode/sftp.json` (e.g. `.claude/`, `references/`, `node_modules/`) never upload.

## Cube placement UI
Each round a player places up to 3 cubes (`CUBES_PER_MARKET_TILE`) from their Market tile into their pyramid, one at a time. Client logic is in `src/PyramidHandler.ts`, styles in `src/yaxha.scss`, server checks in `modules/php/YXHPyramidManager.php`.
- **Valid spots:** `getPossibleMoves()` computes them and `drawSnapPoints()` draws them as `.pyramid-cube-snap-point`: a darkened square (lighter on level 2+) with a player-colour outline and an icon in the bottom-right corner. Clicking one calls `onSnapPointClicked()`, which sends `actAddCubeToPyramid` (server: `addCubeToPyramid()` → `isMoveValid()`).
- **Change-colour icon (cubes 1 and 2 only):** `displaySwitchColorButton()` puts a `.switch-color-button` overlay (`fa6-exchange`) on the last placed cube. That overlay is the only "last placed" highlight, and at most one exists. It only appears if another legal colour is still on the Market tile (on level 2+, legal means on or next to that colour). Each click swaps the cube for a different-coloured cube from the tile (`onSwitchColorButtonClicked()` → `actPyramidCubeColorSwitched` → server `switchCubeColor()`); it never picks a free colour.
- **Cube 3:** its colour can't be switched. Instead the snap points stay, with a move icon (`fa-angle-double-right`), and clicking one moves cube 3 there (`actMoveCubeInPyramid` → `moveCubeInPyramid()`, which only allows the 3rd cube). Cube 3's own spot doesn't create new spots (`getPyramidCubesExceptFinalBuilt()`).
- **Fewer than 3 cubes:** if no valid spot remains, the confirm button becomes "Confirm and discard the rest" (`updatePyramidStatusText()`); the server re-checks this in `checkUnbuiltCubesAreNotBuildable()`.

## Working rules
- Read `.claude/SPEC.md` (rules summary from the official rulebook) before changing game logic.
- Before editing to fix a server error, ask the user for the PHP error log from the Studio instead of guessing.
- Don't commit without asking.
- In browser console commands, refer to the game object as `window[0].gameui`, not `gameui`.
