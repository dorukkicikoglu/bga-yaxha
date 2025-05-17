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
var EndGameScoringHandler = /** @class */ (function () {
    function EndGameScoringHandler(gameui) {
        this.gameui = gameui;
        this.bodyClickHandler = null;
    }
    EndGameScoringHandler.prototype.displayEndGameScore = function (endGameScoring) {
        return __awaiter(this, void 0, void 0, function () {
            var instantFadeIn, anim;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.endGameScoring = endGameScoring;
                        if (this.scoreContainer) {
                            console.error('end-game-score-container already exists');
                            return [2 /*return*/];
                        }
                        this.endGameScoring.player_scores = endGameScoring.player_scores;
                        this.winner_ids = endGameScoring.winner_ids;
                        (_a = document.getElementById('end-game-score-container')) === null || _a === void 0 ? void 0 : _a.remove();
                        this.scoreContainer = document.createElement('div');
                        this.scoreContainer.classList.add('end-game-score-container');
                        this.scoreContainer.style.opacity = '0';
                        this.scoreContainer.innerHTML = "\n            <div class=\"show-table-button\" style=\"display: none;\">\n                <i class=\"fa6 fa6-ranking-star\"></i>\n            </div> \n            <div class=\"maximized-content\"> \n                <i class=\"fa6 fa6-chevron-circle-left collapse-table-button\" title=\"".concat(_('Collapse Scoreboard'), "\"></i>\n                <table>\n                    <thead></thead>\n                    <tbody></tbody>\n                </table>\n                <div class=\"fast-forward-text\"></div> \n            </div>\n        ");
                        (_b = document.getElementById('player-tables')) === null || _b === void 0 ? void 0 : _b.appendChild(this.scoreContainer);
                        this.table = this.scoreContainer.querySelector('table');
                        this.thead = this.scoreContainer.querySelector('thead');
                        this.tbody = this.scoreContainer.querySelector('tbody');
                        this.showButton = this.scoreContainer.querySelector('.show-table-button');
                        this.hideButton = this.scoreContainer.querySelector('.collapse-table-button');
                        this.fastForwardButton = this.scoreContainer.querySelector('.fast-forward-text');
                        this.fillTable();
                        this.bindShowHideButtons();
                        this.fastForwardButton.innerHTML = '* ' + _(this.gameui.clickOrTap(true) + ' anywhere to fast forward');
                        instantFadeIn = this.gameui.gamedatas.gamestate.name === 'gameEnd';
                        anim = this.gameui.animationHandler.animateProperty({
                            node: this.scoreContainer,
                            properties: { opacity: 1 },
                            duration: instantFadeIn ? 0 : 1000,
                            delay: instantFadeIn ? 0 : 100,
                            onEnd: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.scoreContainer.style.opacity = null;
                                    this.bindBodyScroll();
                                    return [2 /*return*/];
                                });
                            }); }
                        });
                        return [4 /*yield*/, anim.start()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.fadeInNextCell()];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EndGameScoringHandler.prototype.fillTable = function () {
        // Create header row with player names
        var headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th class="corner-no-border-cell"></th>'; // Empty corner cell
        // Add player name columns
        for (var _i = 0, _a = this.gameui.playerSeatOrder; _i < _a.length; _i++) {
            var player_id = _a[_i];
            var playerNameDiv = this.gameui.divColoredPlayer(player_id, {}, false);
            headerRow.innerHTML += "<th class=\"player-name-cell\" player-id=\"".concat(player_id, "\">").concat(playerNameDiv, "</th>");
        }
        this.thead.appendChild(headerRow);
        // Create rows for each score type
        var scoreTypes = [];
        for (var colorIndex in this.gameui.CUBE_COLORS)
            scoreTypes.push({ index: colorIndex, type: 'color' });
        var firstPlayerScore = this.endGameScoring.player_scores[Object.keys(this.endGameScoring.player_scores)[0]];
        for (var _b = 0, _c = firstPlayerScore.bonus_card_points; _b < _c.length; _b++) {
            var bonusCard = _c[_b];
            scoreTypes.push({ index: bonusCard.bonus_card_id, type: 'bonus' });
        }
        scoreTypes.push({ index: 0, type: 'total' });
        var _loop_1 = function (i) {
            var row = document.createElement('tr');
            var scoreType = scoreTypes[i];
            var scoreTypeIconHTML = void 0;
            if (scoreType.type === 'color')
                scoreTypeIconHTML = this_1.gameui.createCubeDiv({ color: scoreType.index, cube_id: 'score-sheet-cube' }).outerHTML;
            else if (scoreType.type === 'bonus')
                scoreTypeIconHTML = "<div class=\"a-bonus-card-icon-wrapper\"><div class=\"a-bonus-card-icon\" bonus-card-id=\"".concat(scoreType.index, "\" id=\"score-sheet-bonus-card-").concat(scoreType.index, "\"></div></div>");
            else
                scoreTypeIconHTML = "<i class=\"fa fa-star total-icon\"></i>";
            row.innerHTML = "<td class=\"score-type-icon-cell\"><div class=\"score-type-icon ".concat(scoreType.type, "-").concat(scoreType.index, "\">").concat(scoreTypeIconHTML, "</div></td>");
            for (var _d = 0, _e = this_1.gameui.playerSeatOrder; _d < _e.length; _d++) {
                var player_id = _e[_d];
                var playerScore = this_1.endGameScoring.player_scores[player_id];
                var cellScore = scoreTypes[i].type === 'color' ?
                    playerScore.color_points[scoreType.index] :
                    (scoreTypes[i].type === 'bonus' ? playerScore.bonus_card_points.find(function (item) { return item.bonus_card_id === scoreType.index; }).bonus_card_points : playerScore.total);
                row.innerHTML += "<td><div class=\"cell-text cell-".concat(scoreType.type, "\" style=\"opacity: 0;\" row-index=\"").concat(i, "\" player-id=\"").concat(player_id, "\">").concat(cellScore, "</div></td>");
            }
            this_1.tbody.appendChild(row);
        };
        var this_1 = this;
        // Add score rows
        for (var i = 0; i < scoreTypes.length; i++) {
            _loop_1(i);
        }
        this.gameui.tooltipHandler.addTooltipToBonusCards('scoreSheet');
    };
    EndGameScoringHandler.prototype.bindShowHideButtons = function () {
        var _this = this;
        this.hideButton.addEventListener('click', function () {
            _this.hideButton.style.display = 'none';
            _this.scoreContainer.querySelectorAll('.maximized-content').forEach(function (node) { node.style.display = 'none'; });
            _this.showButton.style.display = null;
        });
        this.showButton.addEventListener('click', function () {
            _this.hideButton.style.display = null;
            _this.scoreContainer.querySelectorAll('.maximized-content').forEach(function (node) { node.style.display = null; });
            _this.showButton.style.display = 'none';
        });
    };
    EndGameScoringHandler.prototype.bindBodyScroll = function () {
        var _this = this;
        var fadeInTimeout = null;
        var scrollFadeAnim = false;
        var ANIM_STATE = { still: 1, fadingIn: 2, fadingOut: 3 };
        var animStatus = ANIM_STATE.still;
        // Bind scroll event listener to the body
        window.addEventListener('scroll', function () {
            clearTimeout(fadeInTimeout);
            fadeInTimeout = setTimeout(function () {
                if (scrollFadeAnim)
                    scrollFadeAnim.stop();
                animStatus = ANIM_STATE.fadingIn;
                scrollFadeAnim = _this.gameui.animationHandler.animateProperty({
                    node: _this.scoreContainer,
                    duration: 300,
                    properties: { opacity: 1 },
                    onEnd: function () { animStatus = ANIM_STATE.still; }
                });
                scrollFadeAnim.start();
            }, 100);
            if (animStatus === ANIM_STATE.fadingOut)
                return;
            if (animStatus === ANIM_STATE.fadingIn && scrollFadeAnim)
                scrollFadeAnim.stop();
            animStatus = ANIM_STATE.fadingOut;
            scrollFadeAnim = _this.gameui.animationHandler.animateProperty({
                node: _this.scoreContainer,
                duration: 300,
                properties: { opacity: 0.3 },
                onEnd: function () { animStatus = ANIM_STATE.still; }
            });
            scrollFadeAnim.start();
        });
    };
    EndGameScoringHandler.prototype.fadeInNextCell = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cells, overallContent, allCells, cell, instantFadeIn, fadeInAnim;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cells = Array.from(this.tbody.querySelectorAll('.cell-text:not(.displayed)'));
                        overallContent = document.getElementById('overall-content');
                        overallContent.removeEventListener('click', this.bodyClickHandler);
                        if (cells.length <= Object.keys(this.gameui.players).length * 2)
                            this.gameui.animationHandler.animateProperty({ node: this.fastForwardButton, duration: 400, properties: { opacity: 0 } }).start();
                        if (!(cells.length <= 0)) return [3 /*break*/, 2];
                        allCells = Array.from(this.tbody.querySelectorAll('.cell-text'));
                        allCells.forEach(function (cell) { cell.style.opacity = ''; });
                        this.makeWinnersJump();
                        this.setPlayerScores();
                        return [4 /*yield*/, this.gameui.wait(15000)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        cell = cells[0];
                        instantFadeIn = this.gameui.gamedatas.gamestate.name === 'gameEnd';
                        cell.classList.add('displayed');
                        fadeInAnim = this.gameui.animationHandler.animateProperty({
                            properties: { opacity: 1 },
                            node: cell,
                            duration: instantFadeIn ? 0 : 500,
                            delay: instantFadeIn ? 0 : 100,
                        });
                        this.bodyClickHandler = function (event) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                cell.style.opacity = '1 !important';
                                fadeInAnim.onEnd();
                                return [2 /*return*/];
                            });
                        }); };
                        overallContent.addEventListener('click', this.bodyClickHandler);
                        this.addColumnTotal(cell.getAttribute('player-id'));
                        return [4 /*yield*/, fadeInAnim.start()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.fadeInNextCell()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EndGameScoringHandler.prototype.addColumnTotal = function (playerID) {
        var cells = Array.from(this.tbody.querySelectorAll(".cell-text.displayed[player-id=\"".concat(playerID, "\"]:not(.cell-total)")));
        var total = 0;
        cells.forEach(function (cell) {
            var value = parseInt(cell.textContent || '0');
            if (!isNaN(value))
                total += value;
        });
        var totalCell = this.tbody.querySelector(".cell-total[player-id=\"".concat(playerID, "\"]"));
        if (totalCell) {
            totalCell.textContent = total.toString();
            totalCell.classList.add('displayed');
            totalCell.style.opacity = '1';
        }
    };
    EndGameScoringHandler.prototype.makeWinnersJump = function () {
        var _this = this;
        var delay = 0;
        var _loop_2 = function (winner_id) {
            setTimeout(function () {
                _this.thead.querySelector(".player-name-cell[player-id=\"".concat(winner_id, "\"]")).classList.add('jumping-text');
            }, delay);
            delay += 100 + Math.random() * 50;
        };
        for (var _i = 0, _a = this.winner_ids; _i < _a.length; _i++) {
            var winner_id = _a[_i];
            _loop_2(winner_id);
        }
    };
    EndGameScoringHandler.prototype.setPlayerScores = function () {
        for (var _i = 0, _a = this.gameui.playerSeatOrder; _i < _a.length; _i++) {
            var player_id = _a[_i];
            this.gameui.players[player_id].setPlayerScore(this.endGameScoring.player_scores[player_id].total);
        }
    };
    return EndGameScoringHandler;
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
        var _a;
        console.log("Starting game setup");
        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;
        this.MARKET_TILE_COLORS = gamedatas.MARKET_TILE_COLORS;
        this.PYRAMID_MAX_SIZE = gamedatas.PYRAMID_MAX_SIZE;
        this.CUBES_PER_MARKET_TILE = gamedatas.CUBES_PER_MARKET_TILE;
        this.nextPlayerTable = gamedatas.nextPlayerTable;
        this.rightPlayerID = (_a = gamedatas.nextPlayerTable[this.player_id]) !== null && _a !== void 0 ? _a : null;
        if (this.rightPlayerID) {
            this.playerSeatOrder = [parseInt(this.player_id)];
            var nextPlayerID = this.rightPlayerID;
            while (nextPlayerID != parseInt(this.player_id)) {
                this.playerSeatOrder.push(nextPlayerID);
                nextPlayerID = this.nextPlayerTable[nextPlayerID];
            }
        }
        else
            this.playerSeatOrder = Object.keys(gamedatas.players).map(Number); //spectator
        var cubeColorCSS = '';
        for (var colorIndex in this.CUBE_COLORS) {
            cubeColorCSS += ".a-cube[color=\"".concat(colorIndex, "\"] { --cube-color: #").concat(this.CUBE_COLORS[colorIndex].colorCode, "; }\n            ");
        }
        var pyramidCSSRange = [];
        for (var i = -1 * (this.PYRAMID_MAX_SIZE - 1); i <= this.PYRAMID_MAX_SIZE - 1; i++)
            pyramidCSSRange.push(i);
        var pyramidCSS = '';
        pyramidCSSRange.forEach(function (posXY) {
            pyramidCSSRange.forEach(function (posZ) {
                pyramidCSS += "\n                    .pyramids-container .a-pyramid-container .cubes-container *[pos-z=\"".concat(posZ, "\"][pos-x=\"").concat(posXY, "\"] {\n                    left: calc(var(--pyramid-cube-size) * ").concat(posXY + 0.42 * posZ, ");\n                    }\n                    .pyramids-container .a-pyramid-container .cubes-container *[pos-z=\"").concat(posZ, "\"][pos-y=\"").concat(posXY, "\"] {\n                    bottom: calc(var(--pyramid-cube-size) * ").concat(posXY + 0.7 * posZ, ");\n                    }\n                    ");
            });
        });
        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', "\n            <style>\n                ".concat(cubeColorCSS, "\n                ").concat(pyramidCSS, "\n            </style>\n            <div id=\"player-tables\">\n            <div class=\"market-container\">\n                <div class=\"market-tiles-container\">\n                    <div class=\"waiting-players-container\"></div>\n                </div>\n                <div class=\"bonus-cards-container\"></div>\n            </div>\n            <div class=\"pyramids-container\"></div>\n        </div>"));
        this.imageLoader = new ImageLoadHandler(this, ['market-tiles', 'player-order-tiles', 'bonus-cards', 'bonus-card-icons']);
        this.animationHandler = new AnimationHandlerPromiseBased(this);
        for (var _i = 0, _b = this.playerSeatOrder; _i < _b.length; _i++) {
            var player_id = _b[_i];
            var _c = this.gamedatas.players[player_id], name_1 = _c.name, color = _c.color, player_no = _c.player_no, turn_order = _c.turn_order, are_cubes_built = _c.are_cubes_built, zombie = _c.zombie;
            this.players[player_id] = new PlayerHandler(this, player_id, name_1, color, parseInt(player_no), parseInt(zombie) == 1, turn_order, gamedatas.pyramidData[player_id], are_cubes_built == '1');
            if (player_id == parseInt(this.player_id))
                this.myself = this.players[player_id];
        }
        this.MARKET_TILE_COLORS.forEach(function (color, index) {
            document.documentElement.style.setProperty("--market-tile-color-".concat(index), "#".concat(color));
        });
        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs, gamedatas.collectedMarketTilesData);
        this.tooltipHandler = new TooltipHandler(this);
        this.logMutationObserver = new LogMutationObserver(this);
        this.endGameScoringHandler = new EndGameScoringHandler(this);
        if (gamedatas.hasOwnProperty('endGameScoring'))
            this.endGameScoringHandler.displayEndGameScore(gamedatas.endGameScoring);
        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();
        console.log("Ending game setup");
    };
    GameBody.prototype.onEnteringState = function (stateName, args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('Entering state: ' + stateName, args);
                switch (stateName) {
                    case 'allSelectMarketTile':
                        if (!this.myself)
                            return [2 /*return*/];
                        this.marketHandler.addSelectableClassToMarketTiles();
                        break;
                    case 'buildPyramid':
                        this.marketHandler.closeWaitingPlayersContainer();
                        break;
                }
                return [2 /*return*/];
            });
        });
    };
    GameBody.prototype.onLeavingState = function (stateName) {
        console.log('Leaving state: ' + stateName);
        this.marketHandler.getMarketTiles().forEach(function (tile) { tile.classList.remove('selected-market-tile', 'selectable-market-tile'); });
        switch (stateName) {
            case 'buildPyramid':
                if (this.myself)
                    this.myself.pyramid.disableBuildPyramid();
                break;
            case 'allPyramidsBuilt':
                this.marketHandler.resetCollectedMarketTilesData();
                break;
        }
    };
    GameBody.prototype.onUpdateActionButtons = function (stateName, args) {
        console.log('onUpdateActionButtons: ' + stateName, args);
        switch (stateName) {
            case 'allSelectMarketTile':
                this.marketHandler.updateStatusTextUponMarketTileSelection();
                break;
            case 'individualPlayerSelectMarketTile':
                this.marketHandler.clearZombiePendingAvatars(this.getActivePlayerId());
                if (this.myself) {
                    var playerCollectedMarketTile = this.myself.getCollectedMarketTileData();
                    if (this.isCurrentPlayerActive())
                        this.marketHandler.addSelectableClassToMarketTiles(args.possible_market_indexes);
                    else if (playerCollectedMarketTile.type === 'collecting')
                        this.myself.pyramid.enableBuildPyramid();
                }
                break;
            case 'buildPyramid':
                if (this.myself)
                    this.myself.pyramid.enableBuildPyramid();
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
                            args['INDIVIDUAL_MARKET_TILES_COLLECTION_STR'] = this.logMutationObserver.createLogIndividualMarketTileCollection(args.player_id, args.collected_market_index, args.collected_cubes);
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
        var pos = this.getBoundingClientRectIgnoreZoom(node);
        pos.w = pos.width;
        pos.h = pos.height;
        return pos;
    };
    GameBody.prototype.isDesktop = function () { return document.body.classList.contains('desktop_version'); };
    GameBody.prototype.isMobile = function () { return document.body.classList.contains('mobile_version'); };
    GameBody.prototype.clickOrTap = function (capitalized) {
        if (capitalized === void 0) { capitalized = false; }
        if (capitalized) {
            return this.capitalizeFirstLetter(this.clickOrTap());
        }
        return this.isDesktop() ? 'click' : 'tap';
    };
    GameBody.prototype.capitalizeFirstLetter = function (str) { return "".concat(str[0].toUpperCase()).concat(str.slice(1)); };
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
    GameBody.prototype.placeOnObject = function (mobileObj, targetObj, forceBoundingClientRect) {
        if (forceBoundingClientRect === void 0) { forceBoundingClientRect = false; }
        mobileObj.style.left = '0px';
        mobileObj.style.top = '0px';
        // Get current positions
        var mobileWithinPageContent = document.getElementById('page-content').contains(mobileObj);
        var targetWithinPageContent = document.getElementById('page-content').contains(targetObj);
        var targetRect = mobileWithinPageContent ? this.getPos(targetObj) : targetObj.getBoundingClientRect();
        var mobileRect = targetWithinPageContent ? this.getPos(mobileObj) : mobileObj.getBoundingClientRect();
        if (forceBoundingClientRect) {
            targetRect = targetObj.getBoundingClientRect();
            mobileRect = mobileObj.getBoundingClientRect();
        }
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
            console.error('-- rgb --', rgb);
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
            var rect = this.getPos(child);
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        }
        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: maxX - minX, height: maxY - minY };
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
    GameBody.prototype.notif_displayEndGameScore = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_displayEndGameScore');
                        return [4 /*yield*/, this.endGameScoringHandler.displayEndGameScore(args.endGameScoring)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameBody.prototype.notif_zombieIndividualPlayerCollection = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('notif_zombieIndividualPlayerCollection');
                        this.players[args.player_id].setZombie(true);
                        return [4 /*yield*/, this.marketHandler.zombieIndividualPlayerCollection(args.player_id)];
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
            var cubesHTML = isCollecting ? '&nbsp; <div class="log-cubes-wrapper">' + cardData.collected_cubes.map(function (cube) { return _this.gameui.createCubeDiv(cube).outerHTML; }).join('') + '</div>' : '';
            var playerRowHTML = "\n                <div class=\"player-selected-market-tile-row ".concat(isCollecting ? 'collecting' : 'pending', "\">\n                    ").concat(_this.gameui.divColoredPlayer(cardData.player_id, { class: 'playername' }, false), "\n                    <i class=\"log-arrow log-arrow-left fa6 ").concat(isCollecting ? 'fa-arrow-left' : 'fa-ban', "\"></i>\n                    <div class=\"a-market-tile-icon\" market-index=\"").concat(cardData.selected_market_index, "\"></div>\n                    ").concat(cubesHTML, "\n                </div>\n            ");
            return playerRowHTML;
        };
        cardsData.collectingPlayers.forEach(function (cardData) { logHTML += createPlayerRow(cardData, true); });
        cardsData.pendingPlayers.forEach(function (cardData) { logHTML += createPlayerRow(cardData, false); });
        logHTML = "<div class=\"market-interaction-rows-wrapper\">".concat(logHTML, "</div>");
        return logHTML;
    };
    LogMutationObserver.prototype.createLogIndividualMarketTileCollection = function (player_id, collected_market_index, collected_cubes) {
        var _this = this;
        return "<div class=\"player-collected-market-tile-row collecting\">".concat(this.gameui.divColoredPlayer(player_id, { class: 'playername' }, false), "<i class=\"log-arrow log-arrow-left fa6 fa-arrow-left\"></i><div class=\"a-market-tile-icon\" market-index=\"").concat(collected_market_index, "\"></div></div>") + ' &nbsp; <div class="log-cubes-wrapper">' + collected_cubes.map(function (cube) { return _this.gameui.createCubeDiv(cube).outerHTML; }).join('') + '</div>';
    };
    LogMutationObserver.prototype.createLogDisplayBuiltCubes = function (built_cubes) {
        var logHTML = '';
        var _loop_3 = function (playerID) {
            var cubesHTML = '';
            if (!built_cubes[playerID]) {
                console.error("No built cubes data found for player ".concat(playerID, " (likely a zombie player)"), this_2.gameui.players[playerID]);
                return "continue";
            }
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
                cubesHTML += this_2.gameui.createCubeDiv(cube).outerHTML;
            }
            logHTML += "<div class=\"player-built-cubes-row\">\n            ".concat(this_2.gameui.divColoredPlayer(playerID, { class: 'playername' }, false), "\n            <i class=\"log-arrow log-place-cube-icon fa6 fa-download\"></i>\n            <div class=\"log-cubes-wrapper\">").concat(cubesHTML, "</div>\n            </div>");
        };
        var this_2 = this;
        for (var playerID in this.gameui.players) {
            _loop_3(playerID);
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
            this.highlightCollectedMarketTile();
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
                        cubeDiv.setAttribute('built-status', 'selected-cube');
                    else if (parseInt(cube.cube_id) in cubesInConstruction)
                        cubeDiv.setAttribute('built-status', 'built-cube');
                    else if (cube.location == 'to_discard')
                        cubeDiv.setAttribute('built-status', 'discarded-cube');
                }
                cubesContainer.appendChild(cubeDiv);
            }
        });
    };
    MarketHandler.prototype.addSelectableClassToMarketTiles = function (possibleMarketIndexes) {
        var _this = this;
        if (possibleMarketIndexes === void 0) { possibleMarketIndexes = null; }
        this.marketTiles.forEach(function (tile) { return tile.classList.remove('selectable-market-tile'); });
        if (this.gameui.myself && this.gameui.myself.isZombie()) {
            this.marketTiles.forEach(function (tile) { return tile.classList.add('zombie-market-tile'); });
            return;
        }
        var selectableMarketTiles = [];
        if (possibleMarketIndexes) {
            possibleMarketIndexes.forEach(function (i) { return selectableMarketTiles.push(_this.marketTiles[i]); });
        }
        else {
            var selectedMarketIndex = this.getMySelectedMarketIndex();
            if (selectedMarketIndex !== null)
                return;
            else
                selectableMarketTiles = this.marketTiles;
        }
        selectableMarketTiles.forEach(function (tile) { return tile.classList.add('selectable-market-tile'); });
    };
    MarketHandler.prototype.marketTileClicked = function (event) {
        if (!['allSelectMarketTile', 'individualPlayerSelectMarketTile'].includes(this.gameui.gamedatas.gamestate.name) || this.gameui.isInterfaceLocked())
            return;
        var marketTile = event.target;
        if (!marketTile.classList.contains('a-market-tile') || marketTile.classList.contains('zombie-market-tile'))
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
                }
                else
                    this.setPlayerSelectedMarketIndex(null);
                this.addSelectableClassToMarketTiles();
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
                            avatarClone.style.zIndex = '1000';
                            var srcAvatar = _this.gameui.players[playerCollects.player_id].overallPlayerBoard.querySelector('img.avatar');
                            document.body.appendChild(avatarClone);
                            _this.gameui.placeOnObject(avatarClone, srcAvatar);
                            var currentTop = parseInt(window.getComputedStyle(avatarClone).top);
                            var destAvatar = _this.marketContainer.querySelector(".yaxha-player-avatar[player-id=\"".concat(playerCollects.player_id, "\"]"));
                            var destAvatarRect = destAvatar ? destAvatar.getBoundingClientRect() : { width: 0, height: 0 };
                            var destAvatarClone = avatarClone.cloneNode(true);
                            destAvatarClone.style.opacity = '0';
                            avatarClone.after(destAvatarClone);
                            _this.gameui.placeOnObject(destAvatarClone, destAvatar, true);
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
                        this.highlightCollectedMarketTile();
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
            var _this = this;
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
                        pendingAvatarClone.style.zIndex = '1000';
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
                            onEnd: function () { destAvatar.style.opacity = null; pendingAvatarClone.remove(); _this.highlightCollectedMarketTile(); }
                        });
                        return [4 /*yield*/, this.gameui.animationHandler.combine([shrinkPendingAvatar, movePendingAvatarClone]).start()];
                    case 1:
                        _a.sent();
                        if (this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar').length === 0)
                            this.closeWaitingPlayersContainer();
                        return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.closeWaitingPlayersContainer = function () {
        var _this = this;
        this.waitingPlayersContainer.style.opacity = null;
        this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar').forEach(function (avatar) { return _this.gameui.animationHandler.fadeOutAndDestroy(avatar); });
    };
    MarketHandler.prototype.clearZombiePendingAvatars = function (nextCollectingPlayerID) {
        var _this = this;
        var allPendingAvatars = Array.from(this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar'));
        var zombieAvatars = [];
        for (var _i = 0, allPendingAvatars_1 = allPendingAvatars; _i < allPendingAvatars_1.length; _i++) {
            var avatar = allPendingAvatars_1[_i];
            if (Number(avatar.getAttribute('player-id')) == nextCollectingPlayerID)
                break;
            zombieAvatars.push(avatar);
        }
        zombieAvatars.forEach(function (avatar) { return _this.gameui.animationHandler.fadeOutAndDestroy(avatar); });
    };
    MarketHandler.prototype.highlightCollectedMarketTile = function () {
        if (!this.gameui.myself)
            return;
        var collectedMarketIndex = this.getMyCollectedMarketIndex();
        if (collectedMarketIndex === null)
            return;
        var collectedMarketTile = this.marketTiles[collectedMarketIndex];
        collectedMarketTile.style.setProperty('--collecting-player-color', '#' + this.gameui.players[this.gameui.myself.playerID].playerColor);
        collectedMarketTile.classList.add('collected-market-tile');
    };
    MarketHandler.prototype.animateBuiltCubes = function (built_cubes) {
        return __awaiter(this, void 0, void 0, function () {
            var cubeAnimArray, delay, myAvatar, _loop_4, this_3, marketIndex, cubeAnim, playerID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cubeAnimArray = [];
                        delay = 0;
                        if (this.gameui.myself) {
                            myAvatar = this.marketContainer.querySelector(".yaxha-player-avatar.collecting-player-avatar[player-id=\"".concat(this.gameui.myself.playerID, "\"]"));
                            if (myAvatar)
                                this.gameui.animationHandler.fadeOutAndDestroy(myAvatar, 100);
                        }
                        _loop_4 = function (marketIndex) {
                            var playerID = (_a = this_3.collectedMarketTilesData.find(function (data) { return Number(data.collected_market_index) === Number(marketIndex); })) === null || _a === void 0 ? void 0 : _a.player_id;
                            if (!playerID || !built_cubes[playerID])
                                return "continue";
                            if (this_3.gameui.myself && this_3.gameui.myself.playerID == Number(playerID))
                                return "continue";
                            var player = this_3.gameui.players[playerID];
                            var playerCubes = built_cubes[playerID].sort(function (a, b) { return a.pos_z - b.pos_z; });
                            var playerCubesAnimation = player.pyramid.animateOtherPlayerCubesToPyramid(playerCubes);
                            playerCubesAnimation = playerCubesAnimation.addDelay(delay);
                            delay += 400;
                            cubeAnimArray.push(playerCubesAnimation);
                        };
                        this_3 = this;
                        for (marketIndex in this.marketTiles) {
                            _loop_4(marketIndex);
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
                        this.marketTiles.forEach(function (marketTile) {
                            marketTile.querySelector('.cubes-container').innerHTML = '';
                            marketTile.classList.remove('collected-market-tile');
                        });
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
    MarketHandler.prototype.zombieIndividualPlayerCollection = function (player_id) {
        return __awaiter(this, void 0, void 0, function () {
            var waitingPlayersContainer, playerAvatar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container');
                        playerAvatar = waitingPlayersContainer.querySelector(".yaxha-player-avatar[player-id=\"".concat(player_id, "\"]"));
                        if (!playerAvatar) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.gameui.animationHandler.fadeOutAndDestroy(playerAvatar, 500)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    MarketHandler.prototype.addPlayerAvatar = function (playerCollects, isVisible) {
        if (playerCollects.type == 'zombie')
            return null;
        var avatarClone = this.gameui.players[playerCollects.player_id].createAvatarClone();
        if (playerCollects.type != 'pending' && playerCollects.collected_market_index == null)
            return null;
        var newAvatarContainer = playerCollects.type === 'pending'
            ? this.marketContainer.querySelector('.waiting-players-container')
            : this.marketTiles[playerCollects.collected_market_index];
        var avatarClass = playerCollects.type === 'pending' ? 'pending-player-avatar' : 'collecting-player-avatar';
        avatarClone.removeAttribute("style");
        avatarClone.classList.add(avatarClass);
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
    MarketHandler.prototype.resetCollectedMarketTilesData = function () {
        for (var i = 0; i < this.collectedMarketTilesData.length; i++) {
            this.collectedMarketTilesData[i].selected_market_index = null;
            this.collectedMarketTilesData[i].collected_market_index = null;
        }
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
    function PlayerHandler(gameui, playerID, playerName, playerColor, playerNo, isZombiePlayer, turnOrder, pyramidData, are_cubes_built) {
        this.gameui = gameui;
        this.playerID = playerID;
        this.playerName = playerName;
        this.playerColor = playerColor;
        this.playerNo = playerNo;
        this.isZombiePlayer = isZombiePlayer;
        this.turnOrder = turnOrder;
        this.are_cubes_built = are_cubes_built;
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
    PlayerHandler.prototype.setPlayerScore = function (newScore) { this.overallPlayerBoard.querySelector('.player_score_value').innerHTML = newScore.toString(); };
    PlayerHandler.prototype.getPlayerName = function () { return this.playerName; };
    PlayerHandler.prototype.getTurnOrder = function () { return this.turnOrder; };
    PlayerHandler.prototype.isZombie = function () { return this.isZombiePlayer; };
    PlayerHandler.prototype.getCollectedMarketTileData = function () {
        return this.gameui.marketHandler.getPlayerCollectedMarketTile(this.playerID);
    };
    PlayerHandler.prototype.setTurnOrder = function (turnOrder) { this.turnOrder = turnOrder; };
    PlayerHandler.prototype.setZombie = function (isZombieIn) { this.isZombiePlayer = isZombieIn; };
    return PlayerHandler;
}());
var PyramidHandler = /** @class */ (function () {
    function PyramidHandler(gameui, owner, PYRAMID_MAX_SIZE, pyramidData) {
        this.gameui = gameui;
        this.owner = owner;
        this.PYRAMID_MAX_SIZE = PYRAMID_MAX_SIZE;
        this.pyramidData = pyramidData;
        this.cubesInConstruction = {};
        this.moveCubeAnim = null;
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
        var buildCubes = [];
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
            else
                buildCubes.push(cube);
        });
        this.pyramidData = buildCubes;
        if (!this.owner.are_cubes_built && maxOrderCubeInConstruction)
            this.unplacedCube = maxOrderCubeInConstruction;
        this.arrangeCubesZIndex();
        this.centerCubesContainer(false);
    };
    PyramidHandler.prototype.enableBuildPyramid = function () {
        if (this.owner.are_cubes_built || this.owner.isZombie()) {
            this.updatePyramidStatusText();
            return;
        }
        var previouslyEnabled = this.pyramidContainer.getAttribute('build-pyramid-enabled') === 'true';
        this.pyramidContainer.setAttribute('build-pyramid-enabled', 'true');
        this.drawSnapPoints();
        this.centerCubesContainer(previouslyEnabled);
        this.displaySwitchColorButton();
        this.arrangeCubesZIndex();
        this.updatePyramidStatusText();
    };
    PyramidHandler.prototype.disableBuildPyramid = function () {
        this.pyramidContainer.removeAttribute('build-pyramid-enabled');
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(function (el) { return el.remove(); });
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        this.centerCubesContainer();
        this.updatePyramidStatusText();
    };
    PyramidHandler.prototype.onSnapPointClicked = function (args) {
        if (this.moveCubeAnim)
            return;
        var myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if (!myPyramid)
            return;
        var lastBuiltCube = this.unplacedCube;
        if (this.unplacedCube) { //save the last built cube
            var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            marketTile.querySelectorAll('.a-cube[built-status="selected-cube"]').forEach(function (cube) { cube.removeAttribute('built-status'); });
            marketTile.querySelector('.a-cube[cube-id="' + this.unplacedCube.cube_id + '"]').setAttribute('built-status', 'built-cube');
            this.unplacedCube = null;
        }
        var posX = Number(args.target.getAttribute('pos-x'));
        var posY = Number(args.target.getAttribute('pos-y'));
        var posZ = Number(args.target.getAttribute('pos-z'));
        var marketCubeData = this.getNextUnplacedMarketCube(args.target.getAttribute('possible-colors'));
        var moveType = marketCubeData ? 'from_market' : 'from_last_built';
        var cubeData = (moveType == 'from_market') ?
            {
                pos_x: posX,
                pos_y: posY,
                pos_z: posZ,
                color: marketCubeData.color,
                cube_id: marketCubeData.cube_id,
                order_in_construction: Object.keys(this.cubesInConstruction).length + 1,
                div: null
            } :
            {
                pos_x: posX,
                pos_y: posY,
                pos_z: posZ,
                color: lastBuiltCube.color,
                cube_id: lastBuiltCube.cube_id,
                order_in_construction: lastBuiltCube.order_in_construction,
                div: lastBuiltCube.div
            };
        this.cubesInConstruction[cubeData.cube_id] = cubeData;
        this.animateUnplacedCubeToPyramid(cubeData, moveType);
    };
    PyramidHandler.prototype.drawSnapPoints = function () {
        var _this = this;
        var myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if (!myPyramid)
            return;
        var possibleMoves = this.getPossibleMoves();
        if (!possibleMoves) {
            console.error("No possible moves for player ".concat(this.owner.playerID, " (likely a zombie player coming back to game)"), this.owner);
            return;
        }
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(function (el) { return el.classList.add('to-remove'); });
        possibleMoves.forEach(function (pos) {
            var existingSnapPoint = _this.cubesContainer.querySelector(".pyramid-cube-snap-point[pos-x=\"".concat(pos.pos_x, "\"][pos-y=\"").concat(pos.pos_y, "\"][pos-z=\"").concat(pos.pos_z, "\"]"));
            if (existingSnapPoint) {
                existingSnapPoint.classList.remove('to-remove');
                existingSnapPoint.setAttribute('possible-colors', pos.possible_colors.join('_'));
                return;
            }
            var snapPoint = document.createElement('div');
            snapPoint.className = 'pyramid-cube-snap-point';
            snapPoint.setAttribute('pos-x', pos.pos_x.toString());
            snapPoint.setAttribute('pos-y', pos.pos_y.toString());
            snapPoint.setAttribute('pos-z', pos.pos_z.toString());
            snapPoint.setAttribute('possible-colors', pos.possible_colors.join('_'));
            _this.cubesContainer.appendChild(snapPoint);
            snapPoint.addEventListener('click', function (args) { return _this.onSnapPointClicked(args); });
            _this.gameui.animationHandler.animateProperty({ node: snapPoint, properties: { opacity: 1 }, duration: 300 }).play();
        });
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point.to-remove').forEach(function (el) { return el.remove(); });
    };
    PyramidHandler.prototype.getPossibleMoves = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _m, _o, _p;
        if (this.owner.isZombie())
            return null;
        var cubesInPyramid = this.getPyramidCubesExceptFinalBuilt();
        var colorsOnMarketTile = this.getAvailableColorsOnMarketTile();
        if (colorsOnMarketTile == null) {
            console.error("No available colors on market tile for player ".concat(this.owner.playerID, " (likely a zombie player coming back to game)"), this.owner);
            return null;
        }
        if (colorsOnMarketTile.length == 0 && this.unplacedCube) //if no colors on market tile, the unplaced cube will be moving around
            colorsOnMarketTile = [this.unplacedCube.color];
        if (cubesInPyramid.length === 0)
            return [{ pos_x: 0, pos_y: 0, pos_z: 0, possible_colors: colorsOnMarketTile }];
        var possibleMovesDict = {};
        var cubeCoordsZXY_Color = {};
        var cubeCountByLayer = {};
        var minX = Infinity, minY = Infinity;
        var maxX = -Infinity, maxY = -Infinity;
        // calculate possible moves for the bottom layer
        for (var _i = 0, cubesInPyramid_1 = cubesInPyramid; _i < cubesInPyramid_1.length; _i++) {
            var cube = cubesInPyramid_1[_i];
            var posX = Number(cube.pos_x);
            var posY = Number(cube.pos_y);
            var posZ_1 = Number(cube.pos_z);
            (_a = cubeCoordsZXY_Color[posZ_1]) !== null && _a !== void 0 ? _a : (cubeCoordsZXY_Color[posZ_1] = {});
            (_b = (_m = cubeCoordsZXY_Color[posZ_1])[posX]) !== null && _b !== void 0 ? _b : (_m[posX] = {});
            cubeCoordsZXY_Color[posZ_1][posX][posY] = cube.color;
            cubeCountByLayer[posZ_1] = ((_c = cubeCountByLayer[posZ_1]) !== null && _c !== void 0 ? _c : 0) + 1;
            (_d = possibleMovesDict[posX]) !== null && _d !== void 0 ? _d : (possibleMovesDict[posX] = {});
            possibleMovesDict[posX][posY + 1] = 1;
            possibleMovesDict[posX][posY - 1] = 1;
            (_e = possibleMovesDict[_o = posX + 1]) !== null && _e !== void 0 ? _e : (possibleMovesDict[_o] = {});
            possibleMovesDict[posX + 1][posY] = 1;
            (_f = possibleMovesDict[_p = posX - 1]) !== null && _f !== void 0 ? _f : (possibleMovesDict[_p] = {});
            possibleMovesDict[posX - 1][posY] = 1;
            minX = Math.min(minX, posX);
            minY = Math.min(minY, posY);
            maxX = Math.max(maxX, posX);
            maxY = Math.max(maxY, posY);
        }
        var xFilled = (maxX - minX) >= this.gameui.PYRAMID_MAX_SIZE - 1;
        var yFilled = (maxY - minY) >= this.gameui.PYRAMID_MAX_SIZE - 1;
        if (xFilled) {
            delete possibleMovesDict[minX - 1];
            delete possibleMovesDict[maxX + 1];
        }
        if (yFilled) {
            for (var x in possibleMovesDict) {
                delete possibleMovesDict[parseInt(x)][minY - 1];
                delete possibleMovesDict[parseInt(x)][maxY + 1];
            }
        }
        // remove occupied cells
        if (cubeCoordsZXY_Color[0]) {
            for (var posXStr in cubeCoordsZXY_Color[0]) {
                var posX = parseInt(posXStr);
                for (var posYStr in cubeCoordsZXY_Color[0][posX]) {
                    var posY = parseInt(posYStr);
                    if (possibleMovesDict[posX]) {
                        delete possibleMovesDict[posX][posY];
                    }
                }
            }
        }
        var playerPossibleMoves = [];
        for (var posXStr in possibleMovesDict) {
            var posX = parseInt(posXStr);
            for (var posYStr in possibleMovesDict[posX]) {
                var posY = parseInt(posYStr);
                playerPossibleMoves.push({ pos_x: posX, pos_y: posY, pos_z: 0, possible_colors: colorsOnMarketTile });
            }
        }
        // first layer finished, check upper layers
        var posZ = 1;
        while (posZ < this.gameui.PYRAMID_MAX_SIZE) {
            if (!cubeCountByLayer[posZ - 1] || cubeCountByLayer[posZ - 1] < 4)
                break;
            for (var posXStr in cubeCoordsZXY_Color[posZ - 1]) {
                var posX = parseInt(posXStr);
                for (var posYStr in cubeCoordsZXY_Color[posZ - 1][posX]) {
                    var posY = parseInt(posYStr);
                    if ((_h = (_g = cubeCoordsZXY_Color[posZ]) === null || _g === void 0 ? void 0 : _g[posX]) === null || _h === void 0 ? void 0 : _h[posY]) //continue if the cube is already in the pyramid
                        continue;
                    if (!((_j = cubeCoordsZXY_Color[posZ - 1][posX + 1]) === null || _j === void 0 ? void 0 : _j[posY])) //continue if the cube has no neighbor on the right-bottom
                        continue;
                    if (!((_k = cubeCoordsZXY_Color[posZ - 1][posX]) === null || _k === void 0 ? void 0 : _k[posY + 1])) //continue if the cube has no neighbor on the left-top
                        continue;
                    if (!((_l = cubeCoordsZXY_Color[posZ - 1][posX + 1]) === null || _l === void 0 ? void 0 : _l[posY + 1])) //continue if the cube has no neighbor on the right-top
                        continue;
                    var potentialCube = { pos_x: posX, pos_y: posY, pos_z: posZ, color: '', cube_id: '', order_in_construction: null, div: null };
                    var neighborColors = this.getCubeNeighborColors(potentialCube, cubeCoordsZXY_Color);
                    if (neighborColors.length == 0)
                        continue;
                    var possibleColors = neighborColors.filter(function (color) { return colorsOnMarketTile.includes(color); });
                    if (possibleColors.length === 0)
                        continue;
                    playerPossibleMoves.push({ pos_x: posX, pos_y: posY, pos_z: posZ, possible_colors: possibleColors });
                }
            }
            posZ++;
        }
        if (this.unplacedCube) { //make sure the unplaced cube is not in the possible moves since getPyramidCubesExceptFinalBuilt rules it out
            playerPossibleMoves = playerPossibleMoves.filter(function (move) {
                return move.pos_x !== _this.unplacedCube.pos_x ||
                    move.pos_y !== _this.unplacedCube.pos_y ||
                    move.pos_z !== _this.unplacedCube.pos_z;
            });
        }
        return playerPossibleMoves;
    };
    PyramidHandler.prototype.getPyramidCubesExceptFinalBuilt = function () {
        var cubes = [];
        var allCubes = __spreadArray(__spreadArray([], Object.values(this.pyramidData), true), Object.values(this.cubesInConstruction), true);
        for (var _i = 0, allCubes_1 = allCubes; _i < allCubes_1.length; _i++) {
            var cube = allCubes_1[_i];
            if (Number(cube.order_in_construction) !== Number(this.gameui.CUBES_PER_MARKET_TILE))
                cubes.push(cube);
        }
        return cubes;
    };
    PyramidHandler.prototype.getCubeNeighborColors = function (cube, cubeCoordsZXY_Color) {
        if (cubeCoordsZXY_Color === void 0) { cubeCoordsZXY_Color = null; }
        var posX = Number(cube.pos_x);
        var posY = Number(cube.pos_y);
        var posZ = Number(cube.pos_z);
        if (!cubeCoordsZXY_Color) {
            var cubesInPyramid = this.getPyramidCubesExceptFinalBuilt();
            cubeCoordsZXY_Color = cubesInPyramid.reduce(function (acc, cube) {
                var _a, _b;
                var _c, _d, _e;
                (_a = acc[_c = cube.pos_z]) !== null && _a !== void 0 ? _a : (acc[_c] = {});
                (_b = (_d = acc[cube.pos_z])[_e = cube.pos_x]) !== null && _b !== void 0 ? _b : (_d[_e] = {});
                acc[cube.pos_z][cube.pos_x][cube.pos_y] = cube.color;
                return acc;
            }, {});
        }
        var neighborPositions = [
            [posX + 1, posY, posZ],
            [posX - 1, posY, posZ],
            [posX, posY + 1, posZ],
            [posX, posY - 1, posZ],
            [posX, posY, posZ - 1],
            [posX + 1, posY, posZ - 1],
            [posX, posY + 1, posZ - 1],
            [posX + 1, posY + 1, posZ - 1],
        ];
        // Get colors of all neighbor cubes in a hash
        var neighborColors = {};
        neighborPositions.forEach(function (_a) {
            var _b, _c;
            var neighX = _a[0], neighY = _a[1], neighZ = _a[2];
            if ((_c = (_b = cubeCoordsZXY_Color[neighZ]) === null || _b === void 0 ? void 0 : _b[neighX]) === null || _c === void 0 ? void 0 : _c[neighY])
                neighborColors[cubeCoordsZXY_Color[neighZ][neighX][neighY]] = 1;
        });
        return Object.keys(neighborColors);
    };
    PyramidHandler.prototype.getAvailableColorsOnMarketTile = function () {
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        if (!marketTile) {
            console.error("No collected market tile for player ".concat(this.owner.playerID, " (likely a zombie player coming back to game)"), this.owner);
            return null;
        }
        var availableCubes = Array.from(marketTile.querySelectorAll('.a-cube:not([built-status])'));
        var availableColorsDict = {};
        availableCubes.forEach(function (cube) {
            var cubeColor = cube.getAttribute('color');
            availableColorsDict[cubeColor] = 1;
        });
        return Object.keys(availableColorsDict);
    };
    PyramidHandler.prototype.updatePyramidStatusText = function () {
        var _this = this;
        var _a, _b;
        var statusText = null;
        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile') {
            if (this.owner.are_cubes_built)
                statusText = dojo.string.substitute(_('${actplayer} must select an available Market Tile'), { actplayer: this.gameui.divActivePlayer() });
            else {
                statusText = dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), { you: this.gameui.divYou() });
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = statusText;
                document.title = '◣' + tempDiv.innerText;
            }
        }
        else if (this.gameui.gamedatas.gamestate.name === 'buildPyramid') {
            if (this.owner.are_cubes_built)
                statusText = dojo.string.substitute(_('Waiting for other players to build Pyramids'), { you: this.gameui.divYou() });
            else
                statusText = dojo.string.substitute(_('${you} need to build your Pyramid'), { you: this.gameui.divYou() });
        }
        if (!statusText)
            return;
        var showConfirmButton = (Object.keys(this.cubesInConstruction).length >= this.gameui.CUBES_PER_MARKET_TILE || this.pyramidContainer.querySelectorAll('.pyramid-cube-snap-point').length <= 0) && !this.owner.are_cubes_built;
        var showUndoButton = Object.keys(this.cubesInConstruction).length > 0;
        if (showConfirmButton || showUndoButton) {
            var buttonHTML = '';
            if (showConfirmButton) {
                var allCubesBuilt = Object.keys(this.cubesInConstruction).length >= this.gameui.CUBES_PER_MARKET_TILE;
                var cubeIconsHTML = '';
                var sortedCubes = Object.values(this.cubesInConstruction).sort(function (a, b) { return a.order_in_construction - b.order_in_construction; });
                for (var _i = 0, sortedCubes_1 = sortedCubes; _i < sortedCubes_1.length; _i++) {
                    var cube = sortedCubes_1[_i];
                    cubeIconsHTML += this.gameui.createCubeDiv(cube).outerHTML;
                }
                cubeIconsHTML = '<div class="cube-wrapper">' + cubeIconsHTML + '</div>';
                statusText = dojo.string.substitute(_('Place${cubeIcons}'), { cubeIcons: cubeIconsHTML });
                buttonHTML += "<a class=\"confirm-place-cube-button bgabutton bgabutton_".concat(allCubesBuilt ? 'blue' : 'red', "\">") + (allCubesBuilt ? _('Confirm') : _('Confirm and discard the rest')) + '</a>';
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
        if (this.moveCubeAnim)
            return;
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        this.unplacedCube = cubeData;
        var marketCubeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--market-cube-size'));
        var pyramidCubeSize = parseInt(getComputedStyle(document.body).getPropertyValue('--pyramid-cube-size'));
        var animSpeed = 400;
        if (!this.unplacedCube.div) { //search Market Tiles
            var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            var marketCubeDiv = marketTile.querySelector(".a-cube[cube-id=\"".concat(cubeData.cube_id, "\"]"));
            this.unplacedCube.div = marketCubeDiv.cloneNode(true);
            this.unplacedCube.div.style.width = marketCubeSize + 'px';
            this.unplacedCube.div.style.height = marketCubeSize + 'px';
            this.unplacedCube.div.style.maxWidth = pyramidCubeSize + 'px'; //so that the expansion animation happens half way
            this.unplacedCube.div.style.maxHeight = pyramidCubeSize + 'px';
            this.cubesContainer.appendChild(this.unplacedCube.div);
            marketCubeDiv.setAttribute('built-status', 'selected-cube');
            this.gameui.placeOnObject(this.unplacedCube.div, marketCubeDiv);
            animSpeed = 600;
        }
        var goTo = this.cubesContainer.querySelector(".pyramid-cube-snap-point[pos-x=\"".concat(this.unplacedCube.pos_x, "\"][pos-y=\"").concat(this.unplacedCube.pos_y, "\"][pos-z=\"").concat(this.unplacedCube.pos_z, "\"]"));
        this.moveCubeAnim = this.gameui.animationHandler.animateProperty({
            node: this.unplacedCube.div,
            properties: { top: goTo.offsetTop, left: goTo.offsetLeft, width: pyramidCubeSize * 2, height: pyramidCubeSize * 2 },
            duration: animSpeed,
            onBegin: function () { _this.unplacedCube.div.classList.add('animating-cube'); },
            onEnd: function () {
                _this.unplacedCube.div.classList.remove('animating-cube');
                _this.unplacedCube.div.setAttribute('pos-x', goTo.getAttribute('pos-x'));
                _this.unplacedCube.div.setAttribute('pos-y', goTo.getAttribute('pos-y'));
                _this.unplacedCube.div.setAttribute('pos-z', goTo.getAttribute('pos-z'));
                goTo.replaceWith(_this.unplacedCube.div);
                _this.unplacedCube.div.style.width = null;
                _this.unplacedCube.div.style.height = null;
                _this.unplacedCube.div.style.maxWidth = null;
                _this.unplacedCube.div.style.maxHeight = null;
                _this.gameui.ajaxAction(moveType == 'from_market' ? 'actAddCubeToPyramid' : 'actMoveCubeInPyramid', { cube_id: _this.unplacedCube.cube_id, pos_x: _this.unplacedCube.pos_x, pos_y: _this.unplacedCube.pos_y, pos_z: _this.unplacedCube.pos_z }, false, false);
                _this.moveCubeAnim = null;
                _this.enableBuildPyramid();
            }
        });
        this.moveCubeAnim.start();
    };
    PyramidHandler.prototype.animateOtherPlayerCubesToPyramid = function (cubeMoves) {
        var _this = this;
        if (this.moveCubeAnim)
            return;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var animSpeed = 600;
        var marketCubeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--market-cube-size'));
        var pyramidCubeSize = parseInt(getComputedStyle(document.body).getPropertyValue('--pyramid-cube-size'));
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
        var delay = 0;
        var animatingCubes = {};
        var _loop_5 = function (move) {
            var marketCubeDiv = marketTile.querySelector(".a-cube[cube-id=\"".concat(move.cube_id, "\"]"));
            if (!marketCubeDiv)
                return "continue";
            marketCubeDiv.setAttribute('pos-x', move.pos_x.toString());
            marketCubeDiv.setAttribute('pos-y', move.pos_y.toString());
            marketCubeDiv.setAttribute('pos-z', move.pos_z.toString());
            marketCubeDiv.classList.add('animating-cube');
            var pyramidCubeDiv = marketCubeDiv.cloneNode(true);
            pyramidCubeDiv.style.opacity = '0';
            pyramidCubeDiv.style.top = null;
            pyramidCubeDiv.style.left = null;
            this_4.cubesContainer.appendChild(pyramidCubeDiv);
            marketCubeDiv.style.width = marketCubeSize + 'px';
            marketCubeDiv.style.height = marketCubeSize + 'px';
            marketCubeDiv.style.maxWidth = pyramidCubeSize + 'px';
            marketCubeDiv.style.maxHeight = pyramidCubeSize + 'px';
            marketCubeDiv = this_4.gameui.attachToNewParent(marketCubeDiv, this_4.cubesContainer);
            var cubeData = {
                cube_id: move.cube_id,
                pos_x: move.pos_x,
                pos_y: move.pos_y,
                pos_z: move.pos_z,
                color: move.color,
                order_in_construction: null,
                div: pyramidCubeDiv
            };
            this_4.pyramidData.push(cubeData);
            animatingCubes[move.cube_id] = true;
            var builtCubeAnim = this_4.gameui.animationHandler.animateProperty({
                node: marketCubeDiv,
                properties: { top: pyramidCubeDiv.offsetTop, left: pyramidCubeDiv.offsetLeft, width: pyramidCubeSize * 2, height: pyramidCubeSize * 2 },
                duration: animSpeed + Math.floor(Math.random() * 101) - 50,
                easing: 'circleOut',
                delay: delay + Math.floor(Math.random() * 100),
                onEnd: function () {
                    pyramidCubeDiv.replaceWith(marketCubeDiv);
                    marketCubeDiv.classList.remove('animating-cube');
                    marketCubeDiv.style.width = null;
                    marketCubeDiv.style.height = null;
                    marketCubeDiv.style.maxWidth = null;
                    marketCubeDiv.style.maxHeight = null;
                    delete animatingCubes[move.cube_id];
                    if (Object.keys(animatingCubes).length == 0) {
                        _this.arrangeCubesZIndex();
                        _this.centerCubesContainer();
                        _this.moveCubeAnim = null;
                    }
                }
            });
            cubeAnimArray.push(builtCubeAnim);
            delay += 50;
        };
        var this_4 = this;
        for (var _i = 0, cubeMoves_1 = cubeMoves; _i < cubeMoves_1.length; _i++) {
            var move = cubeMoves_1[_i];
            _loop_5(move);
        }
        this.arrangeCubesZIndex();
        this.moveCubeAnim = this.gameui.animationHandler.combine(cubeAnimArray);
        return this.moveCubeAnim;
    };
    PyramidHandler.prototype.saveAllCubesInPyramid = function () {
        for (var i = 0; i < this.pyramidData.length; i++)
            this.pyramidData[i].order_in_construction = null;
        this.unplacedCube = null;
        this.cubesInConstruction = {};
        this.owner.are_cubes_built = false;
    };
    PyramidHandler.prototype.confirmPlaceCubeButtonClicked = function () {
        this.gameui.ajaxAction('actConfirmBuildPyramid', {}, true, false);
    };
    PyramidHandler.prototype.confirmedBuildPyramid = function () {
        var _this = this;
        this.owner.are_cubes_built = true;
        // Save all cubes in construction to pyramid data
        Object.values(this.cubesInConstruction).forEach(function (cube) {
            if (!_this.pyramidData.some(function (existingCube) { return existingCube.cube_id === cube.cube_id; })) {
                _this.pyramidData.push(cube);
            }
        });
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(function (cube) {
            if (!cube.hasAttribute('built-status'))
                cube.setAttribute('built-status', 'discarded-cube');
            else
                cube.setAttribute('built-status', 'built-cube');
        });
        this.disableBuildPyramid();
    };
    PyramidHandler.prototype.undoPlaceCubeButtonClicked = function () {
        var _this = this;
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(function (snapPoint) {
            _this.gameui.animationHandler.fadeOutAndDestroy(snapPoint, 100);
        });
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var marketCubeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--market-cube-size'));
        var pyramidCubeSize = parseInt(getComputedStyle(document.body).getPropertyValue('--pyramid-cube-size'));
        var undoAnimArray = [];
        var animatingCubes = {};
        // Get all cubes in construction and animate them back to their market positions
        Object.values(this.cubesInConstruction).forEach(function (cube) {
            var marketCube = marketTile.querySelector(".a-cube[cube-id=\"".concat(cube.cube_id, "\"]"));
            if (!marketCube)
                return;
            marketCube.style.setProperty('--top-bg-x', cube.div.style.getPropertyValue('--top-bg-x'));
            marketCube.style.setProperty('--top-bg-y', cube.div.style.getPropertyValue('--top-bg-y'));
            marketCube.style.setProperty('--top-bg-z', cube.div.style.getPropertyValue('--top-bg-z'));
            var goTo = marketCube.cloneNode(true);
            goTo.style.width = marketCubeSize + 'px';
            goTo.style.height = marketCubeSize + 'px';
            goTo.style.opacity = '0';
            goTo.classList.add('animating-cube');
            _this.cubesContainer.appendChild(goTo);
            _this.gameui.placeOnObject(goTo, marketCube);
            animatingCubes[cube.cube_id] = true;
            cube.div.style.width = pyramidCubeSize + 'px';
            cube.div.style.height = pyramidCubeSize + 'px';
            cube.div.style.minWidth = marketCubeSize + 'px'; //so that the shrinking animation happens half way
            cube.div.style.minHeight = marketCubeSize + 'px';
            cube.div.classList.add('animating-cube');
            undoAnimArray.push(_this.gameui.animationHandler.animateProperty({
                node: cube.div,
                properties: { width: marketCubeSize / 2, height: marketCubeSize / 2, left: goTo.offsetLeft, top: goTo.offsetTop },
                duration: 450 + Math.floor(Math.random() * 50),
                delay: Math.floor(Math.random() * 50),
                easing: 'circleOut',
                onEnd: function () {
                    goTo.remove();
                    cube.div.remove();
                    marketCube.removeAttribute('built-status');
                    delete animatingCubes[cube.cube_id];
                    if (Object.keys(animatingCubes).length == 0) {
                        _this.enableBuildPyramid();
                    }
                }
            }));
        });
        // Remove cubes from pyramidData that match IDs in cubesInConstruction
        this.pyramidData = this.pyramidData.filter(function (cube) {
            return !Object.values(_this.cubesInConstruction).some(function (constructionCube) {
                return constructionCube.cube_id === cube.cube_id;
            });
        });
        this.cubesInConstruction = {};
        this.unplacedCube = null;
        this.owner.are_cubes_built = false;
        this.gameui.ajaxAction('actUndoBuildPyramid', {}, true, false);
        var fadeInDiscardedCubesAnimArray = [];
        marketTile.querySelectorAll('.a-cube[built-status="discarded-cube"]').forEach(function (cube) {
            fadeInDiscardedCubesAnimArray.push(_this.gameui.animationHandler.animateProperty({
                node: cube,
                duration: 400,
                properties: { opacity: 1 },
                onEnd: function () { cube.removeAttribute('built-status'); cube.style.opacity = null; }
            }));
        });
        var undoAnim = this.gameui.animationHandler.combine(undoAnimArray);
        var fadeInDiscardedCubesAnim = this.gameui.animationHandler.combine(fadeInDiscardedCubesAnimArray);
        if (fadeInDiscardedCubesAnimArray.length > 0)
            undoAnim = this.gameui.animationHandler.combine([undoAnim, fadeInDiscardedCubesAnim]);
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
        centerPointDiv.remove();
        var midPointX = (contentsRect.maxX + contentsRect.minX) / 2;
        var midPointY = (contentsRect.maxY + contentsRect.minY) / 2;
        var offsetX = centerPoint.x - midPointX;
        var offsetY = centerPoint.y - midPointY;
        if (this.centerTilesAnim) {
            this.centerTilesAnim.stop();
            this.centerTilesAnim = null;
        }
        var pyramidCubeSize = parseInt(getComputedStyle(document.body).getPropertyValue('--pyramid-cube-size'));
        offsetX -= pyramidCubeSize * 0.16; //move slightly left to make up for right-side of cubes
        if (doAnimate) {
            this.centerTilesAnim = this.gameui.animationHandler.animateProperty({
                node: this.cubesContainer,
                duration: 400, //make animation 1 sec faster so the clicks near the end also work
                properties: { marginLeft: offsetX, marginTop: offsetY }
            });
            this.centerTilesAnim.start();
        }
        else {
            this.cubesContainer.style.marginLeft = offsetX + 'px';
            this.cubesContainer.style.marginTop = offsetY + 'px';
        }
    };
    PyramidHandler.prototype.arrangeCubesZIndex = function () {
        var cubes = Array.from(this.cubesContainer.querySelectorAll('.a-cube, .pyramid-cube-snap-point, .switch-color-button'));
        cubes.sort(function (a, b) {
            var posZA = parseInt(a.getAttribute("pos-z"));
            var posZB = parseInt(b.getAttribute("pos-z"));
            var posXA = parseInt(a.getAttribute("pos-x"));
            var posXB = parseInt(b.getAttribute("pos-x"));
            var posYA = parseInt(a.getAttribute("pos-y"));
            var posYB = parseInt(b.getAttribute("pos-y"));
            if (posZA !== posZB)
                return posZA - posZB;
            if (a.classList.contains('pyramid-cube-snap-point'))
                return -1;
            if (b.classList.contains('pyramid-cube-snap-point'))
                return 1;
            if (posXA !== posXB)
                return posXA - posXB;
            return posYB - posYA;
        });
        var zIndex = 1;
        cubes.forEach(function (cube) {
            cube.style.zIndex = zIndex.toString();
            zIndex++;
        });
    };
    PyramidHandler.prototype.displaySwitchColorButton = function () {
        var _this = this;
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(function (el) { return el.remove(); });
        if (!this.unplacedCube)
            return;
        if (Object.keys(this.cubesInConstruction).length >= this.gameui.CUBES_PER_MARKET_TILE)
            return;
        var availableColors = this.getAvailableColorsOnMarketTile();
        var availableColorsDict = {};
        availableColors.forEach(function (color) { availableColorsDict[color] = 1; });
        availableColorsDict[this.unplacedCube.color] = 1;
        if (this.unplacedCube.pos_z > 0) {
            var neighborColors = this.getCubeNeighborColors(this.unplacedCube);
            var filteredColors_1 = {};
            neighborColors.forEach(function (color) {
                if (color in availableColorsDict)
                    filteredColors_1[color] = 1;
            });
            availableColorsDict = filteredColors_1;
        }
        var possibleColors = Object.keys(availableColorsDict);
        if (possibleColors.length <= 1)
            return;
        var possibleColorsString = possibleColors.join('_');
        var switchColorButton = document.createElement('div');
        switchColorButton.innerHTML = "<div class=\"switch-color-button\" pos-x=\"".concat(this.unplacedCube.pos_x, "\" pos-y=\"").concat(this.unplacedCube.pos_y, "\" pos-z=\"").concat(this.unplacedCube.pos_z, "\" possible-colors=\"").concat(possibleColorsString, "\" ><i class=\"fa6 fa6-exchange switch-color-icon\"></i></div>");
        switchColorButton = switchColorButton.firstElementChild;
        this.cubesContainer.appendChild(switchColorButton);
        switchColorButton.style.opacity = '0.82';
        switchColorButton.addEventListener('click', function () { return _this.onSwitchColorButtonClicked(); });
    };
    PyramidHandler.prototype.onSwitchColorButtonClicked = function () {
        var myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if (!myPyramid)
            return;
        var switchColorButton = this.cubesContainer.querySelector('.switch-color-button');
        var nextCubeData = this.getNextUnplacedMarketCube(switchColorButton.getAttribute('possible-colors'), this.unplacedCube.color);
        delete this.cubesInConstruction[this.unplacedCube.cube_id];
        this.unplacedCube.cube_id = nextCubeData.cube_id;
        this.unplacedCube.color = nextCubeData.color;
        this.unplacedCube.div.setAttribute('color', nextCubeData.color);
        this.unplacedCube.div.setAttribute('cube-id', nextCubeData.cube_id);
        this.cubesInConstruction[nextCubeData.cube_id] = this.unplacedCube;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube[built-status="selected-cube"]').forEach(function (cube) { cube.removeAttribute('built-status'); });
        marketTile.querySelector('.a-cube[cube-id="' + nextCubeData.cube_id + '"]').setAttribute('built-status', 'selected-cube');
        this.gameui.ajaxAction('actPyramidCubeColorSwitched', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
        this.drawSnapPoints(); //newly placed block might have allowed placement of a same color cube on top of this cube
        this.arrangeCubesZIndex();
        this.updatePyramidStatusText(); //with the new cube color, possible positions might have changed which will change the confirm button text
    };
    PyramidHandler.prototype.getNextUnplacedMarketCube = function (possibleColorsString, currentColor) {
        if (currentColor === void 0) { currentColor = null; }
        var possibleColors = possibleColorsString.split('_');
        var nextColor = currentColor === null ? possibleColors[0] : possibleColors[(possibleColors.indexOf(currentColor) + 1) % possibleColors.length];
        var collectedMarketTileIndex = this.owner.getCollectedMarketTileData().collected_market_index;
        var marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        var nextCubeDiv = marketTile.querySelector(".a-cube:not([built-status])[color=\"".concat(nextColor, "\"]"));
        if (!nextCubeDiv)
            return null;
        var cubeID = nextCubeDiv.getAttribute('cube-id');
        var cubeData = this.gameui.marketHandler.getCubesOfMarketTile(collectedMarketTileIndex).find(function (cube) { return cube.cube_id === cubeID; });
        return cubeData;
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
        this.addTooltipToBonusCards('market');
        this.addTooltipToTurnOrder();
    }
    TooltipHandler.prototype.addTooltipToBonusCards = function (where) {
        var _this = this;
        var container = where === 'market' ? this.gameui.marketHandler.getBonusCardIconsContainer() : document.querySelector('.end-game-score-container');
        var bonusCardIcons = container.querySelectorAll('.a-bonus-card-icon');
        bonusCardIcons.forEach(function (cardIcon) {
            var cardIconID = cardIcon.getAttribute('id');
            var cardID = cardIcon.getAttribute('bonus-card-id');
            var tooltipHTML = bga_format(_this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text, { '*': function (t) { return '<b>' + t + '</b>'; } });
            var rightPlayerDiv = _this.gameui.rightPlayerID ? '(' + _this.gameui.divColoredPlayer(_this.gameui.rightPlayerID, { 'class': 'tooltip-bold' }, false) + ')' : '';
            tooltipHTML = tooltipHTML.replace('${rightPlayer}', rightPlayerDiv);
            _this.gameui.addTooltipHtml(cardIconID, "<div class=\"bonus-card-tooltip tooltip-wrapper\" bonus-card-id=\"".concat(cardID, "\">\n                        <div class=\"tooltip-text\">").concat(tooltipHTML, "</div>\n                        <div class=\"tooltip-card tooltip-bonus-card\"></div>\n                        <div class=\"tooltip-card tooltip-cubes-card\"></div>\n                    </div>"), 400);
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
