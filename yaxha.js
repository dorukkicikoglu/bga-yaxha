var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// @ts-ignore
GameGui = (function () {
    function GameGui() { }
    return GameGui;
})();
var GameBody = /** @class */ (function (_super) {
    __extends(GameBody, _super);
    function GameBody() {
        var _this = _super.call(this) || this;
        _this.players = {};
        console.log('yaxha constructor');
        return _this;
    }
    GameBody.prototype.setup = function (gamedatas) {
        console.log("Starting game setup");
        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', "<div id=\"player-tables\">\n            <div class=\"market-container\"></div>    \n        </div>");
        for (var player_id in gamedatas.players) {
            var _a = this.gamedatas.players[player_id], name_1 = _a.name, color = _a.color, player_no = _a.player_no, turn_order = _a.turn_order;
            this.players[player_id] = new PlayerHandler(this, parseInt(player_id), name_1, color, parseInt(player_no), turn_order);
        }
        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.marketHandler = new MarketHandler(this, gamedatas.marketData);
        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();
        console.log("Ending game setup");
    };
    GameBody.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args);
    };
    GameBody.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
    };
    GameBody.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        console.log('onUpdateActionButtons: ' + stateName, args);
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                //ekmek birgun sil
                case 'playerTurn':
                    var playableCardsIds = args.playableCardsIds; // returned by the argPlayerTurn
                    // Add test action buttons in the action status bar, simulating a card click:
                    playableCardsIds.forEach(function (cardId) { return _this.statusBar.addActionButton(_('Play card with id ${card_id}').replace('${card_id}', cardId), function () { return _this.onCardClick(cardId); }); });
                    this.statusBar.addActionButton(_('Pass'), function () { return _this.bgaPerformAction("actPass"); }, { color: 'secondary' });
                    break;
            }
        }
    };
    GameBody.prototype.onCardClick = function (card_id) {
        console.log('onCardClick', card_id);
        this.bgaPerformAction("actPlayCard", {
            card_id: card_id,
        }).then(function () {
            // What to do after the server call if it succeeded
            // (most of the time, nothing, as the game will react to notifs / change of state instead)
        });
    };
    //utility functions
    GameBody.prototype.format_string_recursive = function (log, args) {
        try {
            log = _(log);
            if (log && args && !args.processed) {
                args.processed = true;
                // list of special keys we want to replace with images
                var keys = ['textPlayerID', 'LOG_CLASS', 'ARROW_LEFT', 'ARROW_DOWN', 'NO_MORE_CARDS', 'PILE_NUM']; //ekmek cok gereksiz var
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key in args) {
                        if (key == 'textPlayerID')
                            args['textPlayerID'] = this.divColoredPlayer(args['textPlayerID']);
                        else if (key == 'LOG_CLASS')
                            log = log + '<div log-class-tag="' + args['LOG_CLASS'] + '"></div>';
                        else if (key == 'ARROW_LEFT')
                            args['ARROW_LEFT'] = '<i class="log-arrow log-arrow-left fa6 fa-angle-double-left"></i>';
                        else if (key == 'ARROW_DOWN')
                            args['ARROW_DOWN'] = '<i class="log-arrow place-under-icon fa6 fa-share"></i>';
                        else if (key == 'PILE_NUM')
                            args['PILE_NUM'] = '';
                    }
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    GameBody.prototype.divYou = function (attributes) {
        if (attributes === void 0) { attributes = {}; }
        var color = this.gamedatas.players[this.player_id].color;
        var color_bg = "";
        if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
            color_bg = "background-color:#" + this.gamedatas.players[this.player_id.toString()].color_back + ";";
        }
        attributes['player-color'] = color;
        var html = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\" " + this.getAttributesHTML(attributes) + ">" + __("lang_mainsite", "You") + "</span>";
        return html;
    };
    GameBody.prototype.divColoredPlayer = function (player_id, attributes, detectYou) {
        if (attributes === void 0) { attributes = {}; }
        if (detectYou === void 0) { detectYou = true; }
        if (detectYou && parseInt(player_id) === parseInt(this.player_id))
            return this.divYou(attributes);
        player_id = player_id.toString();
        var color = this.gamedatas.players[player_id].color;
        var color_bg = "";
        if (this.gamedatas.players[player_id] && this.gamedatas.players[player_id].color_back) {
            color_bg = "background-color:#" + this.gamedatas.players[player_id].color_back + ";";
        }
        attributes['player-color'] = color;
        var html = "<span style=\"color:#" + color + ";" + color_bg + "\" " + this.getAttributesHTML(attributes) + ">" + this.gamedatas.players[player_id].name + "</span>";
        return html;
    };
    GameBody.prototype.getAttributesHTML = function (attributes) { return Object.entries(attributes || {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return "".concat(key, "=\"").concat(value, "\"");
    }).join(' '); };
    GameBody.prototype.getPos = function (node) { var pos = this.getBoundingClientRectIgnoreZoom(node); pos.w = pos.width; pos.h = pos.height; return pos; };
    GameBody.prototype.isDesktop = function () { return dojo.hasClass(dojo.body(), 'desktop_version'); };
    GameBody.prototype.isMobile = function () { return dojo.hasClass(dojo.body(), 'mobile_version'); };
    GameBody.prototype.updateStatusText = function (statusText) { $('gameaction_status').innerHTML = statusText; $('pagemaintitletext').innerHTML = statusText; };
    GameBody.prototype.ajaxAction = function (action, args, lock, checkAction) {
        if (args === void 0) { args = {}; }
        if (lock === void 0) { lock = true; }
        if (checkAction === void 0) { checkAction = true; }
        args.version = this.gamedatas.version;
        this.bgaPerformAction(action, args, { lock: lock, checkAction: checkAction });
    };
    GameBody.prototype.isReplay = function () { return typeof g_replayFrom != 'undefined' || g_archive_mode; };
    GameBody.prototype.remove_px = function (str) {
        str = str.trim();
        if (!isNaN(parseInt(str)) && str === parseInt(str).toString())
            return parseInt(str);
        var result = parseInt(str.toLowerCase().replace(/px/g, ''));
        return isNaN(result) ? 0 : result;
    };
    GameBody.prototype.printDebug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args[0] = typeof args[0] == 'string' ? '*** ' + args[0] : args[0];
        console.log.apply(console, args);
    };
    //notification functions
    GameBody.prototype.setupNotifications = function () {
        console.log('notifications subscriptions setup');
        // TODO: here, associate your game notifications with local methods
        // Example 1: standard notification handling
        // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
        // Example 2: standard notification handling + tell the user interface to wait
        //            during 3 seconds after calling the method in order to let the players
        //            see what is happening in the game.
        // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
        // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
        // 
    };
    return GameBody;
}(GameGui));
var MarketHandler = /** @class */ (function () {
    function MarketHandler(gameui, marketData) {
        this.gameui = gameui;
        this.marketData = marketData;
        this.marketContainer = document.querySelector('#player-tables .market-container');
        this.marketTiles = [];
        this.initMarketContainer();
    }
    MarketHandler.prototype.initMarketContainer = function () {
        var _this = this;
        Object.keys(this.gameui.players).forEach(function (_, i) {
            // First loop: Create market tiles
            _this.marketTiles[i] = document.createElement('div');
            _this.marketTiles[i].className = 'a-market-tile market-tile-' + i;
            _this.marketTiles[i].setAttribute('market-index', i.toString());
            _this.marketContainer.appendChild(_this.marketTiles[i]);
        });
        // Second loop: Create and position cubes
        Object.keys(this.gameui.players).forEach(function (_, i) {
            var tilesData = _this.marketData[i] || [];
            var existingCubes = [];
            tilesData.forEach(function (cube) {
                var cubeDiv = document.createElement('div');
                cubeDiv.className = 'a-cube';
                cubeDiv.setAttribute('cube-id', cube.cube_id.toString());
                cubeDiv.setAttribute('color', cube.color.toString());
                cubeDiv.style.setProperty('--bg-color', '#' + _this.gameui.CUBE_COLORS[Number(cube.color)].colorCode);
                _this.marketTiles[i].appendChild(cubeDiv);
                var _a = _this.getRandomPositionOnTile(_this.marketTiles[i], existingCubes), x = _a.x, y = _a.y;
                cubeDiv.style.left = x + '%';
                cubeDiv.style.top = y + '%';
                existingCubes.push(cubeDiv);
            });
        });
    };
    MarketHandler.prototype.getRandomPositionOnTile = function (marketTile, existingCubes) {
        var tileSize = this.gameui.getPos(marketTile);
        // Get cube size (fallback if no cubes exist)
        var sampleCube = dojo.query('.a-cube', marketTile)[0];
        var cubeSize = sampleCube ? this.gameui.getPos(sampleCube) : { w: 25, h: 25 }; // Default to 40px cubes
        var marginPercent = 0.16;
        var margin = tileSize.w * marginPercent; // 20% margin from edges
        var minSpacing = tileSize.w * 0.06; // Minimum spacing between cubes
        var maxAttempts = 100; // Avoid infinite loops
        var attempt = 0;
        while (attempt < maxAttempts) {
            // Generate random x, y inside marketTile with margin applied
            var x = margin + Math.random() * (tileSize.w - 2 * margin - cubeSize.w);
            var y = margin + Math.random() * (tileSize.h - 2 * margin - cubeSize.h);
            var isOverlap = false;
            var ekmekista = [];
            for (var _i = 0, existingCubes_1 = existingCubes; _i < existingCubes_1.length; _i++) { //check for overlaps
                var cube = existingCubes_1[_i];
                var cubePos = {
                    x: parseInt(cube.style.left) * (tileSize.w / 100) || 0,
                    y: parseInt(cube.style.top) * (tileSize.h / 100) || 0
                };
                ekmekista.push(cubePos);
                if ( //there is an overlap
                x > cubePos.x - (cubeSize.w + minSpacing) &&
                    x < cubePos.x + cubeSize.w + minSpacing &&
                    y > cubePos.y - (cubeSize.h + minSpacing) &&
                    y < cubePos.y + cubeSize.h + minSpacing) {
                    isOverlap = true;
                    continue;
                }
            }
            if (isOverlap) {
                console.log('lets make new attempt ekmek !!!!!!!!!!!!!');
                console.log('random x: ' + x + ', random y: ' + y);
                console.log('existing cubes positions: ', ekmekista);
                attempt++;
            }
            else
                return { x: (x / tileSize.w) * 100, y: (y / tileSize.h) * 100 };
        }
        alert('sictik ekmek !!!!!!!!!!!!!');
        return { x: marginPercent, y: marginPercent }; // Fallback if no valid placement is found
    };
    return MarketHandler;
}());
var PlayerHandler = /** @class */ (function () {
    function PlayerHandler(gameui, playerID, playerName, playerColor, playerNo, turnOrder) {
        this.gameui = gameui;
        this.playerID = playerID;
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.playerNo = playerNo;
        this.turnOrder = turnOrder;
        this.overallPlayerBoard = $('overall_player_board_' + this.playerID);
        this.pyramidContainer = null;
        this.initPyramidContainer();
    }
    PlayerHandler.prototype.initPyramidContainer = function () {
        var _a;
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.playerID;
        this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.playerID.toString());
        // Set the custom property for player color
        this.pyramidContainer.style.setProperty('--player-color', '#' + this.playerColor);
        this.pyramidContainer.innerHTML = "\n\t\t\t<div class=\"player-name-text\">\n\t\t\t\t<div class=\"text-container\">".concat(this.playerName, "</div>\n\t\t\t</div>\n        ");
        (_a = document.getElementById('player-tables')) === null || _a === void 0 ? void 0 : _a.appendChild(this.pyramidContainer);
    };
    return PlayerHandler;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
], function (dojo, declare) {
    return declare("bgagame.yaxha", ebg.core.gamegui, new GameBody());
});
