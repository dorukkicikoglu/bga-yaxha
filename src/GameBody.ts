// @ts-ignore
GameGui = (function () { // this hack required so we fake extend GameGui
    function GameGui() {}
    return GameGui;
  })();

class GameBody extends GameGui { 
    private imageLoader: ImageLoadHandler;
    public animationHandler: AnimationHandlerPromiseBased;
    public marketHandler: MarketHandler;
    public tooltipHandler: TooltipHandler;
    public logMutationObserver: LogMutationObserver;
    public myself: PlayerHandler;
    public endGameScoringHandler: EndGameScoringHandler;
    public backgroundHandler: BackgroundHandler;

    public players: Record<number, PlayerHandler> = {};
    public CUBE_COLORS: CubeColor[];
    public BONUS_CARDS_DATA: { [key: number]: BonusCardData };
    public MARKET_TILE_COLORS: string[];
    public PYRAMID_MAX_SIZE: number;
    public CUBES_PER_MARKET_TILE: number;
    public CUBE_COUNT_IN_GAME: number;

    public playerSeatOrder: number[];
    public nextPlayerTable: Record<number, number>;
    public rightPlayerID: number;

    constructor() {
        super();

        console.log('yaxha constructor');
    }
     
    public setup(gamedatas: any) {
        console.log( "Starting game setup" );

        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;
        this.MARKET_TILE_COLORS = gamedatas.MARKET_TILE_COLORS;
        this.PYRAMID_MAX_SIZE = gamedatas.PYRAMID_MAX_SIZE;
        this.CUBES_PER_MARKET_TILE = gamedatas.CUBES_PER_MARKET_TILE;
        this.CUBE_COUNT_IN_GAME = gamedatas.CUBE_COUNT_IN_GAME;
        this.nextPlayerTable = gamedatas.nextPlayerTable;
        this.rightPlayerID = gamedatas.nextPlayerTable[this.player_id] ?? null;

        if(this.rightPlayerID){
            this.playerSeatOrder = [parseInt(this.player_id)];
            let nextPlayerID = this.rightPlayerID;
            while(nextPlayerID != parseInt(this.player_id)) {
                this.playerSeatOrder.push(nextPlayerID);
                nextPlayerID = this.nextPlayerTable[nextPlayerID];
            }
        } else this.playerSeatOrder = Object.keys(gamedatas.players).map(Number); //spectator

        let cubeColorCSS = '';
        for(let colorIndex in this.CUBE_COLORS){
            cubeColorCSS += `.a-cube[color="${colorIndex}"] { --cube-color: #${this.CUBE_COLORS[colorIndex].colorCode}; }
            `;
        }

        const pyramidCSSRange = [];
        for (let i = -1 * (this.PYRAMID_MAX_SIZE - 1); i <= this.PYRAMID_MAX_SIZE - 1; i++)
            pyramidCSSRange.push(i);

        let pyramidCSS = '';
            pyramidCSSRange.forEach(posXY => {
                pyramidCSSRange.forEach(posZ => {
                    pyramidCSS += `
                    .pyramids-container .a-pyramid-container .cubes-container *[pos-z="${posZ}"][pos-x="${posXY}"] {
                    left: calc(var(--pyramid-cube-size) * ${posXY + 0.42 * posZ});
                    }
                    .pyramids-container .a-pyramid-container .cubes-container *[pos-z="${posZ}"][pos-y="${posXY}"] {
                    bottom: calc(var(--pyramid-cube-size) * ${posXY + 0.7 * posZ});
                    }
                    `;
                });
            });

        let cubeTextureCSS = '';
        for(let i = 0; i < this.CUBE_COUNT_IN_GAME; i++)
            cubeTextureCSS += `
                .a-cube[cube-id="${i}"] .top-side{ background-position: ${Math.random() * 100}% ${Math.random() * 100}%, 0 0; }
                .a-cube[cube-id="${i}"] .right-side{ background-position: ${Math.random() * 100}% ${Math.random() * 100}%; }
                .a-cube[cube-id="${i}"] .bottom-side{ background-position: ${Math.random() * 100}% ${Math.random() * 100}%; }
            `;

        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', `
            <style>
                ${cubeColorCSS}
                ${pyramidCSS}
                ${cubeTextureCSS}
            </style>
            <div id="player-tables">
            <div class="market-container">
                <div class="market-tiles-container">
                    <div class="waiting-players-container"></div>
                </div>
                <div class="bonus-cards-container"></div>
            </div>
            <div class="pyramids-container"></div>
        </div>`);

        this.imageLoader = new ImageLoadHandler(this, ['market-tiles', 'player-order-tiles', 'bonus-cards', 'bonus-card-icons']);
        this.animationHandler = new AnimationHandlerPromiseBased(this);

        for(let player_id of this.playerSeatOrder) {
            const {name, color, player_no, turn_order, are_cubes_built, zombie} = this.gamedatas.players[player_id];
            this.players[player_id] = new PlayerHandler(this, player_id, name, color, parseInt(player_no), parseInt(zombie) == 1, turn_order, gamedatas.pyramidData[player_id], are_cubes_built == '1');

            if(player_id == parseInt(this.player_id))
                this.myself = this.players[player_id];
        }

        this.MARKET_TILE_COLORS.forEach((color, index) => {
            document.documentElement.style.setProperty(`--market-tile-color-${index}`, `#${color}`);
        });
        
        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs, gamedatas.collectedMarketTilesData);

        this.tooltipHandler = new TooltipHandler(this);
        this.logMutationObserver = new LogMutationObserver(this);
        this.endGameScoringHandler = new EndGameScoringHandler(this);
        this.backgroundHandler = new BackgroundHandler(this);

        if(gamedatas.hasOwnProperty('endGameScoring'))
             this.endGameScoringHandler.displayEndGameScore(gamedatas.endGameScoring);

        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    public async onEnteringState(stateName: string, args: any) {
        console.log( 'Entering state: '+stateName, args );

        switch( stateName )
        {
            case 'allSelectMarketTile':
                if(!this.myself)
                    return;

                this.marketHandler.addSelectableClassToMarketTiles();
            break;
            case 'buildPyramid':
                this.marketHandler.closeWaitingPlayersContainer();
                if(this.myself)
                    this.myself.pyramid.enableBuildOnEnteringState();
            break;
            case 'individualPlayerSelectMarketTile':
                if(this.myself)
                    this.myself.pyramid.enableBuildOnEnteringState();
            break;
            case 'gameEnd':
                this.backgroundHandler.stopEyesRainbow();
            break;
        }
    }

    public onLeavingState(stateName: string) {
        console.log( 'Leaving state: '+stateName );
        this.marketHandler.getMarketTiles().forEach(tile => { tile.classList.remove('selected-market-tile', 'selectable-market-tile'); });
        
        switch( stateName )
        {
            case 'buildPyramid':
                if(this.myself)
                    this.myself.pyramid.disableAndShrinkIfMobile();
            break;
            case 'allPyramidsBuilt':
                this.marketHandler.resetCollectedMarketTilesData();
            break;
        }
    }

    public onUpdateActionButtons(stateName: string, args: any) {
        console.log( 'onUpdateActionButtons: '+stateName, args );
                    
        switch( stateName )
        {
            case 'allSelectMarketTile':
                this.marketHandler.updateStatusTextUponMarketTileSelection();
            break;
            case 'individualPlayerSelectMarketTile':
                this.marketHandler.clearZombiePendingAvatars(this.getActivePlayerId());
                if(this.myself && this.isCurrentPlayerActive())
                    this.marketHandler.addSelectableClassToMarketTiles(args.possible_market_indexes);
            break;
            case 'buildPyramid':
                if(this.myself)
                    this.myself.pyramid.updatePyramidStatusText();
            break;
        }
    }

    //utility functions

    private format_string_recursive(log, args) {
        try {
            log = _(log);
            if (log && args && !args.processed) {
                args.processed = true;

                // list of special keys we want to replace with images
                const keys = ['textPlayerID', 'REVEALED_MARKET_TILES_DATA_STR', 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR', 'SWAP_TURN_ORDERS_DATA_STR', 'DISPLAY_BUILT_CUBES_STR', 'LOG_CLASS'];
                for(let key of keys) {
                    if(key in args) {
                        if(key == 'textPlayerID')
                            args['textPlayerID'] = this.divColoredPlayer(args['textPlayerID']);
                        else if(key == 'REVEALED_MARKET_TILES_DATA_STR')
                            args['REVEALED_MARKET_TILES_DATA_STR'] = this.logMutationObserver.createLogSelectedMarketTiles(args['collectedMarketTilesData']);
                        else if(key == 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR')
                            args['INDIVIDUAL_MARKET_TILES_COLLECTION_STR'] = this.logMutationObserver.createLogIndividualMarketTileCollection(args.player_id, args.collected_market_index, args.collected_cubes);
                        else if(key == 'DISPLAY_BUILT_CUBES_STR')
                            args['DISPLAY_BUILT_CUBES_STR'] = this.logMutationObserver.createLogDisplayBuiltCubes(args['built_cubes']);
                        else if(key == 'SWAP_TURN_ORDERS_DATA_STR')
                            args['SWAP_TURN_ORDERS_DATA_STR'] = this.logMutationObserver.createLogSwapTurnOrders(args['swapData']);
                        else if(key == 'LOG_CLASS')
                            log = log + '<div log-class-tag="' + args['LOG_CLASS'] + '"></div>';
                    }
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
    public divYou(attributes = {}): string {
        let color = this.gamedatas.players[this.player_id].color;
        let color_bg = "";
        if (this.gamedatas.players[this.player_id] && this.gamedatas.players[this.player_id].color_back) {
            color_bg = "background-color:#" + this.gamedatas.players[this.player_id.toString()].color_back + ";";
        }
        attributes['player-color'] = color;
        let html = "<span style=\"font-weight:bold;color:#" + color + ";" + color_bg + "\" " + this.getAttributesHTML(attributes) + ">" + __("lang_mainsite", "You") + "</span>";
        return html;
    }
    public divColoredPlayer(player_id, attributes = {}, detectYou = true): string {
        if(detectYou && parseInt(player_id) === parseInt(this.player_id))
            return this.divYou(attributes);

        player_id = player_id.toString();

        let color = this.gamedatas.players[player_id].color;
        let color_bg = "";
        if (this.gamedatas.players[player_id] && this.gamedatas.players[player_id].color_back) {
            color_bg = "background-color:#" + this.gamedatas.players[player_id].color_back + ";";
        }
        attributes['player-color'] = color;
        let html = "<span style=\"color:#" + color + ";" + color_bg + "\" " + this.getAttributesHTML(attributes) + ">" + this.gamedatas.players[player_id].name + "</span>";
        return html;
    }
    public divActivePlayer(attributes = {}, detectYou = true): string {
        const activePlayerID = this.getActivePlayerId();
        if(!activePlayerID)
            return null;
        return this.divColoredPlayer(activePlayerID, attributes, detectYou);
    }
    private getAttributesHTML(attributes): string{ return Object.entries(attributes || {}).map(([key, value]) => `${key}="${value}"`).join(' '); }
    public getPos(node: HTMLDivElement): DOMRect { 
        let pos = this.getBoundingClientRectIgnoreZoom(node); 
        pos.w = pos.width; pos.h = pos.height; 
        return pos;
    }
    public isDesktop(): boolean { return document.body.classList.contains('desktop_version'); }
    public isMobile(): boolean { return document.body.classList.contains('mobile_version'); }
    public clickOrTap(capitalized: boolean = false): string { if(capitalized) { return this.capitalizeFirstLetter(this.clickOrTap()); } return this.isDesktop() ? 'click' : 'tap'; }
    public capitalizeFirstLetter(str: string): string { return `${str[0].toUpperCase()}${str.slice(1)}`; }

    public updateStatusText(statusText): void{ $('gameaction_status').innerHTML = statusText; $('pagemaintitletext').innerHTML = statusText; }
    public ajaxAction(action: string, args: Record<string, any> = {}, lock: boolean = true, checkAction: boolean = true): void{
        args.version = this.gamedatas.version;
        this.bgaPerformAction(action, args, { lock: lock, checkAction: checkAction });
    }
    public isReplay(): boolean { return typeof g_replayFrom != 'undefined' || g_archive_mode; }
    public remove_px(str: string): number {
        str = str.trim();
        if (!isNaN(parseInt(str)) && str === parseInt(str).toString())
            return parseInt(str);
        const result = parseInt(str.toLowerCase().replace(/px/g, ''));
        return isNaN(result) ? 0 : result;
    }
    public placeOnObject(mobileObj: HTMLDivElement, targetObj: HTMLDivElement, forceBoundingClientRect: boolean = false): void {
        mobileObj.style.left = '0px';
        mobileObj.style.top = '0px';

        // Get current positions
        const mobileWithinPageContent = document.getElementById('page-content').contains(mobileObj);
        const targetWithinPageContent = document.getElementById('page-content').contains(targetObj);
        
        let targetRect = mobileWithinPageContent ? this.getPos(targetObj) : targetObj.getBoundingClientRect();
        let mobileRect = targetWithinPageContent ? this.getPos(mobileObj) : mobileObj.getBoundingClientRect();
        
        if(forceBoundingClientRect){
            targetRect = targetObj.getBoundingClientRect();
            mobileRect = mobileObj.getBoundingClientRect();
        }

        // Calculate the difference in position
        const deltaX = targetRect.left - mobileRect.left;
        const deltaY = targetRect.top - mobileRect.top;

        // Get current position values
        const currentLeft = parseFloat(mobileObj.style.left || '0');
        const currentTop = parseFloat(mobileObj.style.top || '0');

        // Apply the position difference to current position
        mobileObj.style.left = (currentLeft + deltaX) + 'px';
        mobileObj.style.top = (currentTop + deltaY) + 'px';
    }
    public rgbToHex(rgb: string): string { // Extract the numeric values using a regex
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match){
            console.error('-- rgb --', rgb);
            throw new Error("Invalid RGB format");
        }

        // Convert each component to a two-character hexadecimal
        const [, r, g, b] = match;
        return [r, g, b]
            .map((num) => {
                const hex = parseInt(num, 10).toString(16);
                return hex.padStart(2, '0'); // Ensure two digits
            })
            .join(''); // Combine into a single string
    }
    public hexToRgb(hex: string): string { return hex.replace('#', '').match(/.{1,2}/g).map(x => parseInt(x, 16)).join(','); }
    public dotTicks(waitingTextContainer: HTMLDivElement){
        let dotInterval: number;

        let loaderSpan = dojo.create('span', {class: 'loader-span', style: 'display: inline-block; width: 24px; text-align: left;', dots: 0});
        dojo.place(loaderSpan, waitingTextContainer, 'after');

        let dotTick = () => {
            if (!document.body.contains(waitingTextContainer)) 
                return clearInterval(dotInterval);

            let dotCount = parseInt(dojo.attr(loaderSpan, 'dots'));
            loaderSpan.innerHTML = '.'.repeat(dotCount);

            dojo.attr(loaderSpan, 'dots', (dotCount + 1) % 4);
        }
        dotTick();
        dotInterval = setInterval(dotTick, 500);
    }
    public getContentsRectangle(node: HTMLDivElement, excludeClass: string | null = null): ContentsRectangle | null {
        const children = node.children;

        if (children.length === 0)
            return null; // No children, return coordinates (0,0)

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const child of Array.from(children)) {
            if (excludeClass && child.classList.contains(excludeClass))
                continue;
            
            let rect = this.getPos(child as HTMLDivElement);

            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        }

        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY, width: maxX - minX, height: maxY - minY };
    }

    //game specific utility functions
    public createCubeDiv(cube: BaseCube): HTMLDivElement {
        const cubeDiv = document.createElement('div');
        cubeDiv.className = 'a-cube';
        cubeDiv.innerHTML = '<div class="cube-background"></div><div class="top-side"></div><div class="right-side"></div><div class="bottom-side"></div>';
        cubeDiv.setAttribute('cube-id', cube.cube_id.toString());
        cubeDiv.setAttribute('color', cube.color.toString());

        return cubeDiv;
    }

    //notification functions

    public setupNotifications() {
        console.log('notifications subscriptions setup');

        this.bgaSetupPromiseNotifications();
    }

    // Add the notification handler
    public async notif_marketIndexSelectionConfirmed(args: { confirmed_selected_market_index: number }) {
        console.log('notif_marketIndexSelectionConfirmed', args);
        await this.marketHandler.marketTileSelected(args.confirmed_selected_market_index);
    }

    public async notif_marketIndexSelectionReverted() {
        console.log('notif_marketIndexSelectionReverted');
        await this.marketHandler.marketTileSelected(null);
    }

    public async notif_animateAllMarketTileSelections(args) {
        console.log('notif_animateAllMarketTileSelections');
        await this.marketHandler.animateAllMarketTileSelections(args.collectedMarketTilesData);
    }

    public async notif_individualPlayerCollected(args) {
        console.log('notif_individualPlayerCollected');
        await this.marketHandler.animateIndividualPlayerCollected(args.player_id, args.collected_market_index);
    }
    
    public async notif_confirmedBuildPyramid(args) {
        console.log('notif_confirmedBuildPyramid');
        await this.myself.pyramid.confirmedBuildPyramid();
    }

    public async notif_displayBuiltCubes(args) {
        console.log('notif_displayBuiltCubes');
        await this.marketHandler.animateBuiltCubes(args.built_cubes);
    }

    public async notif_newCubesDrawn(args) {
        console.log('notif_newCubesDrawn');
        await this.marketHandler.animateNewCubesDrawn(args.marketData);
    }

    public async notif_swapTurnOrders(args) {
        console.log('notif_swapTurnOrders');

        await this.marketHandler.animateSwapTurnOrders(args.swapData);
    }

    public async notif_displayEndGameScore(args) {
        console.log('notif_displayEndGameScore');

        await this.endGameScoringHandler.displayEndGameScore(args.endGameScoring);
    }

    public async notif_zombieIndividualPlayerCollection(args) {
        console.log('notif_zombieIndividualPlayerCollection');
        this.players[args.player_id].setZombie(true);
        await this.marketHandler.zombieIndividualPlayerCollection(args.player_id);
    }
}

interface BaseCube {
    color: string;
    cube_id: string;
}

interface MarketCube extends BaseCube {
    market_index: string;
    location: 'market' | 'pyramid' | 'to_discard';
}

interface PyramidCube extends BaseCube {
    pos_x: number;
    pos_y: number;
    pos_z: number;
    order_in_construction: number;
    div: HTMLDivElement;
}

interface CubeColor {
    name: string;
    colorCode: string;
}

interface CubeToPyramidMoveData extends BaseCube {
    owner_id: number;
    pos_x: number;
    pos_y: number;
    pos_z: number;
}

interface BonusCardData {
    id: number;
    tooltip_text: string;
}

interface CollectedMarketTilesData {
    player_id: number;
    selected_market_index: number;
    collected_market_index: number;
    turn_order: number;
    type: 'collecting' | 'pending' | 'market_inactive' | 'zombie';
}

interface SwapTurnOrdersData {
    player_id: number;
    turn_order: number;
}

interface ContentsRectangle {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

interface PossibleMove {
    pos_x: number;
    pos_y: number;
    pos_z: number;
    possible_colors: string[];
}

interface PlayerScore {
    player_id: number;
    color_points: { [color_index: number]: number };
    bonus_card_points: {bonus_card_id: number, bonus_card_points: number} [];
    total: number;
}

interface EndGameScoreData {
    winner_ids: number[];
    player_scores: { [player_id: number]: PlayerScore };
}
