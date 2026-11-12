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
- **Tick on the last placed cube:** whenever the switch color button is not shown for the last placed cube (after cube 3, or when no other legal colour is available), `displaySwitchColorButton()` shows a non-clickable `.last-cube-tick` overlay (`fa6-check`) instead.
- **Take back (earlier cubes of this build phase):** `displayTakeBackButtons()` puts a `.take-back-button` overlay (`fa6-rotate-left`, same styling as the switch overlay) on every cube in construction except the last placed one. Clicking it (`onTakeBackButtonClicked()` → `actTakeBackCubes` → server `takeBackCubes()`) returns every cube with a higher `order_in_construction` to the Market tile and makes the clicked cube the last placed one again. Undo Build and take back share `returnCubesInConstructionToMarket()` (server) and `animateCubeBackToMarket()` (client). Cubes from earlier rounds never get an overlay.
- **Grid Confirm button:** `updatePyramidStatusText()` decides the status bar Confirm (blue "Confirm" or red "Confirm and discard the rest") and passes the same variant to `updateGridConfirmButton()`, which shows a mirrored `.grid-confirm-button` inside a folder-tab `.grid-confirm-tab` centered on the top border of the player's own grid (slides up from behind the border). It is hidden whenever build mode is off, and immediately at the start of take back, Undo Build and `disableAndShrinkIfMobile()`. `fitPlayerNameAroundGridConfirm()` truncates the player name so it never runs under it.
- **Fewer than 3 cubes:** if no valid spot remains, the confirm button becomes "Confirm and discard the rest" (`updatePyramidStatusText()`); the server re-checks this in `checkUnbuiltCubesAreNotBuildable()`.

## Player avatar / name on pyramids
- User preference `100` "Show players as" in `gamepreferences.json` (1 = Profile picture, default; 2 = Player name). `GameBody` keeps it as `body[player-display="avatar|name"]`; CSS shows `.player-avatar` or `.text-container` inside `.player-name-text`.
- Clicking either calls `togglePlayerDisplay()` → `setGameUserPreference()`; changes from the BGA options menu arrive via `onGameUserPreferenceChanged()`. Pyramids whose panel avatar isn't found get `.no-avatar` and always show the name.

## Working rules
- Read `.claude/SPEC.md` (rules summary from the official rulebook) before changing game logic.
- Before editing to fix a server error, ask the user for the PHP error log from the Studio instead of guessing.
- Don't commit without asking.
- In browser console commands, refer to the game object as `window[0].gameui`, not `gameui`.
- When you learn something durable about this project, such as a decision, a convention or a gotcha, update the relevant file in `.claude/` before finishing the task.
- When a session has been long or covered several tasks, before wrapping up ask me whether to update the `.claude/` docs with anything from this chat worth keeping.
