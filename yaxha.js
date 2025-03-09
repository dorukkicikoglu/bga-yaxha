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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
        //ekmek minified images'i yap
        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', "<div id=\"player-tables\">\n            <div class=\"market-container\">\n                <div class=\"market-tiles-container\"></div>\n                <div class=\"bonus-cards-container\"></div>\n            </div>    \n        </div>");
        for (var player_id in gamedatas.players) {
            var _a = this.gamedatas.players[player_id], name_1 = _a.name, color = _a.color, player_no = _a.player_no, turn_order = _a.turn_order;
            this.players[player_id] = new PlayerHandler(this, parseInt(player_id), name_1, color, parseInt(player_no), turn_order);
        }
        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;
        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs);
        this.tooltipHandler = new TooltipHandler(this);
        this.logMutationObserver = new LogMutationObserver(this);
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
        this.bgaSetupPromiseNotifications();
    };
    // Add the notification handler
    GameBody.prototype.notif_marketIndexSelectionConfirmed = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_marketIndexSelectionConfirmed', args);
                        return [4 /*yield*/, this.marketHandler.marketTileSelected(args.confirmed_selected_market_index)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GameBody;
}(GameGui));
var LogMutationObserver = /** @class */ (function () {
    function LogMutationObserver(gameui) {
        this.gameui = gameui;
        this.nextTimestampValue = '';
        this.observeLogs();
    }
    LogMutationObserver.prototype.observeLogs = function () {
        var _this = this;
        return; //ekmek sil devam et
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div' && node.classList.contains('log')) {
                            _this.processLogDiv(node);
                        }
                    });
                }
            });
        });
        // Configure the MutationObserver to observe changes to the container's child nodes
        var config = {
            childList: true,
            subtree: true // Set to true if you want to observe all descendants of the container
        };
        // Start observing the container
        observer.observe($('logs'), config);
        observer.observe($('chatbar'), config); //mobile notifs
        if (g_archive_mode) { //to observe replayLogs that appears at the bottom of the page on replays
            var replayLogsObserverStarted_1 = false;
            var replayLogsObserver = new MutationObserver(function (mutations, obs) {
                for (var _i = 0, mutations_1 = mutations; _i < mutations_1.length; _i++) {
                    var mutation = mutations_1[_i];
                    if (mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(function (node) {
                            if (!replayLogsObserverStarted_1 && node instanceof HTMLElement && node.id.startsWith('replaylogs')) {
                                _this.processLogDiv(node);
                            }
                        });
                    }
                }
            });
            replayLogsObserver.observe(document.body, { childList: true, subtree: true });
        }
    };
    LogMutationObserver.prototype.processLogDiv = function (node) {
        var _this = this;
        var classTag = dojo.query('*[log-class-tag]', node);
        if (classTag.length > 0) {
            dojo.addClass(node, 'a-game-log ' + dojo.attr(classTag[0], 'log-class-tag'));
            classTag.forEach(dojo.destroy);
        }
        else if (dojo.query('.log-arrow-left, .log-arrow-right, .place-under-icon', node).length > 0) { //guarantee adding class in replay as preserve fields arent loaded
            dojo.addClass(node, 'a-game-log');
            if (dojo.query('.log-arrow-right', node).length > 0)
                dojo.addClass(node, 'selected-cards-log');
            else
                dojo.addClass(node, 'take-pile-log');
        }
        dojo.query('.playername', node).forEach(function (playerName) { dojo.attr(playerName, 'player-color', _this.gameui.rgbToHex(dojo.style(playerName, 'color'))); });
        if (dojo.hasClass(node, 'selected-cards-log')) {
            dojo.attr(node, 'first-selected-cards-log', Array.from(node.parentNode.children).some(function (sibling) { return sibling !== node && sibling.classList.contains("selected-cards-log"); }) ? 'false' : 'true'); //the first new-hand-long will have no margin-top or margin-bottom
        }
        else if (dojo.hasClass(node, 'take-pile-log')) {
            if (this.gameui.isDesktop()) {
                var cardIcons = dojo.query('.card-icons-container', node)[0];
                if (dojo.query('.playername', node).length > 0)
                    cardIcons.style.width = 'calc(100% - ' + (10 + this.gameui.getPos(dojo.query('.playername', node)[0]).w + this.gameui.getPos(dojo.query('.log-arrow', node)[0]).w) + 'px)';
            }
        }
        if (this.gameui.isDesktop() && dojo.hasClass(node, 'a-game-log')) {
            var timestamp = dojo.query('.timestamp', node);
            if (timestamp.length > 0) {
                this.nextTimestampValue = timestamp[0].innerText;
            }
            else if (this.observeLogs.hasOwnProperty('nextTimestampValue')) {
                var newTimestamp = dojo.create('div', { class: 'timestamp' });
                newTimestamp.innerHTML = this.nextTimestampValue;
                dojo.place(newTimestamp, node);
            }
        }
    };
    return LogMutationObserver;
}());
var MarketHandler = /** @class */ (function () {
    function MarketHandler(gameui, marketData, bonusCardIDs) {
        this.gameui = gameui;
        this.marketData = marketData;
        this.bonusCardIDs = bonusCardIDs;
        this.marketContainer = document.querySelector('#player-tables .market-container');
        // this.waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container') as HTMLDivElement; //ekmek sil
        this.marketTilesContainer = this.marketContainer.querySelector('.market-tiles-container');
        this.bonusCardIconsContainer = this.marketContainer.querySelector('.bonus-cards-container');
        this.marketTiles = [];
        this.initMarketContainer();
        this.initBonusCardContainer();
    }
    MarketHandler.prototype.initMarketContainer = function () {
        var _this = this;
        // Create and shuffle array of numbers 1-60
        var shuffledIndices = Array.from({ length: 60 }, function (_, i) { return i + 1; })
            .sort(function () { return Math.random() - 0.5; });
        Object.keys(this.gameui.players).forEach(function (_, i) {
            // First loop: Create market tiles
            _this.marketTiles[i] = document.createElement('div');
            _this.marketTiles[i].className = 'a-market-tile market-tile-' + i;
            _this.marketTiles[i].setAttribute('market-index', i.toString());
            // Use in the loop
            _this.marketTiles[i].setAttribute('random-placement-index', shuffledIndices[i].toString());
            _this.marketTiles[i].addEventListener('click', function (event) { return _this.marketTileClicked(event); });
            _this.marketTilesContainer.appendChild(_this.marketTiles[i]);
        });
        // Second loop: Create and position cubes
        Object.keys(this.gameui.players).forEach(function (_, i) {
            var tilesData = _this.marketData[i] || [];
            tilesData.forEach(function (cube) {
                var cubeDiv = document.createElement('div');
                cubeDiv.className = 'a-cube';
                cubeDiv.innerHTML = '<div class="cube-background"></div>';
                cubeDiv.setAttribute('cube-id', cube.cube_id.toString());
                cubeDiv.setAttribute('color', cube.color.toString());
                cubeDiv.style.setProperty('--top-bg-x', (Math.random() * 100) + '%');
                cubeDiv.style.setProperty('--top-bg-y', (Math.random() * 100) + '%');
                cubeDiv.style.setProperty('--side-bg-x', (Math.random() * 100) + '%');
                cubeDiv.style.setProperty('--side-bg-y', (Math.random() * 100) + '%');
                cubeDiv.style.setProperty('--bottom-bg-x', (Math.random() * 100) + '%');
                cubeDiv.style.setProperty('--bottom-bg-y', (Math.random() * 100) + '%');
                cubeDiv.style.setProperty('--cube-color', '#' + _this.gameui.CUBE_COLORS[Number(cube.color)].colorCode);
                _this.marketTiles[i].appendChild(cubeDiv);
            });
        });
    };
    MarketHandler.prototype.marketTileClicked = function (event) {
        if (!['allSelectMarketTile'].includes(this.gameui.gamedatas.gamestate.name) || this.gameui.isInterfaceLocked())
            return;
        if (!dojo.hasClass(event.target, 'a-market-tile'))
            return;
        if (!this.gameui.isCurrentPlayerActive())
            return;
        console.log('ekmek marketTileClicked', event.target);
        var marketTile = event.target;
        var marketIndex = marketTile.getAttribute('market-index');
        this.gameui.ajaxAction('actAllSelectMarketTile', { marketIndex: marketIndex }, true, false); //ekmek promise yap
        //ekmek revert de yap
    };
    MarketHandler.prototype.marketTileSelected = function (marketIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedTile;
            return __generator(this, function (_a) {
                selectedTile = document.querySelector(".a-market-tile[market-index=\"".concat(marketIndex, "\"]"));
                console.log('marketTileSelected', selectedTile);
                if (selectedTile) {
                    document.querySelectorAll('.a-market-tile').forEach(function (tile) { return tile.classList.remove('selected'); });
                    selectedTile.classList.add('selected');
                    // await this.gameui.wait(500); //ekmek sil
                    // selectedTile.classList.remove('selected');
                }
                return [2 /*return*/];
            });
        });
    };
    MarketHandler.prototype.initBonusCardContainer = function () {
        this.bonusCardIconsContainer.innerHTML = '';
        this.bonusCardIconsContainer.innerHTML = this.bonusCardIDs.map(function (id) { return "<div class=\"a-bonus-card-icon\" bonus-card-id=\"".concat(id, "\" id=\"bonus-card-icon-").concat(id, "\"></div>"); }).join('');
    };
    MarketHandler.prototype.getBonusCardIconsContainer = function () { return this.bonusCardIconsContainer; };
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
var TooltipHandler = /** @class */ (function () {
    function TooltipHandler(gameui) {
        this.gameui = gameui;
        this.addTooltipToBonusCards();
    }
    TooltipHandler.prototype.addTooltipToBonusCards = function () {
        var _this = this;
        var bonusCardIcons = this.gameui.marketHandler.getBonusCardIconsContainer().querySelectorAll('.a-bonus-card-icon');
        bonusCardIcons.forEach(function (cardIcon) {
            var cardIconID = cardIcon.getAttribute('id');
            var cardID = cardIcon.getAttribute('bonus-card-id');
            var tooltipHTML = _this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text;
            //ekmek tooltip background guzellestir
            _this.gameui.addTooltipHtml(cardIconID, "<div class=\"bonus-card-tooltip tooltip-wrapper\" bonus-card-id=\"".concat(cardID, "\">\n                    <div class=\"tooltip-text\">").concat(_(_this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text), "</div>\n                    <div class=\"tooltip-image\"></div>\n                </div>"), 1000);
        });
    };
    return TooltipHandler;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
], function (dojo, declare) {
    return declare("bgagame.yaxha", ebg.core.gamegui, new GameBody());
});
