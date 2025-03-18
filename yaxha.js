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
var AnimationHandlerPromiseBased = /** @class */ (function () {
    function AnimationHandlerPromiseBased(gameui) {
        this.gameui = gameui;
    }
    AnimationHandlerPromiseBased.prototype.animateProperty = function (args) {
        args = this.addEasing(args);
        var dojoAnim = dojo.animateProperty(args);
        dojoAnim = this.bindStartFunction(dojoAnim);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.animateOnObject = function (args, ignoreGoToPositionChange) {
        var _this = this;
        if (ignoreGoToPositionChange === void 0) { ignoreGoToPositionChange = false; }
        var initialGoToPos = args.goTo ? this.gameui.getPos(args.goTo) : null;
        if (!args.hasOwnProperty('properties'))
            args.properties = {};
        var dojoAnim;
        var arg_beforeBegin = args.hasOwnProperty('beforeBegin') ? args.beforeBegin : function (obj) { return obj; };
        var arg_onBegin = args.hasOwnProperty('onBegin') ? args.onBegin : function (obj) { return obj; };
        args.beforeBegin = function (properties) {
            args = arg_beforeBegin(args);
            var nodePos = _this.gameui.getPos(args.node);
            var goToPos = (!ignoreGoToPositionChange && document.contains(args.goTo)) ? _this.gameui.getPos(args.goTo) : initialGoToPos; // animate to initial position if goTo is not contained in DOM anymore
            var startScaleValues = { x: 1, y: 1 };
            var nodeTranformMatrix = dojo.style(args.node, 'transform');
            var match = nodeTranformMatrix.match(/^matrix\(([^\)]+)\)$/);
            if (match && match.length >= 2) {
                var values = match[1].split(',').map(parseFloat);
                startScaleValues = { x: values[0], y: values[3] };
            }
            var endScaleValues = { x: startScaleValues.x * goToPos.w / nodePos.w, y: startScaleValues.y * goToPos.h / nodePos.h };
            var startW = dojo.style(args.node, 'width');
            var startH = dojo.style(args.node, 'height');
            var nodeTransformOrigin = dojo.style(args.node, 'transform-origin');
            var splitValues = nodeTransformOrigin.split(' ');
            nodeTransformOrigin = { x: parseFloat(splitValues[0]) / startW, y: parseFloat(splitValues[1]) / startH };
            if (!args.hasOwnProperty('fixX') || !args.fixX)
                dojoAnim.properties.left = { start: dojo.style(args.node, 'left'), end: dojo.style(args.node, 'left') + (goToPos.x - nodePos.x) + ((endScaleValues.x - startScaleValues.x) * nodeTransformOrigin.x * startW) };
            if (!args.hasOwnProperty('fixY') || !args.fixY)
                dojoAnim.properties.top = { start: dojo.style(args.node, 'top'), end: dojo.style(args.node, 'top') + (goToPos.y - nodePos.y) + ((endScaleValues.y - startScaleValues.y) * nodeTransformOrigin.y * startH) };
            if (JSON.stringify(startScaleValues) != JSON.stringify(endScaleValues))
                dojoAnim.properties.scale = endScaleValues.x + ' ' + endScaleValues.y;
        };
        args.onBegin = function (properties) {
            args = arg_onBegin(args);
        };
        dojoAnim = this.animateProperty(args);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.combine = function (dojoAnimArray) {
        var dojoAnim = dojo.fx.combine(dojoAnimArray);
        dojoAnim = this.bindStartFunction(dojoAnim);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.chain = function (dojoAnimArray) {
        var dojoAnim = dojo.fx.chain(dojoAnimArray);
        dojoAnim = this.bindStartFunction(dojoAnim);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.bindStartFunction = function (dojoAnim) {
        var _this = this;
        dojoAnim.start = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, this.gameui.bgaPlayDojoAnimation(dojoAnim)];
        }); }); };
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.addEasing = function (args) {
        if (!args.hasOwnProperty('easing'))
            return args;
        if (dojo.fx.easing.hasOwnProperty(args.easing))
            args.easing = dojo.fx.easing[args.easing];
        else
            delete args.easing;
        return args;
    };
    return AnimationHandlerPromiseBased;
}());
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
        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', "<div id=\"player-tables\">\n            <div class=\"market-container\">\n                <div class=\"market-tiles-container\"></div>\n                <div class=\"waiting-players-container\"></div>\n                <div class=\"bonus-cards-container\"></div>\n            </div>\n            <div class=\"pyramids-container\"></div>\n        </div>");
        this.imageLoader = new ImageLoadHandler(this, ['market-tiles', 'player-order-tiles', 'bonus-cards', 'bonus-card-icons']);
        this.animationHandler = new AnimationHandlerPromiseBased(this);
        for (var player_id in gamedatas.players) {
            var _a = this.gamedatas.players[player_id], name_1 = _a.name, color = _a.color, player_no = _a.player_no, turn_order = _a.turn_order;
            this.players[player_id] = new PlayerHandler(this, parseInt(player_id), name_1, color, parseInt(player_no), turn_order);
            if (player_id == this.player_id)
                this.myself = this.players[player_id];
        }
        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;
        this.MARKET_TILE_COLORS = gamedatas.MARKET_TILE_COLORS;
        this.MARKET_TILE_COLORS.forEach(function (color, index) {
            document.documentElement.style.setProperty("--market-tile-color-".concat(index), "#".concat(color));
        });
        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs, gamedatas.playerSelectedMarketIndex, gamedatas.collectedMarketTilesData);
        this.tooltipHandler = new TooltipHandler(this);
        this.logMutationObserver = new LogMutationObserver(this);
        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();
        console.log("Ending game setup");
    };
    GameBody.prototype.onEnteringState = function (stateName, args) {
        console.log('Entering state: ' + stateName, args);
        switch (stateName) {
            case 'allSelectMarketTile':
                this.marketHandler.addSelectableClassToMarketTiles('all');
                break;
        }
    };
    GameBody.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.marketHandler.marketTiles.forEach(function (tile) { tile.classList.remove('selected-market-tile', 'selectable-market-tile'); });
    };
    GameBody.prototype.onUpdateActionButtons = function (stateName, args) {
        console.log('onUpdateActionButtons: ' + stateName, args);
        switch (stateName) {
            case 'allSelectMarketTile':
                this.marketHandler.updateStatusTextUponCubeSelection();
                break;
            case 'individualPlayerSelectMarketTile':
                if (this.myself) {
                    var playerCollectedMarketTile = this.marketHandler.getPlayerCollectedMarketTile(this.myself.playerID);
                    if (this.isCurrentPlayerActive())
                        this.marketHandler.addSelectableClassToMarketTiles(args.possible_market_indexes);
                    else if (playerCollectedMarketTile.type === 'collecting')
                        this.updateStatusText(dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), { you: this.divYou() }));
                }
                break;
        }
    };
    //utility functions
    GameBody.prototype.format_string_recursive = function (log, args) {
        try {
            log = _(log);
            if (log && args && !args.processed) {
                args.processed = true;
                // list of special keys we want to replace with images
                var keys = ['textPlayerID', 'REVEALED_MARKET_TILES_DATA_STR', 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR', 'LOG_CLASS'];
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key in args) {
                        if (key == 'textPlayerID')
                            args['textPlayerID'] = this.divColoredPlayer(args['textPlayerID']);
                        else if (key == 'REVEALED_MARKET_TILES_DATA_STR')
                            args['REVEALED_MARKET_TILES_DATA_STR'] = this.logMutationObserver.createLogSelectedMarketTiles(args['collectedMarketTilesData']);
                        else if (key == 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR')
                            args['INDIVIDUAL_MARKET_TILES_COLLECTION_STR'] = "<div class=\"player-collected-market-tile-row 'collecting'\">".concat(this.divColoredPlayer(args.player_id, { class: 'playername' }, false), "<i class=\"log-arrow log-arrow-left fa6 fa-arrow-left\"></i><div class=\"a-market-tile-icon\" market-index=\"").concat(args.collected_market_index, "\"></div></div>");
                        else if (key == 'LOG_CLASS')
                            log = log + '<div log-class-tag="' + args['LOG_CLASS'] + '"></div>';
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
    GameBody.prototype.isDesktop = function () { return document.body.classList.contains('desktop_version'); };
    GameBody.prototype.isMobile = function () { return document.body.classList.contains('mobile_version'); };
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
    GameBody.prototype.rgbToHex = function (rgb) {
        var match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) {
            this.printDebug('-- rgb --', rgb);
            throw new Error("Invalid RGB format");
        }
        // Convert each component to a two-character hexadecimal
        var r = match[1], g = match[2], b = match[3];
        return [r, g, b]
            .map(function (num) {
            var hex = parseInt(num, 10).toString(16);
            return hex.padStart(2, '0'); // Ensure two digits
        })
            .join(''); // Combine into a single string
    };
    GameBody.prototype.dotTicks = function (waitingTextContainer) {
        var dotInterval;
        var loaderSpan = dojo.create('span', { class: 'loader-span', style: 'display: inline-block; width: 24px; text-align: left;', dots: 0 });
        dojo.place(loaderSpan, waitingTextContainer, 'after');
        var dotTick = function () {
            if (!document.body.contains(waitingTextContainer))
                return clearInterval(dotInterval);
            var dotCount = parseInt(dojo.attr(loaderSpan, 'dots'));
            loaderSpan.innerHTML = '.'.repeat(dotCount);
            dojo.attr(loaderSpan, 'dots', (dotCount + 1) % 4);
        };
        dotTick();
        dotInterval = setInterval(dotTick, 500);
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
    GameBody.prototype.notif_marketIndexSelectionReverted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_marketIndexSelectionReverted');
                        return [4 /*yield*/, this.marketHandler.marketTileSelected(null)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameBody.prototype.notif_animateAllMarketTileSelections = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_animateAllMarketTileSelections');
                        return [4 /*yield*/, this.marketHandler.animateAllMarketTileSelections(args.collectedMarketTilesData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameBody.prototype.notif_individualPlayerCollected = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_individualPlayerCollected');
                        return [4 /*yield*/, this.marketHandler.animateIndividualPlayerCollected(args.player_id, args.collected_market_index)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GameBody;
}(GameGui));
var ImageLoadHandler = /** @class */ (function () {
    function ImageLoadHandler(gameui, propNames) {
        this.gameui = gameui;
        this.images = {};
        var style = getComputedStyle(document.body);
        for (var _i = 0, propNames_1 = propNames; _i < propNames_1.length; _i++) {
            var imageTag = propNames_1[_i];
            var imageCSSURL = style.getPropertyValue('--image-source-' + imageTag);
            var imageNameMinified = imageCSSURL.match(/url\((?:'|")?.*\/(.*?)(?:'|")?\)/)[1];
            var imageName = imageNameMinified.replace('_minified', '');
            this.gameui.dontPreloadImage(imageName);
            this.images[imageTag] = { imageName: imageName, loaded: false };
        }
        for (var imageTag in this.images)
            this.loadImage(imageTag);
    }
    ImageLoadHandler.prototype.loadImage = function (imageTag) {
        var _this = this;
        var imageName = this.images[imageTag].imageName;
        var img = new Image();
        img.src = g_gamethemeurl + 'img/' + imageName;
        img.onerror = function () { console.error('Error loading image: ' + imageName); };
        img.onload = function () {
            document.documentElement.style.setProperty('--image-source-' + imageTag, 'url(' + img.src + ')');
            _this.images[imageTag].loaded = true;
        };
    };
    return ImageLoadHandler;
}());
var LogMutationObserver = /** @class */ (function () {
    function LogMutationObserver(gameui) {
        this.gameui = gameui;
        this.nextTimestampValue = '';
        this.observeLogs();
    }
    LogMutationObserver.prototype.observeLogs = function () {
        var _this = this;
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
    LogMutationObserver.prototype.createLogSelectedMarketTiles = function (cardsData) {
        var _this = this;
        var logHTML = '';
        cardsData.collectingPlayers.sort(function (a, b) { return a.turn_order - b.turn_order; });
        cardsData.pendingPlayers.sort(function (a, b) { return a.turn_order - b.turn_order; });
        var createPlayerRow = function (cardData, isCollecting) {
            if (isCollecting === void 0) { isCollecting = true; }
            return "<div class=\"player-selected-market-tile-row ".concat(isCollecting ? 'collecting' : 'pending', "\">").concat(_this.gameui.divColoredPlayer(cardData.player_id, { class: 'playername' }, false), "<i class=\"log-arrow log-arrow-left fa6 ").concat(isCollecting ? 'fa-arrow-left' : 'fa-ban', "\"></i><div class=\"a-market-tile-icon\" market-index=\"").concat(cardData.selected_market_index, "\"></div></div>");
        };
        cardsData.collectingPlayers.forEach(function (cardData) { logHTML += createPlayerRow(cardData, true); });
        cardsData.pendingPlayers.forEach(function (cardData) { logHTML += createPlayerRow(cardData, false); });
        return logHTML;
    };
    return LogMutationObserver;
}());
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var MarketHandler = /** @class */ (function () {
    function MarketHandler(gameui, marketData, bonusCardIDs, playerSelectedMarketIndex, collectedMarketTilesData) {
        this.gameui = gameui;
        this.marketData = marketData;
        this.bonusCardIDs = bonusCardIDs;
        this.playerSelectedMarketIndex = playerSelectedMarketIndex;
        this.collectedMarketTilesData = collectedMarketTilesData;
        this.marketContainer = document.querySelector('#player-tables .market-container');
        this.marketTilesContainer = this.marketContainer.querySelector('.market-tiles-container');
        this.waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container');
        this.bonusCardIconsContainer = this.marketContainer.querySelector('.bonus-cards-container');
        this.marketTiles = [];
        this.initMarketContainer();
        this.initBonusCardContainer();
        this.updateStatusTextUponCubeSelection();
    }
    MarketHandler.prototype.initMarketContainer = function () {
        var _this = this;
        // Create and shuffle array of numbers 1-60
        var shuffledIndices = Array.from({ length: 60 }, function (_, i) { return i + 1; })
            .sort(function () { return Math.random() - 0.5; });
        Object.keys(this.gameui.players).forEach(function (_, i) {
            // First loop: Create market tiles
            _this.marketTiles[i] = document.createElement('div');
            _this.marketTiles[i].innerHTML = '<div class="cubes-container"></div>';
            _this.marketTiles[i].className = 'a-market-tile market-tile-' + i + ' ' + (_this.playerSelectedMarketIndex !== null && Number(_this.playerSelectedMarketIndex) === i ? 'selected-market-tile' : '');
            _this.marketTiles[i].setAttribute('market-index', i.toString());
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
                _this.marketTiles[i].querySelector('.cubes-container').appendChild(cubeDiv);
            });
        });
        // Add player avatars to market tiles and show waiting players container if any players are pending
        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile') {
            this.collectedMarketTilesData.sort(function (a, b) { return a.turn_order - b.turn_order; });
            this.collectedMarketTilesData.forEach(function (playerCollects) {
                _this.addPlayerAvatar(playerCollects, true);
                if (playerCollects.type == 'pending')
                    _this.waitingPlayersContainer.style.opacity = '1';
            });
        }
    };
    MarketHandler.prototype.addSelectableClassToMarketTiles = function (possibleMarketIndexes) {
        var _this = this;
        this.marketTiles.forEach(function (tile) { return tile.classList.remove('selectable-market-tile'); });
        var selectableMarketTiles = [];
        if (possibleMarketIndexes === 'all')
            selectableMarketTiles = this.marketTiles;
        else
            possibleMarketIndexes.forEach(function (i) { return selectableMarketTiles.push(_this.marketTiles[i]); });
        selectableMarketTiles.forEach(function (tile) { return tile.classList.add('selectable-market-tile'); });
    };
    MarketHandler.prototype.marketTileClicked = function (event) {
        if (!['allSelectMarketTile', 'individualPlayerSelectMarketTile'].includes(this.gameui.gamedatas.gamestate.name) || this.gameui.isInterfaceLocked())
            return;
        var marketTile = event.target;
        if (!marketTile.classList.contains('a-market-tile') || !marketTile.classList.contains('selectable-market-tile'))
            return;
        var marketIndex = marketTile.getAttribute('market-index');
        var actionName = '';
        if (this.gameui.gamedatas.gamestate.name === 'allSelectMarketTile') {
            if (!marketTile.classList.contains('selected-market-tile'))
                actionName = 'actAllSelectMarketTile';
            else
                actionName = 'actRevertAllSelectMarketTile';
        }
        else if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile')
            actionName = 'actIndividualPlayerSelectMarketTile';
        this.gameui.ajaxAction(actionName, { marketIndex: marketIndex }, true, false);
        // if(!marketTile.classList.contains('selected-market-tile')) //ekmek sil
        //     this.gameui.ajaxAction('actAllSelectMarketTile', {marketIndex: marketIndex}, true, false);
        // else this.gameui.ajaxAction('actRevertAllSelectMarketTile', {marketIndex: marketIndex}, true, false);
    };
    MarketHandler.prototype.marketTileSelected = function (marketIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedTile;
            return __generator(this, function (_a) {
                selectedTile = document.querySelector(".a-market-tile[market-index=\"".concat(marketIndex, "\"]"));
                this.marketContainer.querySelectorAll('.a-market-tile').forEach(function (tile) { return tile.classList.remove('selected-market-tile'); });
                if (selectedTile) {
                    this.playerSelectedMarketIndex = marketIndex;
                    selectedTile.classList.add('selected-market-tile');
                }
                else {
                    this.playerSelectedMarketIndex = null;
                }
                this.updateStatusTextUponCubeSelection();
                return [2 /*return*/];
            });
        });
    };
    MarketHandler.prototype.updateStatusTextUponCubeSelection = function () {
        if (this.gameui.gamedatas.gamestate.name != 'allSelectMarketTile')
            return;
        if (!this.gameui.myself)
            return;
        var statusText = '';
        if (this.playerSelectedMarketIndex !== null) {
            var marketTileIcon = '<div class="a-market-tile-icon" market-index="' + this.playerSelectedMarketIndex + '"></div>';
            statusText = dojo.string.substitute(_('${you} selected ${marketTileIcon} Waiting for others'), { you: this.gameui.divYou(), marketTileIcon: marketTileIcon });
            statusText = '<span class="waiting-text">' + statusText + '</span>';
        }
        else {
            statusText = dojo.string.substitute(_('${you} must select a Market Tile'), { you: this.gameui.divYou() });
        }
        this.gameui.updateStatusText(statusText);
        if (this.playerSelectedMarketIndex)
            this.gameui.dotTicks(dojo.query('#page-title .waiting-text')[0]);
    };
    MarketHandler.prototype.initBonusCardContainer = function () {
        this.bonusCardIconsContainer.innerHTML = '';
        this.bonusCardIconsContainer.innerHTML = this.bonusCardIDs.map(function (id) { return "<div class=\"a-bonus-card-icon\" bonus-card-id=\"".concat(id, "\" id=\"bonus-card-icon-").concat(id, "\"></div>"); }).join('');
    };
    MarketHandler.prototype.animateAllMarketTileSelections = function (collectedMarketTilesData) {
        return __awaiter(this, void 0, void 0, function () {
            var raiseAvatarAnimations, moveCollectingAvatarAnimations, movePendingAvatarAnimations, raiseAvatarsCombinedAnimation, moveCollectingAvatarsCombinedAnimation, movePendingAvatarsCombinedAnimation;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.collectedMarketTilesData = __spreadArray(__spreadArray([], collectedMarketTilesData.collectingPlayers.map(function (player) { return (__assign(__assign({}, player), { type: 'collecting' })); }), true), collectedMarketTilesData.pendingPlayers.map(function (player) { return (__assign(__assign({}, player), { type: 'pending' })); }), true);
                        raiseAvatarAnimations = [];
                        moveCollectingAvatarAnimations = [];
                        movePendingAvatarAnimations = [];
                        this.collectedMarketTilesData.forEach(function (playerCollects, animationOrder) {
                            var avatarClone = _this.gameui.players[playerCollects.player_id].getAvatarClone(true);
                            var currentTop = parseInt(window.getComputedStyle(avatarClone).top);
                            var currentLeft = parseInt(window.getComputedStyle(avatarClone).left);
                            var destAvatar = _this.addPlayerAvatar(playerCollects, false);
                            var destAvatarRect = destAvatar ? destAvatar.getBoundingClientRect() : { width: 0, height: 0 };
                            var raiseAvatarClone = _this.gameui.animationHandler.animateProperty({
                                node: avatarClone,
                                duration: 200,
                                delay: animationOrder * 100,
                                properties: { top: currentTop - 20, width: destAvatarRect.width, height: destAvatarRect.height },
                                easing: 'sineIn',
                            });
                            raiseAvatarAnimations.push(raiseAvatarClone);
                            var moveAvatarClone = _this.gameui.animationHandler.animateOnObject({
                                node: avatarClone,
                                goTo: destAvatar,
                                delay: (playerCollects.type == 'collecting') ? moveCollectingAvatarAnimations.length * 200 : movePendingAvatarAnimations.length * 200,
                                duration: 500,
                                easing: "cubic-bezier(".concat(0.1 + Math.random() * 0.2, ", ").concat(0.3 + Math.random() * 0.3, ", ").concat(0.5 + Math.random() * 0.3, ", ").concat(0.7 + Math.random() * 0.2, ")"),
                                onEnd: function () { destAvatar.style.opacity = null; dojo.destroy(avatarClone); }
                            });
                            if (playerCollects.type == 'collecting')
                                moveCollectingAvatarAnimations.push(moveAvatarClone);
                            else
                                movePendingAvatarAnimations.push(moveAvatarClone);
                        });
                        raiseAvatarsCombinedAnimation = this.gameui.animationHandler.combine(raiseAvatarAnimations);
                        moveCollectingAvatarsCombinedAnimation = this.gameui.animationHandler.combine(moveCollectingAvatarAnimations);
                        movePendingAvatarsCombinedAnimation = this.gameui.animationHandler.combine(movePendingAvatarAnimations);
                        return [4 /*yield*/, raiseAvatarsCombinedAnimation.start()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, moveCollectingAvatarsCombinedAnimation.start()];
                    case 2:
                        _a.sent();
                        if (!(movePendingAvatarAnimations.length > 0)) return [3 /*break*/, 4];
                        this.waitingPlayersContainer.style.opacity = '1';
                        return [4 /*yield*/, movePendingAvatarsCombinedAnimation.start()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.animateIndividualPlayerCollected = function (playerID, collectedMarketIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var destAvatar, pendingAvatar, avatarRect, pendingAvatarClone, shrinkPendingAvatar, movePendingAvatarClone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        destAvatar = this.addPlayerAvatar({ player_id: playerID, collected_market_index: collectedMarketIndex, type: 'collecting' }, false);
                        pendingAvatar = this.waitingPlayersContainer.querySelector(".yaxha-player-avatar.pending-player-avatar[player-id=\"".concat(playerID, "\"]"));
                        avatarRect = pendingAvatar.getBoundingClientRect();
                        pendingAvatarClone = this.gameui.players[playerID].getAvatarClone(false, true, pendingAvatar.querySelector('img'));
                        document.getElementById('overall-content').appendChild(pendingAvatarClone);
                        this.gameui.placeOnObject(pendingAvatarClone, pendingAvatar);
                        pendingAvatar.style.opacity = '0';
                        destAvatar.style.opacity = '0';
                        shrinkPendingAvatar = this.gameui.animationHandler.animateProperty({
                            node: pendingAvatar,
                            properties: { width: 0, marginLeft: 0, marginRight: 0 },
                            duration: 500,
                            easing: 'sineOut',
                            onEnd: function () { dojo.destroy(pendingAvatar); }
                        });
                        movePendingAvatarClone = this.gameui.animationHandler.animateOnObject({
                            node: pendingAvatarClone,
                            goTo: destAvatar,
                            duration: 500,
                            easing: "cubic-bezier(".concat(0.1 + Math.random() * 0.2, ", ").concat(0.3 + Math.random() * 0.3, ", ").concat(0.5 + Math.random() * 0.3, ", ").concat(0.7 + Math.random() * 0.2, ")"),
                            onEnd: function () { destAvatar.style.opacity = null; dojo.destroy(pendingAvatarClone); }
                        });
                        return [4 /*yield*/, this.gameui.animationHandler.combine([shrinkPendingAvatar, movePendingAvatarClone]).start()];
                    case 1:
                        _a.sent();
                        if (this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar').length === 0)
                            this.waitingPlayersContainer.style.opacity = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.addPlayerAvatar = function (playerCollects, isVisible) {
        var avatarClone = this.gameui.players[playerCollects.player_id].getAvatarClone();
        var newAvatarContainer = playerCollects.type === 'collecting'
            ? this.marketTiles[playerCollects.collected_market_index]
            : this.marketContainer.querySelector('.waiting-players-container');
        avatarClone.removeAttribute("style");
        avatarClone.classList.add("".concat(playerCollects.type, "-player-avatar"));
        avatarClone.classList.remove('avatar-clone');
        avatarClone.style.setProperty('--player-color', '#' + this.gameui.players[playerCollects.player_id].playerColor);
        if (!isVisible)
            avatarClone.style.opacity = '0';
        newAvatarContainer.appendChild(avatarClone);
        return avatarClone;
    };
    MarketHandler.prototype.getPlayerCollectedMarketTile = function (player_id) {
        return this.collectedMarketTilesData.find(function (player) { return Number(player.player_id) === Number(player_id); });
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
    PlayerHandler.prototype.getAvatarClone = function (placeOnPlayerBoard, get184by184, srcAvatar) {
        if (placeOnPlayerBoard === void 0) { placeOnPlayerBoard = false; }
        if (get184by184 === void 0) { get184by184 = true; }
        if (srcAvatar === void 0) { srcAvatar = null; }
        if (!srcAvatar)
            srcAvatar = dojo.query('img.avatar', this.overallPlayerBoard)[0];
        if (srcAvatar) {
            // Get dimensions and source from original avatar
            var avatarRect = srcAvatar.getBoundingClientRect();
            var avatarSrc_1 = srcAvatar.getAttribute('src');
            var avatarSrc32_1 = avatarSrc_1;
            avatarSrc_1 = get184by184 ? avatarSrc_1.replace('32.jpg', '184.jpg') : avatarSrc_1;
            // Create new avatar clone structure with innerHTML
            var avatarClone = document.createElement('div');
            avatarClone.className = 'avatar-clone yaxha-player-avatar';
            avatarClone.setAttribute('player-id', this.playerID.toString());
            avatarClone.style.cssText = "position: absolute; width: ".concat(avatarRect.width, "px; height: ").concat(avatarRect.height, "px; --player-color: #").concat(this.playerColor, ";");
            avatarClone.innerHTML = "<img src=\"".concat(avatarSrc_1, "\" style=\"width: 100%; height: 100%;\">");
            if (get184by184) { // If requesting 184x184 avatar, handle fallback to 32x32 if larger image fails to load
                var addedImg_1 = avatarClone.querySelector('img');
                var tempImg = new Image();
                tempImg.src = avatarSrc_1;
                tempImg.onerror = function () {
                    document.querySelectorAll('img').forEach(function (img) {
                        if (img.getAttribute('src') === avatarSrc_1)
                            img.src = avatarSrc32_1;
                    });
                    addedImg_1.src = avatarSrc32_1;
                };
            }
            if (placeOnPlayerBoard) { // If requested, place the cloned avatar on the original avatar's position
                document.getElementById('overall-content').appendChild(avatarClone);
                this.gameui.placeOnObject(avatarClone, srcAvatar);
            }
            return avatarClone;
        }
        else {
            console.log('avatar not found, playerID:', this.playerID);
            return null;
        }
    };
    PlayerHandler.prototype.initPyramidContainer = function () {
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.playerID;
        this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.playerID.toString());
        // Set the custom property for player color
        this.pyramidContainer.style.setProperty('--player-color', '#' + this.playerColor);
        var turnOrderContainerId = "turn-order-".concat(this.playerID);
        this.pyramidContainer.innerHTML = "\n\t\t\t<div class=\"player-name-text\">\n\t\t\t\t<div class=\"text-container\">".concat(this.playerName, "</div>\n\t\t\t</div>\n\t\t\t<div class=\"turn-order-container\" id=\"").concat(turnOrderContainerId, "\" turn-order=\"").concat(this.turnOrder, "\"></div>\n        ");
        document.getElementById('player-tables').querySelector('.pyramids-container').insertAdjacentElement(Number(this.playerID) === Number(this.gameui.player_id) ? 'afterbegin' : 'beforeend', this.pyramidContainer);
    };
    return PlayerHandler;
}());
var TooltipHandler = /** @class */ (function () {
    function TooltipHandler(gameui) {
        this.gameui = gameui;
        this.addTooltipToBonusCards();
        this.addTooltipToTurnOrder();
    }
    TooltipHandler.prototype.addTooltipToBonusCards = function () {
        var _this = this;
        var bonusCardIcons = this.gameui.marketHandler.bonusCardIconsContainer.querySelectorAll('.a-bonus-card-icon');
        bonusCardIcons.forEach(function (cardIcon) {
            var cardIconID = cardIcon.getAttribute('id');
            var cardID = cardIcon.getAttribute('bonus-card-id');
            var tooltipHTML = _this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text;
            //ekmek tooltip background guzellestir
            _this.gameui.addTooltipHtml(cardIconID, "<div class=\"bonus-card-tooltip tooltip-wrapper\" bonus-card-id=\"".concat(cardID, "\">\n                    <div class=\"tooltip-text\">").concat(_(_this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text), "</div>\n                    <div class=\"tooltip-image\"></div>\n                </div>"), 400);
        });
    };
    TooltipHandler.prototype.addTooltipToTurnOrder = function () {
        var _this = this;
        var turnOrderContainers = document.querySelectorAll('.pyramids-container .turn-order-container');
        turnOrderContainers.forEach(function (container) {
            var containerId = container.getAttribute('id');
            var turnOrder = parseInt(container.getAttribute('turn-order'));
            var playerId = container.closest('.a-pyramid-container').getAttribute('player-id');
            var playerDiv = _this.gameui.divColoredPlayer(playerId, {}, false);
            _this.gameui.addTooltipHtml(containerId, "<div class=\"turn-order-tooltip tooltip-wrapper\">\n                    <div class=\"tooltip-text\">".concat(_('${player}\'s turn order: ${order}').replace('${player}', playerDiv).replace('${order}', turnOrder.toString()), "</div>\n                </div>"), 400);
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
