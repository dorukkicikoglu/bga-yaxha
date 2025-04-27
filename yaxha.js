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
        dojoAnim = this.bindWrapperFunctions(dojoAnim);
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
        args.beforeBegin = function () {
            args.beforeBegin = arg_beforeBegin(args);
            var nodePos = _this.gameui.getPos(args.node);
            var goToPos = (!ignoreGoToPositionChange && document.contains(args.goTo)) ? _this.gameui.getPos(args.goTo) : initialGoToPos; // animate to initial position if goTo is not contained in DOM anymore
            var startScaleValues = { x: 1, y: 1 };
            var nodeTranformMatrix = dojo.style(args.node, 'transform');
            var match = nodeTranformMatrix.match(/^matrix\(([^\)]+)\)$/);
            if (match && match.length >= 2) {
                var values = match[1].split(',').map(parseFloat);
                startScaleValues = { x: values[0], y: values[3] };
            }
            var endScaleValues = { x: startScaleValues.x * goToPos.width / nodePos.width, y: startScaleValues.y * goToPos.height / nodePos.height };
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
        args.onBegin = function () {
            args.onBegin = arg_onBegin(args);
        };
        dojoAnim = this.animateProperty(args);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.fadeOutAndDestroy = function (node, duration) {
        if (duration === void 0) { duration = 200; }
        this.animateProperty({
            node: node,
            properties: { opacity: 0 },
            duration: duration,
            onEnd: function () {
                node.remove();
            }
        }).start();
    };
    AnimationHandlerPromiseBased.prototype.combine = function (dojoAnimArray) {
        var dojoAnim = dojo.fx.combine(dojoAnimArray);
        dojoAnim = this.bindWrapperFunctions(dojoAnim);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.chain = function (dojoAnimArray) {
        var dojoAnim = dojo.fx.chain(dojoAnimArray);
        dojoAnim = this.bindWrapperFunctions(dojoAnim);
        return dojoAnim;
    };
    AnimationHandlerPromiseBased.prototype.bindWrapperFunctions = function (dojoAnim) {
        var _this = this;
        dojoAnim.start = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, this.gameui.bgaPlayDojoAnimation(dojoAnim)];
        }); }); };
        dojoAnim.addDelay = function (delay) {
            var delayAnim = _this.animateProperty({
                node: document.createElement('div'),
                duration: delay,
            });
            return _this.chain([delayAnim, dojoAnim]);
        };
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
        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;
        this.MARKET_TILE_COLORS = gamedatas.MARKET_TILE_COLORS;
        this.PYRAMID_MAX_SIZE = gamedatas.PYRAMID_MAX_SIZE;
        this.CUBES_PER_MARKET_TILE = gamedatas.CUBES_PER_MARKET_TILE;
        var pyramidCSSRange = [];
        for (var i = -1 * (this.PYRAMID_MAX_SIZE - 1); i <= this.PYRAMID_MAX_SIZE - 1; i++)
            pyramidCSSRange.push(i);
        var cubeColorCSS = '';
        for (var colorIndex in this.CUBE_COLORS) {
            cubeColorCSS += ".a-cube[color=\"".concat(colorIndex, "\"] { --cube-color: #").concat(this.CUBE_COLORS[colorIndex].colorCode, "; }\n            ");
        }
        var pyramidCSS = '';
        pyramidCSSRange.forEach(function (n) {
            pyramidCSS += "\n            .pyramids-container .a-pyramid-container .cubes-container *[pos-x=\"".concat(n, "\"] {\n            left: calc(min(var(--pyramid-cube-width), var(--max-cube-width)) * ").concat(n, ");\n            }\n            .pyramids-container .a-pyramid-container .cubes-container *[pos-y=\"").concat(n, "\"] {\n            bottom: calc(min(var(--pyramid-cube-width), var(--max-cube-width)) * ").concat(n, ");\n            }\n            ");
        }); //ekmek pos-z ekle
        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', "\n            <style>\n                ".concat(cubeColorCSS, "\n                ").concat(pyramidCSS, "\n            </style>\n            <div id=\"player-tables\">\n            <div class=\"market-container\">\n                <div class=\"market-tiles-container\"></div>\n                <div class=\"waiting-players-container\"></div>\n                <div class=\"bonus-cards-container\"></div>\n            </div>\n            <div class=\"pyramids-container\"></div>\n        </div>"));
        this.imageLoader = new ImageLoadHandler(this, ['market-tiles', 'player-order-tiles', 'bonus-cards', 'bonus-card-icons']);
        this.animationHandler = new AnimationHandlerPromiseBased(this);
        for (var player_id in gamedatas.players) {
            var _a = this.gamedatas.players[player_id], name_1 = _a.name, color = _a.color, player_no = _a.player_no, turn_order = _a.turn_order, built_cubes_this_round = _a.built_cubes_this_round;
            this.players[player_id] = new PlayerHandler(this, parseInt(player_id), name_1, color, parseInt(player_no), turn_order, gamedatas.pyramidData[player_id], built_cubes_this_round == '1');
            if (player_id == this.player_id)
                this.myself = this.players[player_id];
        }
        this.MARKET_TILE_COLORS.forEach(function (color, index) {
            document.documentElement.style.setProperty("--market-tile-color-".concat(index), "#".concat(color));
        });
        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs, gamedatas.collectedMarketTilesData);
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
                if (args.args._private.selected_market_index === null)
                    this.marketHandler.addSelectableClassToMarketTiles('all');
                else
                    this.marketHandler.addSelectableClassToMarketTiles('none');
                break;
        }
    };
    GameBody.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.marketHandler.getMarketTiles().forEach(function (tile) { tile.classList.remove('selected-market-tile', 'selectable-market-tile'); });
        switch (stateName) {
            case 'buildPyramid':
                if (this.myself)
                    this.myself.pyramid.disableBuildPyramid();
                break;
        }
    };
    GameBody.prototype.onUpdateActionButtons = function (stateName, args) {
        console.log('onUpdateActionButtons: ' + stateName, args);
        switch (stateName) {
            case 'allSelectMarketTile':
                this.marketHandler.updateStatusTextUponMarketTileSelection();
                this.marketHandler.setCollectedMarketTilesData(args.collectedMarketTilesData);
                break;
            case 'individualPlayerSelectMarketTile':
                this.marketHandler.setCollectedMarketTilesData(args.collectedMarketTilesData);
                if (this.myself) {
                    var playerCollectedMarketTile = this.myself.getCollectedMarketTileData();
                    if (this.isCurrentPlayerActive())
                        this.marketHandler.addSelectableClassToMarketTiles(args.possible_market_indexes);
                    else if (playerCollectedMarketTile.type === 'collecting')
                        this.myself.pyramid.enableBuildPyramid(args._private.possible_moves);
                }
                break;
            case 'buildPyramid':
                if (this.myself)
                    this.myself.pyramid.enableBuildPyramid(args._private.possible_moves);
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
                var keys = ['textPlayerID', 'REVEALED_MARKET_TILES_DATA_STR', 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR', 'SWAP_TURN_ORDERS_DATA_STR', 'DISPLAY_BUILT_CUBES_STR', 'LOG_CLASS'];
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    if (key in args) {
                        if (key == 'textPlayerID')
                            args['textPlayerID'] = this.divColoredPlayer(args['textPlayerID']);
                        else if (key == 'REVEALED_MARKET_TILES_DATA_STR')
                            args['REVEALED_MARKET_TILES_DATA_STR'] = this.logMutationObserver.createLogSelectedMarketTiles(args['collectedMarketTilesData']);
                        else if (key == 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR')
                            args['INDIVIDUAL_MARKET_TILES_COLLECTION_STR'] = "<div class=\"player-collected-market-tile-row collecting\">".concat(this.divColoredPlayer(args.player_id, { class: 'playername' }, false), "<i class=\"log-arrow log-arrow-left fa6 fa-arrow-left\"></i><div class=\"a-market-tile-icon\" market-index=\"").concat(args.collected_market_index, "\"></div></div>");
                        else if (key == 'DISPLAY_BUILT_CUBES_STR')
                            args['DISPLAY_BUILT_CUBES_STR'] = this.logMutationObserver.createLogDisplayBuiltCubes(args['built_cubes']);
                        else if (key == 'SWAP_TURN_ORDERS_DATA_STR')
                            args['SWAP_TURN_ORDERS_DATA_STR'] = this.logMutationObserver.createLogSwapTurnOrders(args['swapData']);
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
    GameBody.prototype.divActivePlayer = function (attributes, detectYou) {
        if (attributes === void 0) { attributes = {}; }
        if (detectYou === void 0) { detectYou = true; }
        var activePlayerID = this.getActivePlayerId();
        if (!activePlayerID)
            return null;
        return this.divColoredPlayer(activePlayerID, attributes, detectYou);
    };
    GameBody.prototype.getAttributesHTML = function (attributes) { return Object.entries(attributes || {}).map(function (_a) {
        var key = _a[0], value = _a[1];
        return "".concat(key, "=\"").concat(value, "\"");
    }).join(' '); };
    GameBody.prototype.getPos = function (node) {
        // let withinPageContent = document.getElementById('page-content').contains(node); //ekmek sil
        // withinPageContent = true; //ekmek sil
        // let pos = withinPageContent ? this.getBoundingClientRectIgnoreZoom(node) : node.getBoundingClientRect(); 
        var pos = this.getBoundingClientRectIgnoreZoom(node);
        pos.w = pos.width;
        pos.h = pos.height;
        return pos;
    };
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
    GameBody.prototype.placeOnObject = function (mobileObj, targetObj) {
        mobileObj.style.left = '0px';
        mobileObj.style.top = '0px';
        // Get current positions
        var withinPageContent = document.getElementById('page-content').contains(mobileObj);
        var targetRect = withinPageContent ? this.getPos(targetObj) : targetObj.getBoundingClientRect();
        var mobileRect = this.getPos(mobileObj);
        // Calculate the difference in position
        var deltaX = targetRect.left - mobileRect.left;
        var deltaY = targetRect.top - mobileRect.top;
        // Get current position values
        var currentLeft = parseFloat(mobileObj.style.left || '0');
        var currentTop = parseFloat(mobileObj.style.top || '0');
        // Apply the position difference to current position
        mobileObj.style.left = (currentLeft + deltaX) + 'px';
        mobileObj.style.top = (currentTop + deltaY) + 'px';
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
    GameBody.prototype.hexToRgb = function (hex) { return hex.replace('#', '').match(/.{1,2}/g).map(function (x) { return parseInt(x, 16); }).join(','); };
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
    GameBody.prototype.getContentsRectangle = function (node, excludeClass) {
        if (excludeClass === void 0) { excludeClass = null; }
        var children = node.children;
        if (children.length === 0)
            return null; // No children, return coordinates (0,0)
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        for (var _i = 0, _a = Array.from(children); _i < _a.length; _i++) {
            var child = _a[_i];
            if (excludeClass && child.classList.contains(excludeClass))
                continue;
            // let rect = child.getBoundingClientRect(); //ekmek sil
            var rect = this.getPos(child); //ekmek uncomment
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        }
        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: maxX - minX, height: maxY - minY };
    };
    GameBody.prototype.printDebug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        args[0] = typeof args[0] == 'string' ? '*** ' + args[0] : args[0];
        console.log.apply(console, args);
    };
    //game specific utility functions
    GameBody.prototype.createCubeDiv = function (cube) {
        var cubeDiv = document.createElement('div');
        cubeDiv.className = 'a-cube';
        cubeDiv.innerHTML = '<div class="cube-background"></div><div class="top-side"></div><div class="right-side"></div><div class="bottom-side"></div>';
        cubeDiv.setAttribute('cube-id', cube.cube_id.toString());
        cubeDiv.setAttribute('color', cube.color.toString());
        cubeDiv.style.setProperty('--top-bg-x', (Math.random() * 100) + '%');
        cubeDiv.style.setProperty('--top-bg-y', (Math.random() * 100) + '%');
        cubeDiv.style.setProperty('--side-bg-x', (Math.random() * 100) + '%');
        cubeDiv.style.setProperty('--side-bg-y', (Math.random() * 100) + '%');
        cubeDiv.style.setProperty('--bottom-bg-x', (Math.random() * 100) + '%');
        cubeDiv.style.setProperty('--bottom-bg-y', (Math.random() * 100) + '%');
        // cubeDiv.style.setProperty('--cube-color', '#' + this.CUBE_COLORS[Number(cube.color)].colorCode); //ekmek sil
        return cubeDiv;
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
    GameBody.prototype.notif_cubePlacedInPyramid = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('notif_cubePlacedInPyramid');
                this.myself.pyramid.enableBuildPyramid(args.possible_moves);
                return [2 /*return*/];
            });
        });
    };
    GameBody.prototype.notif_undoneBuildPyramid = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('notif_undoneBuildPyramid');
                this.myself.pyramid.enableBuildPyramid(args.possible_moves);
                return [2 /*return*/];
            });
        });
    };
    GameBody.prototype.notif_confirmedBuildPyramid = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('notif_confirmedBuildPyramid');
                this.myself.pyramid.confirmedBuildPyramid();
                return [2 /*return*/];
            });
        });
    };
    GameBody.prototype.notif_displayBuiltCubes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_displayBuiltCubes');
                        return [4 /*yield*/, this.marketHandler.animateBuiltCubes(args.built_cubes)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameBody.prototype.notif_newCubesDrawn = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_newCubesDrawn');
                        return [4 /*yield*/, this.marketHandler.animateNewCubesDrawn(args.marketData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameBody.prototype.notif_swapTurnOrders = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_swapTurnOrders');
                        return [4 /*yield*/, this.marketHandler.animateSwapTurnOrders(args.swapData)];
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
        logHTML = "<div class=\"market-interaction-rows-wrapper\">".concat(logHTML, "</div>");
        return logHTML;
    };
    LogMutationObserver.prototype.createLogDisplayBuiltCubes = function (built_cubes) {
        var logHTML = '';
        var _loop_1 = function (playerID) {
            var cubesHTML = '';
            // Sort cubes by counting and ordering colors
            var colorCounts = built_cubes[playerID].reduce(function (counts, cube) {
                counts[cube.color] = (counts[cube.color] || 0) + 1;
                return counts;
            }, {});
            built_cubes[playerID].sort(function (a, b) {
                // First sort by color frequency (descending)
                var countDiff = colorCounts[b.color] - colorCounts[a.color];
                if (countDiff !== 0)
                    return countDiff;
                // If same frequency, sort by color value
                return Number(b.color) - Number(a.color);
            });
            for (var _i = 0, _a = built_cubes[playerID]; _i < _a.length; _i++) {
                var cube = _a[_i];
                cubesHTML += this_1.gameui.createCubeDiv(cube).outerHTML;
            }
            logHTML += "<div class=\"player-built-cubes-row\">\n            ".concat(this_1.gameui.divColoredPlayer(playerID, { class: 'playername' }, false), "\n            <i class=\"log-arrow log-place-cube-icon fa6 fa-download\"></i>\n            ").concat(cubesHTML, "\n            </div>");
        };
        var this_1 = this;
        for (var playerID in this.gameui.players) {
            _loop_1(playerID);
        }
        logHTML = "<div class=\"built-cubes-rows-wrapper\">".concat(logHTML, "</div>");
        return logHTML;
    };
    LogMutationObserver.prototype.createLogSwapTurnOrders = function (swapData) {
        var logHTML = "".concat(this.gameui.divColoredPlayer(swapData[0].player_id, { class: 'playername swapper-name' }, false), " \n        <div class=\"turn-order-container-wrapper\"><div class=\"turn-order-container\" turn-order=\"").concat(swapData[0].turn_order, "\"></div></div>\n        <i class=\"log-arrow log-arrow-exchange fa6 fa-exchange\"></i> \n        <div class=\"turn-order-container-wrapper\"><div class=\"turn-order-container\" turn-order=\"").concat(swapData[1].turn_order, "\"></div></div>\n        ").concat(this.gameui.divColoredPlayer(swapData[1].player_id, { class: 'playername swapper-name' }, false));
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
    function MarketHandler(gameui, marketData, bonusCardIDs, collectedMarketTilesData) {
        this.gameui = gameui;
        this.marketData = marketData;
        this.bonusCardIDs = bonusCardIDs;
        this.collectedMarketTilesData = collectedMarketTilesData;
        this.marketContainer = document.querySelector('#player-tables .market-container');
        this.marketTilesContainer = this.marketContainer.querySelector('.market-tiles-container');
        this.waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container');
        this.bonusCardIconsContainer = this.marketContainer.querySelector('.bonus-cards-container');
        this.marketTiles = [];
        this.initMarketContainer();
        this.initBonusCardContainer();
        this.updateStatusTextUponMarketTileSelection();
    }
    MarketHandler.prototype.initMarketContainer = function () {
        var _this = this;
        var playerSelectedMarketIndex = this.getMySelectedMarketIndex();
        Object.keys(this.gameui.players).forEach(function (_, i) {
            // First loop: Create Market Tiles
            _this.marketTiles[i] = document.createElement('div');
            _this.marketTiles[i].innerHTML = '<div class="cubes-container"></div>';
            _this.marketTiles[i].className = 'a-market-tile market-tile-' + i + ' ' + (_this.gameui.gamedatas.gamestate.name === 'allSelectMarketTile' && playerSelectedMarketIndex !== null && Number(playerSelectedMarketIndex) === i ? 'selected-market-tile' : '');
            _this.marketTiles[i].setAttribute('market-index', i.toString());
            _this.marketTiles[i].addEventListener('click', function (event) { return _this.marketTileClicked(event); });
            _this.marketTilesContainer.appendChild(_this.marketTiles[i]);
        });
        this.fillMarketTilesWithCubes();
        // Add player avatars to Market Tiles and show waiting players container if any players are pending
        if (this.collectedMarketTilesData.length > 0) {
            this.collectedMarketTilesData.sort(function (a, b) { return a.turn_order - b.turn_order; });
            this.collectedMarketTilesData.forEach(function (playerCollects) {
                var playerAvatar = _this.addPlayerAvatar(playerCollects, true);
                if (playerAvatar && playerCollects.type == 'pending')
                    _this.waitingPlayersContainer.style.opacity = '1';
            });
        }
    };
    MarketHandler.prototype.fillMarketTilesWithCubes = function () {
        var _this = this;
        var shuffledIndices = Array.from({ length: 60 }, function (_, i) { return i + 1; })
            .sort(function () { return Math.random() - 0.5; });
        this.marketTiles.forEach(function (tile, index) {
            tile.setAttribute('random-placement-index', shuffledIndices[index].toString());
        });
        var playerCollectedMarketIndex = this.getMyCollectedMarketIndex();
        Object.keys(this.marketData).forEach(function (_, marketIndex) {
            var tilesData = _this.marketData[marketIndex] || [];
            var cubesContainer = _this.marketTiles[marketIndex].querySelector('.cubes-container');
            for (var _i = 0, tilesData_1 = tilesData; _i < tilesData_1.length; _i++) {
                var cube = tilesData_1[_i];
                var cubeDiv = _this.gameui.createCubeDiv(cube);
                if (playerCollectedMarketIndex !== null && _this.gameui.myself && marketIndex == playerCollectedMarketIndex) {
                    var unplacedCube = _this.gameui.myself.pyramid.getUnplacedCube();
                    var cubesInConstruction = _this.gameui.myself.pyramid.getCubesInConstruction();
                    if (cube.cube_id === (unplacedCube === null || unplacedCube === void 0 ? void 0 : unplacedCube.cube_id))
                        cubeDiv.classList.add('selected-for-pyramid');
                    else if (parseInt(cube.cube_id) in cubesInConstruction)
                        cubeDiv.classList.add('built-in-pyramid');
                }
                cubesContainer.appendChild(cubeDiv);
            }
        });
    };
    MarketHandler.prototype.addSelectableClassToMarketTiles = function (possibleMarketIndexes) {
        var _this = this;
        this.marketTiles.forEach(function (tile) { return tile.classList.remove('selectable-market-tile'); });
        if (possibleMarketIndexes === 'none')
            return;
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
        if (!marketTile.classList.contains('a-market-tile'))
            return;
        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile' && !marketTile.classList.contains('selectable-market-tile'))
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
    };
    MarketHandler.prototype.marketTileSelected = function (marketIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedTile;
            return __generator(this, function (_a) {
                selectedTile = document.querySelector(".a-market-tile[market-index=\"".concat(marketIndex, "\"]"));
                this.marketContainer.querySelectorAll('.a-market-tile').forEach(function (tile) { return tile.classList.remove('selected-market-tile'); });
                if (selectedTile) {
                    this.setPlayerSelectedMarketIndex(marketIndex);
                    selectedTile.classList.add('selected-market-tile');
                    this.addSelectableClassToMarketTiles('none');
                }
                else {
                    this.setPlayerSelectedMarketIndex(null);
                    this.addSelectableClassToMarketTiles('all');
                }
                this.updateStatusTextUponMarketTileSelection();
                return [2 /*return*/];
            });
        });
    };
    MarketHandler.prototype.updateStatusTextUponMarketTileSelection = function () {
        if (this.gameui.gamedatas.gamestate.name != 'allSelectMarketTile')
            return;
        if (!this.gameui.myself)
            return;
        var statusText = '';
        var playerSelectedMarketIndex = this.getMySelectedMarketIndex();
        if (playerSelectedMarketIndex !== null) {
            var marketTileIcon = '<div class="a-market-tile-icon" market-index="' + playerSelectedMarketIndex + '"></div>';
            statusText = dojo.string.substitute(_('${you} selected ${marketTileIcon} Waiting for others'), { you: this.gameui.divYou(), marketTileIcon: marketTileIcon });
            statusText = '<span class="waiting-text">' + statusText + '</span>';
        }
        else {
            statusText = dojo.string.substitute(_('${you} must select a Market Tile'), { you: this.gameui.divYou() });
        }
        this.gameui.updateStatusText(statusText);
        if (playerSelectedMarketIndex)
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
                        //add player avatars first for correct positioning in animation
                        this.collectedMarketTilesData.forEach(function (playerCollects, animationOrder) { _this.addPlayerAvatar(playerCollects, false); });
                        this.collectedMarketTilesData.forEach(function (playerCollects, animationOrder) {
                            var avatarClone = _this.gameui.players[playerCollects.player_id].createAvatarClone();
                            avatarClone.style.transform = 'none';
                            var srcAvatar = _this.gameui.players[playerCollects.player_id].overallPlayerBoard.querySelector('img.avatar');
                            document.body.appendChild(avatarClone);
                            _this.gameui.placeOnObject(avatarClone, srcAvatar);
                            var currentTop = parseInt(window.getComputedStyle(avatarClone).top);
                            var destAvatar = _this.marketContainer.querySelector(".yaxha-player-avatar[player-id=\"".concat(playerCollects.player_id, "\"]"));
                            var destAvatarRect = destAvatar ? destAvatar.getBoundingClientRect() : { width: 0, height: 0 };
                            var destAvatarClone = avatarClone.cloneNode(true);
                            destAvatarClone.style.opacity = '0'; //ekmek uncomment
                            avatarClone.after(destAvatarClone);
                            _this.gameui.placeOnObject(destAvatarClone, destAvatar);
                            var raiseAvatarClone = _this.gameui.animationHandler.animateProperty({
                                node: avatarClone,
                                duration: 200,
                                delay: animationOrder * 100,
                                properties: { top: currentTop - 20, width: destAvatarRect.width, height: destAvatarRect.height },
                                easing: 'sineIn',
                            });
                            raiseAvatarAnimations.push(raiseAvatarClone);
                            var moveAvatarClone = _this.gameui.animationHandler.animateProperty({
                                node: avatarClone,
                                properties: { top: _this.gameui.remove_px(destAvatarClone.style.top), left: _this.gameui.remove_px(destAvatarClone.style.left) },
                                delay: (playerCollects.type == 'collecting') ? moveCollectingAvatarAnimations.length * 200 : movePendingAvatarAnimations.length * 200,
                                duration: 500,
                                easing: "cubic-bezier(".concat(0.1 + Math.random() * 0.2, ", ").concat(0.3 + Math.random() * 0.3, ", ").concat(0.5 + Math.random() * 0.3, ", ").concat(0.7 + Math.random() * 0.2, ")"),
                                onEnd: function () { destAvatar.style.opacity = null; avatarClone.remove(); destAvatarClone.remove(); }
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
            var playerIndex, destAvatar, pendingAvatar, pendingAvatarClone, shrinkPendingAvatar, movePendingAvatarClone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerIndex = this.collectedMarketTilesData.findIndex(function (data) { return Number(data.player_id) === Number(playerID); });
                        if (playerIndex === -1) {
                            console.error('Could not find player in collectedMarketTilesData');
                            return [2 /*return*/];
                        }
                        this.collectedMarketTilesData[playerIndex].type = 'collecting';
                        this.collectedMarketTilesData[playerIndex].collected_market_index = collectedMarketIndex;
                        destAvatar = this.addPlayerAvatar({ player_id: playerID, collected_market_index: collectedMarketIndex, type: 'collecting' }, false);
                        pendingAvatar = this.waitingPlayersContainer.querySelector(".yaxha-player-avatar.pending-player-avatar[player-id=\"".concat(playerID, "\"]"));
                        pendingAvatarClone = this.gameui.players[playerID].createAvatarClone(pendingAvatar.querySelector('img'));
                        this.marketContainer.appendChild(pendingAvatarClone);
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
                            onEnd: function () { destAvatar.style.opacity = null; pendingAvatarClone.remove(); }
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
    MarketHandler.prototype.animateBuiltCubes = function (built_cubes) {
        return __awaiter(this, void 0, void 0, function () {
            var cubeAnimArray, delay, _loop_2, this_2, marketIndex, cubeAnim, playerID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cubeAnimArray = [];
                        delay = 0;
                        _loop_2 = function (marketIndex) {
                            var playerID = (_a = this_2.collectedMarketTilesData.find(function (data) { return Number(data.collected_market_index) === Number(marketIndex); })) === null || _a === void 0 ? void 0 : _a.player_id;
                            if (!playerID || !built_cubes[playerID])
                                return "continue";
                            if (this_2.gameui.myself && this_2.gameui.myself.playerID == Number(playerID))
                                return "continue";
                            var player = this_2.gameui.players[playerID];
                            var playerCubesAnimation = player.pyramid.animatePlayerCubesToPyramid(built_cubes[playerID]);
                            playerCubesAnimation = playerCubesAnimation.addDelay(delay);
                            delay += 400;
                            cubeAnimArray.push(playerCubesAnimation);
                        };
                        this_2 = this;
                        for (marketIndex in this.marketTiles) {
                            _loop_2(marketIndex);
                        }
                        cubeAnim = this.gameui.animationHandler.combine(cubeAnimArray);
                        return [4 /*yield*/, cubeAnim.start()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.gameui.wait(300)];
                    case 2:
                        _b.sent();
                        for (playerID in this.gameui.players)
                            this.gameui.players[playerID].pyramid.saveAllCubesInPyramid();
                        return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.animateNewCubesDrawn = function (marketData) {
        return __awaiter(this, void 0, void 0, function () {
            var cubeAnimArray, delay, cubeAnim;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.removePlayerAvatarsFromMarketTiles();
                        this.marketTiles.forEach(function (marketTile) { marketTile.querySelector('.cubes-container').innerHTML = ''; });
                        this.marketData = marketData;
                        this.fillMarketTilesWithCubes();
                        cubeAnimArray = [];
                        delay = 0;
                        this.marketTiles.forEach(function (marketTile) {
                            marketTile.querySelectorAll('.a-cube').forEach(function (cube) {
                                cube.style.marginLeft = '-800px';
                                cube.style.marginTop = '-400px';
                                var cubeAnim = _this.gameui.animationHandler.animateProperty({
                                    node: cube,
                                    properties: { marginLeft: 0, marginTop: 0 },
                                    duration: 450 + Math.floor(Math.random() * 101),
                                    easing: 'sineOut',
                                    delay: delay + Math.floor(Math.random() * 51),
                                    onEnd: function () {
                                        cube.style.marginLeft = null;
                                        cube.style.marginTop = null;
                                    }
                                });
                                cubeAnimArray.push(cubeAnim);
                                delay += 40;
                            });
                            delay += 100;
                        });
                        cubeAnim = this.gameui.animationHandler.combine(cubeAnimArray);
                        return [4 /*yield*/, cubeAnim.start()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.animateSwapTurnOrders = function (swapData) {
        return __awaiter(this, void 0, void 0, function () {
            var swapperLeft, swapperRight, rect1, rect2, raiseAnimArray, lowerAnimArray, swapAnimation;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        swapperLeft = swapData[0], swapperRight = swapData[1];
                        rect1 = this.gameui.players[swapperLeft.player_id].pyramid.getPyramidContainerRect();
                        rect2 = this.gameui.players[swapperRight.player_id].pyramid.getPyramidContainerRect();
                        if (rect2.left < rect1.left || (rect2.left === rect1.left && rect2.top < rect1.top)) {
                            _a = [swapperRight, swapperLeft], swapperLeft = _a[0], swapperRight = _a[1];
                        }
                        this.gameui.players[swapperLeft.player_id].setTurnOrder(swapperRight.turn_order);
                        this.gameui.players[swapperRight.player_id].setTurnOrder(swapperLeft.turn_order);
                        raiseAnimArray = [];
                        lowerAnimArray = [];
                        [swapperLeft, swapperRight].forEach(function (swapper) {
                            var isLeft = swapper.player_id == swapperLeft.player_id;
                            var turnOrderContainer = _this.gameui.players[swapper.player_id].pyramid.getTurnOrderContainer();
                            var turnOrderClone = turnOrderContainer.cloneNode(true);
                            turnOrderClone.classList.add('animating-turn-order-container');
                            turnOrderContainer.style.opacity = '0';
                            turnOrderClone.style.position = 'fixed';
                            turnOrderContainer.style.transform = 'none'; //temporarily remove transform to get correct bounding client rect without rotation
                            var cardRect = turnOrderContainer.getBoundingClientRect();
                            turnOrderContainer.style.transform = null;
                            // const cardRect = this.gameui.getPos(turnOrderContainer);
                            // const cardStyle = window.getComputedStyle(turnOrderContainer); //ekmek sil
                            var cardWidth = cardRect.width;
                            var expandedCardWidth = cardWidth * 2;
                            turnOrderClone.style.width = cardWidth + 'px';
                            var otherPyramid = _this.gameui.players[isLeft ? swapperRight.player_id : swapperLeft.player_id].pyramid;
                            document.body.appendChild(turnOrderClone);
                            _this.gameui.placeOnObject(turnOrderClone, turnOrderContainer);
                            var targetRaised = document.createElement('div');
                            targetRaised.classList.add(isLeft ? 'left-turn-order-animation-target' : 'right-turn-order-animation-target');
                            document.body.appendChild(targetRaised);
                            raiseAnimArray.push(_this.gameui.animationHandler.animateProperty({
                                node: turnOrderClone,
                                properties: { width: expandedCardWidth, left: targetRaised.offsetLeft, top: targetRaised.offsetTop },
                                duration: 400,
                                delay: isLeft ? 0 : 600,
                                easing: 'easeInOut',
                                onEnd: function () { targetRaised.remove(); }
                            }));
                            var otherTurnOrderContainer = otherPyramid.getTurnOrderContainer();
                            var targetLowered = otherTurnOrderContainer.cloneNode(true);
                            targetLowered.classList.add('target-turn-order-container');
                            targetLowered.style.position = 'fixed';
                            targetLowered.style.width = cardWidth + 'px';
                            targetLowered.style.opacity = '0';
                            document.body.appendChild(targetLowered);
                            _this.gameui.placeOnObject(targetLowered, otherTurnOrderContainer);
                            lowerAnimArray.push(_this.gameui.animationHandler.animateProperty({
                                node: turnOrderClone,
                                properties: { width: cardWidth, top: targetLowered.offsetTop, left: targetLowered.offsetLeft },
                                duration: 350,
                                delay: isLeft ? 200 : 550,
                                easing: 'easeIn',
                                onEnd: function () { otherTurnOrderContainer.style.opacity = null; turnOrderClone.remove(); targetLowered.remove(); }
                            }));
                            turnOrderContainer.setAttribute('turn-order', isLeft ? swapperRight.turn_order.toString() : swapperLeft.turn_order.toString());
                        });
                        swapAnimation = this.gameui.animationHandler.chain([
                            this.gameui.animationHandler.combine(raiseAnimArray),
                            this.gameui.animationHandler.combine(lowerAnimArray)
                        ]);
                        return [4 /*yield*/, swapAnimation.start()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.addPlayerAvatar = function (playerCollects, isVisible) {
        if (!['pending', 'collecting'].includes(playerCollects.type))
            return null;
        var avatarClone = this.gameui.players[playerCollects.player_id].createAvatarClone();
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
    MarketHandler.prototype.removePlayerAvatarsFromMarketTiles = function () {
        var _this = this;
        this.marketTiles.forEach(function (tile) {
            tile.querySelectorAll('.yaxha-player-avatar.collecting-player-avatar').forEach(function (avatar) {
                _this.gameui.animationHandler.fadeOutAndDestroy(avatar);
            });
        });
    };
    MarketHandler.prototype.getPlayerCollectedMarketTile = function (player_id) {
        return this.collectedMarketTilesData.find(function (player) { return Number(player.player_id) === Number(player_id); });
    };
    MarketHandler.prototype.getPlayerCollectedMarketTileDiv = function (player_id) {
        return this.marketTiles[this.getPlayerCollectedMarketTile(player_id).collected_market_index];
    };
    MarketHandler.prototype.getMyMarketIndex = function (type) {
        if (!this.gameui.myself)
            return null;
        var marketTile = this.getPlayerCollectedMarketTile(this.gameui.myself.playerID);
        return marketTile ? (type == 'collected' ? marketTile.collected_market_index : marketTile.selected_market_index) : null;
    };
    MarketHandler.prototype.getMyCollectedMarketIndex = function () { return this.getMyMarketIndex('collected'); };
    MarketHandler.prototype.getMySelectedMarketIndex = function () { return this.getMyMarketIndex('selected'); };
    MarketHandler.prototype.setPlayerSelectedMarketIndex = function (marketIndex) {
        var _this = this;
        if (!this.gameui.myself)
            return null;
        var playerIndex = this.collectedMarketTilesData.findIndex(function (player) { return Number(player.player_id) === Number(_this.gameui.myself.playerID); });
        this.collectedMarketTilesData[playerIndex].selected_market_index = marketIndex;
    };
    MarketHandler.prototype.getCubesOfMarketTile = function (market_index) { return this.marketData[market_index]; };
    MarketHandler.prototype.getMarketTiles = function () { return this.marketTiles; };
    MarketHandler.prototype.setCollectedMarketTilesData = function (collectedMarketTilesData) { this.collectedMarketTilesData = collectedMarketTilesData; };
    MarketHandler.prototype.getBonusCardIconsContainer = function () { return this.bonusCardIconsContainer; };
    return MarketHandler;
}());
var PlayerHandler = /** @class */ (function () {
    // public collectedMarketTileIndex: number; //ekmek sil
    function PlayerHandler(gameui, playerID, playerName, playerColor, playerNo, turnOrder, pyramidData, built_cubes_this_round) {
        this.gameui = gameui;
        this.playerID = playerID;
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.playerNo = playerNo;
        this.turnOrder = turnOrder;
        this.built_cubes_this_round = built_cubes_this_round;
        this.overallPlayerBoard = $('overall_player_board_' + this.playerID);
        this.pyramid = new PyramidHandler(this.gameui, this, this.gameui.PYRAMID_MAX_SIZE, pyramidData);
    }
    PlayerHandler.prototype.createAvatarClone = function (srcAvatar) {
        if (srcAvatar === void 0) { srcAvatar = null; }
        if (!srcAvatar)
            srcAvatar = this.overallPlayerBoard.querySelector('img.avatar');
        var get184by184 = true;
        if (srcAvatar) {
            // Get dimensions and source from original avatar
            var withinPageContent = document.getElementById('page-content').contains(srcAvatar);
            // withinPageContent = true; //ekmek sil
            var avatarRect = withinPageContent ? this.gameui.getPos(srcAvatar) : srcAvatar.getBoundingClientRect();
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
            return avatarClone;
        }
        else {
            console.error('avatar not found, playerID:', this.playerID);
            return null;
        }
    };
    PlayerHandler.prototype.getPlayerName = function () { return this.playerName; };
    PlayerHandler.prototype.getTurnOrder = function () { return this.turnOrder; };
    PlayerHandler.prototype.getCollectedMarketTileData = function () {
        return this.gameui.marketHandler.getPlayerCollectedMarketTile(this.playerID);
    };
    PlayerHandler.prototype.setTurnOrder = function (turnOrder) { this.turnOrder = turnOrder; };
    return PlayerHandler;
}());
var PyramidHandler = /** @class */ (function () {
    function PyramidHandler(gameui, owner, PYRAMID_MAX_SIZE, pyramidData) {
        this.gameui = gameui;
        this.owner = owner;
        this.PYRAMID_MAX_SIZE = PYRAMID_MAX_SIZE;
        this.pyramidData = pyramidData;
        this.possibleMoves = []; //ekmek define type
        // public collectedMarketTileIndex: number; //ekmek sil
        this.rollingCubeColorIndex = 0;
        this.availableColors = [];
        this.cubesInConstruction = {};
        this.initPyramidContainer();
    }
    PyramidHandler.prototype.initPyramidContainer = function () {
        var _this = this;
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.owner.playerID;
        this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.owner.playerID.toString());
        // Set the custom property for player color
        this.pyramidContainer.style.setProperty('--player-color', '#' + this.owner.playerColor);
        this.pyramidContainer.style.setProperty('--player-color-hex', this.gameui.hexToRgb(this.owner.playerColor));
        var turnOrderContainerId = "turn-order-".concat(this.owner.playerID);
        this.pyramidContainer.innerHTML = "\n\t\t\t<div class=\"player-name-text\">\n\t\t\t\t<div class=\"text-container\">".concat(this.owner.getPlayerName(), "</div>\n\t\t\t</div>\n\t\t\t<div class=\"turn-order-container\" id=\"").concat(turnOrderContainerId, "\" turn-order=\"").concat(this.owner.getTurnOrder(), "\"></div>\n            <div class=\"cubes-container\"></div>\n        ");
        document.getElementById('player-tables').querySelector('.pyramids-container').insertAdjacentElement(Number(this.owner.playerID) === Number(this.gameui.player_id) ? 'afterbegin' : 'beforeend', this.pyramidContainer);
        this.cubesContainer = this.pyramidContainer.querySelector('.cubes-container');
        // Create cubes from pyramid data
        var maxOrderCubeInConstruction = null;
        this.pyramidData.forEach(function (cube) {
            cube.div = _this.gameui.createCubeDiv(cube);
            cube.div.setAttribute('pos-x', cube.pos_x.toString());
            cube.div.setAttribute('pos-y', cube.pos_y.toString());
            cube.div.setAttribute('pos-z', cube.pos_z.toString());
            _this.cubesContainer.appendChild(cube.div);
            if (cube.order_in_construction) {
                _this.cubesInConstruction[cube.cube_id] = cube;
                if (!maxOrderCubeInConstruction || cube.order_in_construction > maxOrderCubeInConstruction.order_in_construction) {
                    maxOrderCubeInConstruction = cube;
                }
            }
        });
        if (!this.owner.built_cubes_this_round && maxOrderCubeInConstruction)
            this.unplacedCube = maxOrderCubeInConstruction;
        this.arrangeCubesZIndex();
        // setTimeout(() => { this.centerCubesContainer(false); }, 100);
        this.centerCubesContainer(false); //ekmek dene
    };
    PyramidHandler.prototype.enableBuildPyramid = function (possibleMoves) {
        this.updatePyramidStatusText();
        if (this.owner.built_cubes_this_round)
            return;
        this.possibleMoves = possibleMoves;
        this.pyramidContainer.setAttribute('build-pyramid-enabled', 'true');
        this.calcAvailableColors();
        this.drawSnapPoints();
        this.centerCubesContainer(false);
        this.displaySwitchColorButton();
    };
    PyramidHandler.prototype.disableBuildPyramid = function () {
        this.pyramidContainer.removeAttribute('build-pyramid-enabled');
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(function (el) { return el.remove(); });
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        this.centerCubesContainer();
        this.updatePyramidStatusText();
    };
    PyramidHandler.prototype.onSnapPointClicked = function (args, doNotify) {
        var _this = this;
        if (doNotify === void 0) { doNotify = true; }
        //ekmek doNotify gerekli mi?
        var myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if (!myPyramid)
            return;
        var lastBuiltCube = this.unplacedCube;
        if (this.unplacedCube) { //save the last built cube
            var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            marketTile.querySelectorAll('.a-cube').forEach(function (cube) {
                cube.classList.remove('selected-for-pyramid');
                if (cube.getAttribute('cube-id') === _this.unplacedCube.cube_id)
                    cube.classList.add('built-in-pyramid');
            });
            this.unplacedCube = null;
            this.rollingCubeColorIndex = 0;
            this.calcAvailableColors();
        }
        var posX, posY, posZ;
        // if(Array.isArray(args)){ //ekmek sil? gerekli mi?
        //     posX = args[0];
        //     posY = args[1];
        //     posZ = args[2];
        // } else {
        posX = Number(args.target.getAttribute('pos-x'));
        posY = Number(args.target.getAttribute('pos-y'));
        posZ = Number(args.target.getAttribute('pos-z'));
        // }
        var marketCubeData = this.getCurrentUnplacedMarketCube();
        var moveType = marketCubeData ? 'from_market' : 'from_last_built';
        var cubeData;
        if (moveType == 'from_market') {
            cubeData = {
                pos_x: posX,
                pos_y: posY,
                pos_z: posZ,
                color: marketCubeData.color,
                cube_id: marketCubeData.cube_id,
                order_in_construction: Object.keys(this.cubesInConstruction).length + 1,
                div: null
            };
        }
        else {
            cubeData = lastBuiltCube;
            cubeData.pos_x = posX;
            cubeData.pos_y = posY;
            cubeData.pos_z = posZ;
        }
        this.cubesInConstruction[cubeData.cube_id] = cubeData; //ekmek buildleme bitince resetle
        this.animateUnplacedCubeToPyramid(cubeData, moveType);
        if (doNotify) //ekmek gerekli mi?
            this.notifyCubeMovedOnGrid();
    };
    PyramidHandler.prototype.drawSnapPoints = function () {
        var _this = this;
        var myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if (!myPyramid)
            return;
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(function (el) { return el.classList.add('to-remove'); });
        this.possibleMoves.forEach(function (pos) {
            var existingSnapPoint = Array.from(_this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point')).find(function (el) {
                return el.getAttribute('pos-x') === pos[0].toString() &&
                    el.getAttribute('pos-y') === pos[1].toString() &&
                    el.getAttribute('pos-z') === pos[2].toString();
            });
            if (existingSnapPoint) {
                existingSnapPoint.classList.remove('to-remove');
                return;
            }
            var snapPoint = document.createElement('div');
            snapPoint.className = 'pyramid-cube-snap-point';
            snapPoint.setAttribute('pos-x', pos[0].toString());
            snapPoint.setAttribute('pos-y', pos[1].toString());
            snapPoint.setAttribute('pos-z', pos[2].toString());
            _this.cubesContainer.appendChild(snapPoint);
            snapPoint.addEventListener('click', function (args) { return _this.onSnapPointClicked(args); });
            _this.gameui.animationHandler.animateProperty({ node: snapPoint, properties: { opacity: 1 }, duration: 300 }).play();
        });
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point.to-remove').forEach(function (el) { return el.remove(); });
    };
    PyramidHandler.prototype.updatePyramidStatusText = function () {
        var _this = this;
        var _a, _b;
        var statusText = null;
        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile') {
            if (this.owner.built_cubes_this_round)
                statusText = dojo.string.substitute(_('${actplayer} must select an available Market Tile'), { actplayer: this.gameui.divActivePlayer() });
            else {
                statusText = dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), { you: this.gameui.divYou() });
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = statusText;
                document.title = '◣' + tempDiv.innerText;
            }
        }
        else if (this.gameui.gamedatas.gamestate.name === 'buildPyramid') {
            if (this.owner.built_cubes_this_round)
                statusText = dojo.string.substitute(_('Waiting for other players to build Pyramids'), { you: this.gameui.divYou() });
            else
                statusText = dojo.string.substitute(_('${you} need to build your Pyramid'), { you: this.gameui.divYou() });
        }
        if (!statusText)
            return;
        var showConfirmButton = !this.owner.built_cubes_this_round && Object.keys(this.cubesInConstruction).length == this.gameui.CUBES_PER_MARKET_TILE; //ekmek test
        var showUndoButton = Object.keys(this.cubesInConstruction).length > 0;
        if (showConfirmButton || showUndoButton) {
            var buttonHTML = '';
            if (showConfirmButton) {
                var cubeIconsHTML = '';
                var sortedCubes = Object.values(this.cubesInConstruction).sort(function (a, b) { return a.order_in_construction - b.order_in_construction; });
                for (var _i = 0, sortedCubes_1 = sortedCubes; _i < sortedCubes_1.length; _i++) {
                    var cube = sortedCubes_1[_i];
                    cubeIconsHTML += this.gameui.createCubeDiv(cube).outerHTML;
                }
                cubeIconsHTML = '<div class="cube-wrapper">' + cubeIconsHTML + '</div>';
                statusText = dojo.string.substitute(_('Place${cubeIcons}'), { cubeIcons: cubeIconsHTML });
                buttonHTML += '<a class="confirm-place-cube-button bgabutton bgabutton_blue">' + _('Confirm') + '</a>';
            }
            if (showUndoButton)
                buttonHTML += '<a class="undo-place-cube-button bgabutton bgabutton_gray">' + _('Undo Build') + '</a>';
            statusText += buttonHTML;
        }
        this.gameui.updateStatusText(statusText);
        (_a = document.querySelector('#page-title .confirm-place-cube-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () { return _this.confirmPlaceCubeButtonClicked(); });
        (_b = document.querySelector('#page-title .undo-place-cube-button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () { return _this.undoPlaceCubeButtonClicked(); });
    };
    PyramidHandler.prototype.animateUnplacedCubeToPyramid = function (cubeData, moveType) {
        var _this = this;
        this.centerCubesContainer(false);
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        this.unplacedCube = cubeData;
        var animSpeed = 400;
        if (!this.unplacedCube.div) { //search Market Tiles
            var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            var marketCubeDiv = marketTile.querySelector(".a-cube[cube-id=\"".concat(cubeData.cube_id, "\"]"));
            this.unplacedCube.div = marketCubeDiv.cloneNode(true);
            this.cubesContainer.appendChild(this.unplacedCube.div);
            marketCubeDiv.classList.add('selected-for-pyramid');
            this.gameui.placeOnObject(this.unplacedCube.div, marketCubeDiv);
            animSpeed = 600;
        }
        if (this.cubeAnim)
            this.cubeAnim.stop();
        var goTo = this.cubesContainer.querySelector(".pyramid-cube-snap-point[pos-x=\"".concat(this.unplacedCube.pos_x, "\"][pos-y=\"").concat(this.unplacedCube.pos_y, "\"][pos-z=\"").concat(this.unplacedCube.pos_z, "\"]"));
        this.cubeAnim = this.gameui.animationHandler.animateOnObject({
            node: this.unplacedCube.div,
            goTo: goTo,
            duration: animSpeed,
            onBegin: function () {
                _this.unplacedCube.div.classList.add('animating-cube');
            },
            onEnd: function () {
                // this.container.style.zIndex = null; //ekmek sil
                _this.unplacedCube.div.classList.remove('animating-cube'); //ekmek sil? baska yerde kullanmadiysan
                _this.unplacedCube.div.setAttribute('pos-x', _this.unplacedCube.pos_x.toString());
                _this.unplacedCube.div.setAttribute('pos-y', _this.unplacedCube.pos_y.toString());
                _this.unplacedCube.div.setAttribute('pos-z', _this.unplacedCube.pos_z.toString());
                _this.cubeAnim = null;
                _this.arrangeCubesZIndex();
                _this.updatePyramidStatusText();
                _this.gameui.ajaxAction(moveType == 'from_market' ? 'actAddCubeToPyramid' : 'actMoveCubeInPyramid', { cube_id: _this.unplacedCube.cube_id, pos_x: _this.unplacedCube.pos_x, pos_y: _this.unplacedCube.pos_y, pos_z: _this.unplacedCube.pos_z }, false, false);
            }
        });
        this.cubeAnim.start();
    };
    PyramidHandler.prototype.animatePlayerCubesToPyramid = function (cubeMoves) {
        var _this = this;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var animSpeed = 600;
        var cubeAnimArray = [];
        var collectingAvatar = marketTile.querySelector('.yaxha-player-avatar.collecting-player-avatar');
        if (collectingAvatar) {
            var fadeOutAvatar = this.gameui.animationHandler.animateProperty({
                node: collectingAvatar,
                properties: { opacity: 0 },
                duration: 200,
                onEnd: function () {
                    collectingAvatar.remove();
                }
            });
            cubeAnimArray.push(fadeOutAvatar);
        }
        // Clone and position market cubes before animation to prevent visual glitches on removal
        marketTile.querySelectorAll('.a-cube').forEach(function (cube) {
            var cubeStyle = window.getComputedStyle(cube);
            cube.style.top = cubeStyle.top;
            cube.style.left = cubeStyle.left;
        });
        var _loop_3 = function (move) {
            var marketCubeDiv = marketTile.querySelector(".a-cube[cube-id=\"".concat(move.cube_id, "\"]"));
            if (!marketCubeDiv)
                return "continue";
            marketCubeDiv.setAttribute('pos-x', move.pos_x.toString());
            marketCubeDiv.setAttribute('pos-y', move.pos_y.toString());
            marketCubeDiv.setAttribute('pos-z', move.pos_z.toString());
            var pyramidCubeDiv = marketCubeDiv.cloneNode(true);
            pyramidCubeDiv.style.opacity = '0';
            pyramidCubeDiv.style.top = null;
            pyramidCubeDiv.style.left = null;
            this_3.cubesContainer.appendChild(pyramidCubeDiv);
            marketCubeDiv = this_3.gameui.attachToNewParent(marketCubeDiv, this_3.cubesContainer);
            var cubeData = {
                cube_id: move.cube_id,
                pos_x: move.pos_x,
                pos_y: move.pos_y,
                pos_z: move.pos_z,
                color: move.color,
                order_in_construction: null,
                div: pyramidCubeDiv
            };
            this_3.pyramidData.push(cubeData);
            var builtCubeAnim = this_3.gameui.animationHandler.animateOnObject({
                node: marketCubeDiv,
                goTo: pyramidCubeDiv,
                duration: animSpeed + Math.floor(Math.random() * 101) - 50,
                easing: 'circleOut',
                delay: Math.floor(Math.random() * 51),
                onEnd: function () {
                    marketCubeDiv.remove();
                    pyramidCubeDiv.style.opacity = '1';
                }
            });
            cubeAnimArray.push(builtCubeAnim);
        };
        var this_3 = this;
        for (var _i = 0, cubeMoves_1 = cubeMoves; _i < cubeMoves_1.length; _i++) {
            var move = cubeMoves_1[_i];
            _loop_3(move);
        }
        this.arrangeCubesZIndex();
        var cubeAnim = this.gameui.animationHandler.combine(cubeAnimArray);
        cubeAnim.onEnd = function () { _this.arrangeCubesZIndex(); };
        return cubeAnim;
    };
    PyramidHandler.prototype.saveAllCubesInPyramid = function () {
        for (var i = 0; i < this.pyramidData.length; i++)
            this.pyramidData[i].order_in_construction = null;
        this.unplacedCube = null;
        this.cubesInConstruction = {};
        this.owner.built_cubes_this_round = false;
    };
    PyramidHandler.prototype.confirmPlaceCubeButtonClicked = function () {
        this.gameui.ajaxAction('actConfirmBuildPyramid', {}, true, false);
    };
    PyramidHandler.prototype.confirmedBuildPyramid = function () {
        this.owner.built_cubes_this_round = true;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(function (element) {
            element.classList.remove('selected-for-pyramid');
            element.classList.add('built-in-pyramid');
        });
        this.disableBuildPyramid();
    };
    PyramidHandler.prototype.undoPlaceCubeButtonClicked = function () {
        var _this = this;
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); }); //ekmek sil
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var undoAnimArray = [];
        // Get all cubes in construction and animate them back to their market positions
        Object.values(this.cubesInConstruction).forEach(function (cube) {
            var goTo = marketTile.querySelector(".a-cube[cube-id=\"".concat(cube.cube_id, "\"]"));
            if (!goTo)
                return;
            undoAnimArray.push(_this.gameui.animationHandler.animateOnObject({
                node: cube.div,
                goTo: goTo,
                duration: 500,
                onBegin: function () {
                    cube.div.classList.add('animating-cube');
                },
                onEnd: function () {
                    cube.div.remove();
                    goTo.classList.remove('selected-for-pyramid', 'built-in-pyramid');
                }
            }));
        });
        this.cubesInConstruction = {};
        this.unplacedCube = null;
        this.owner.built_cubes_this_round = false;
        var undoAnim = this.gameui.animationHandler.combine(undoAnimArray);
        undoAnim.onEnd = function () {
            _this.calcAvailableColors();
            _this.rollingCubeColorIndex = 0;
            _this.centerCubesContainer();
            _this.updatePyramidStatusText();
            _this.gameui.ajaxAction('actUndoBuildPyramid', {}, true, false);
        };
        undoAnim.start();
    };
    PyramidHandler.prototype.centerCubesContainer = function (doAnimate) {
        if (doAnimate === void 0) { doAnimate = true; }
        var contentsRect = this.gameui.getContentsRectangle(this.cubesContainer, 'animating-cube');
        if (!contentsRect)
            return;
        var centerPointDiv = document.createElement('div');
        centerPointDiv.style.width = '1px';
        centerPointDiv.style.height = '1px';
        this.cubesContainer.appendChild(centerPointDiv);
        var centerPoint = this.gameui.getPos(centerPointDiv);
        var midPointX = (contentsRect.maxX + contentsRect.minX) / 2;
        var midPointY = (contentsRect.maxY + contentsRect.minY) / 2;
        var offsetX = centerPoint.x - midPointX;
        var offsetY = centerPoint.y - midPointY;
        if (this.centerTilesAnim)
            this.centerTilesAnim.stop();
        if (doAnimate) {
            this.centerTilesAnim = this.gameui.animationHandler.animateProperty({
                node: this.cubesContainer,
                duration: 400, //make animation 1 sec faster so the clicks near the end also work
                properties: { marginLeft: offsetX, marginTop: offsetY }
            }).play();
        }
        else {
            this.cubesContainer.style.marginLeft = offsetX + 'px';
            this.cubesContainer.style.marginTop = offsetY + 'px';
        }
    };
    PyramidHandler.prototype.arrangeCubesZIndex = function () {
        var cubes = Array.from(this.cubesContainer.querySelectorAll('.a-cube'));
        cubes.sort(function (a, b) {
            var posXA = parseInt(a.getAttribute("pos-x"));
            var posYA = parseInt(a.getAttribute("pos-y"));
            var posZA = parseInt(a.getAttribute("pos-z"));
            var posXB = parseInt(b.getAttribute("pos-x"));
            var posYB = parseInt(b.getAttribute("pos-y"));
            var posZB = parseInt(b.getAttribute("pos-z"));
            if (posZA !== posZB)
                return posZA - posZB;
            if (posXA !== posXB)
                return posXA - posXB;
            return posYB - posYA;
        });
        cubes.forEach(function (cube, index) { cube.style.zIndex = (index + 1).toString(); });
    };
    PyramidHandler.prototype.displaySwitchColorButton = function () {
        var _this = this;
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        if (!this.unplacedCube)
            return;
        this.calcAvailableColors();
        if (this.availableColors.length <= 1)
            return;
        this.rollingCubeColorIndex = this.availableColors.indexOf(this.unplacedCube.color);
        var switchColorButton = document.createElement('div');
        switchColorButton.innerHTML = "<div class=\"switch-color-button\" pos-x=\"".concat(this.unplacedCube.pos_x, "\" pos-y=\"").concat(this.unplacedCube.pos_y, "\" pos-z=\"").concat(this.unplacedCube.pos_z, "\"><i class=\"fa6 fa6-exchange switch-color-icon\"></i></div>");
        switchColorButton = switchColorButton.firstElementChild;
        this.cubesContainer.appendChild(switchColorButton);
        switchColorButton.style.opacity = '0.82';
        switchColorButton.addEventListener('click', function () { return _this.onSwitchColorButtonClicked(); });
    };
    PyramidHandler.prototype.getCurrentUnplacedMarketCube = function () { return this.getNextUnplacedMarketCube(0); };
    PyramidHandler.prototype.getNextUnplacedMarketCube = function (offset) {
        if (offset === void 0) { offset = 1; }
        this.rollingCubeColorIndex = (this.rollingCubeColorIndex + offset) % this.availableColors.length;
        var nextColor = this.availableColors[this.rollingCubeColorIndex];
        var collectedMarketTileIndex = this.owner.getCollectedMarketTileData().collected_market_index;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var nextCubeDiv = Array.from(marketTile.querySelectorAll('.a-cube')).find(function (cube) {
            return !cube.classList.contains('selected-for-pyramid') &&
                !cube.classList.contains('built-in-pyramid') &&
                cube.getAttribute('color') === nextColor;
        });
        if (!nextCubeDiv)
            return null;
        var cubeID = nextCubeDiv.getAttribute('cube-id');
        var cubeData = this.gameui.marketHandler.getCubesOfMarketTile(collectedMarketTileIndex).find(function (cube) { return cube.cube_id === cubeID; });
        return cubeData;
    };
    PyramidHandler.prototype.calcAvailableColors = function () {
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var availableCubes = Array.from(marketTile.querySelectorAll('.a-cube:not(.built-in-pyramid)'));
        var availableColorsDict = {};
        availableCubes.forEach(function (cube) {
            var cubeColor = cube.getAttribute('color');
            availableColorsDict[cubeColor] = 1;
        });
        if (this.unplacedCube) //also add unplaced cube color to available colors
            availableColorsDict[this.unplacedCube.color] = 1;
        this.availableColors = Object.keys(availableColorsDict);
    };
    PyramidHandler.prototype.onSwitchColorButtonClicked = function () {
        var myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if (!myPyramid)
            return;
        var nextCubeData = this.getNextUnplacedMarketCube();
        delete this.cubesInConstruction[this.unplacedCube.cube_id];
        this.unplacedCube.cube_id = nextCubeData.cube_id;
        this.unplacedCube.color = nextCubeData.color;
        this.unplacedCube.div.setAttribute('color', nextCubeData.color);
        this.unplacedCube.div.setAttribute('cube-id', nextCubeData.cube_id);
        this.cubesInConstruction[nextCubeData.cube_id] = this.unplacedCube;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(function (cube) {
            if (cube.getAttribute('cube-id') === nextCubeData.cube_id)
                cube.classList.add('selected-for-pyramid');
            else
                cube.classList.remove('selected-for-pyramid');
        });
        this.gameui.ajaxAction('actPyramidCubeColorSwitched', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
    };
    PyramidHandler.prototype.notifyCubeMovedOnGrid = function () {
        console.log('notifyCubeMovedOnGrid');
    };
    PyramidHandler.prototype.getUnplacedCube = function () { return this.unplacedCube; };
    PyramidHandler.prototype.getCubesInConstruction = function () { return this.cubesInConstruction; };
    PyramidHandler.prototype.getPyramidContainerRect = function () { return this.gameui.getPos(this.pyramidContainer); };
    PyramidHandler.prototype.getTurnOrderContainer = function () { return this.pyramidContainer.querySelector('.turn-order-container'); };
    PyramidHandler.prototype.getPyramidContainer = function () { return this.pyramidContainer; };
    return PyramidHandler;
}());
var TooltipHandler = /** @class */ (function () {
    function TooltipHandler(gameui) {
        this.gameui = gameui;
        this.addTooltipToBonusCards();
        this.addTooltipToTurnOrder();
    }
    TooltipHandler.prototype.addTooltipToBonusCards = function () {
        var _this = this;
        var bonusCardIcons = this.gameui.marketHandler.getBonusCardIconsContainer().querySelectorAll('.a-bonus-card-icon');
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
            _this.gameui.addTooltipHtml(containerId, "<div class=\"turn-order-tooltip tooltip-wrapper\">\n                    <div class=\"tooltip-text\">".concat(_('${player}\'s turn order is ${order}').replace('${player}', playerDiv).replace('${order}', '<b>' + turnOrder.toString() + '</b>'), "</div>\n                </div>"), 400);
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
