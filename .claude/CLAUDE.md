# Yaxha (BGA Studio project)

## Environment
- This is a Board Game Arena Studio project. Only BGA's servers can run it, so the code can't be tested locally.
- `php -l` only checks syntax. It can't catch incompatible method signatures with BGA's parent `Table` class (`\Bga\GameFramework\Table`) or other framework-level errors.

## Deployment (SFTP)
- Files in this folder upload to the Studio over SFTP via the VS Code SFTP extension (`.vscode/sftp.json`, with `uploadOnSave` plus a watcher with `autoUpload` and `autoDelete`).
- Saving a file may push it live to the Studio right away.
- Uploads can fail silently. After any server-side error, first check that the server copy matches the local one before assuming the code is at fault.
- Paths in the `ignore` list of `.vscode/sftp.json` (e.g. `.claude/`, `references/`, `node_modules/`) never upload.

## Working rules
- Read `.claude/SPEC.md` (rules summary from the official rulebook) before changing game logic.
- Before editing to fix a server error, ask the user for the PHP error log from the Studio instead of guessing.
- Don't commit without asking.
- In browser console commands, refer to the game object as `window[0].gameui`, not `gameui`.
