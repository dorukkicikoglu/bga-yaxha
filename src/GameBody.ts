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

    public players: Record<number, PlayerHandler> = {};
    public CUBE_COLORS: { [key: number]: CubeColor };
    public BONUS_CARDS_DATA: { [key: number]: BonusCardData };
    public MARKET_TILE_COLORS: string[];
    public PYRAMID_MAX_SIZE: number;

    constructor() {
        super();

        console.log('yaxha constructor');
    }
     
    public setup(gamedatas: any) {
        console.log( "Starting game setup" );

        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', `<div id="player-tables">
            <div class="market-container">
                <div class="market-tiles-container"></div>
                <div class="waiting-players-container"></div>
                <div class="bonus-cards-container"></div>
            </div>
            <div class="pyramids-container"></div>
        </div>`);

        this.imageLoader = new ImageLoadHandler(this, ['market-tiles', 'player-order-tiles', 'bonus-cards', 'bonus-card-icons']);
        this.animationHandler = new AnimationHandlerPromiseBased(this);

        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;
        this.MARKET_TILE_COLORS = gamedatas.MARKET_TILE_COLORS;
        this.PYRAMID_MAX_SIZE = gamedatas.PYRAMID_MAX_SIZE;

        for(let player_id in gamedatas.players) {
            const {name, color, player_no, turn_order} = this.gamedatas.players[player_id];
            this.players[player_id] = new PlayerHandler(this, parseInt(player_id), name, color, parseInt(player_no), turn_order, gamedatas.pyramidData[player_id]);

            if(player_id == this.player_id)
                this.myself = this.players[player_id];
        }

        this.MARKET_TILE_COLORS.forEach((color, index) => {
            document.documentElement.style.setProperty(`--market-tile-color-${index}`, `#${color}`);
        });
        
        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs, gamedatas.playerSelectedMarketIndex, gamedatas.collectedMarketTilesData);

        this.tooltipHandler = new TooltipHandler(this);
        this.logMutationObserver = new LogMutationObserver(this);

        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    public onEnteringState(stateName: string, args: any) {
        console.log( 'Entering state: '+stateName, args );

        switch( stateName )
        {
            case 'allSelectMarketTile':
                if(args.args._private.selected_market_index === null)
                    this.marketHandler.addSelectableClassToMarketTiles('all');
                else this.marketHandler.addSelectableClassToMarketTiles('none');
            break;
        }
    }

    public onLeavingState(stateName: string) {
        console.log( 'Leaving state: '+stateName );
        this.marketHandler.marketTiles.forEach(tile => { tile.classList.remove('selected-market-tile', 'selectable-market-tile'); });
        
        switch( stateName )
        {
            case 'buildPyramid':
                if(this.myself)
                    this.myself.pyramid.disableBuildPyramid();
            break;
        }
    }

    public onUpdateActionButtons(stateName: string, args: any) {
        console.log( 'onUpdateActionButtons: '+stateName, args );
                    
        switch( stateName )
        {
            case 'allSelectMarketTile':
                this.marketHandler.updateStatusTextUponCubeSelection();
            break;
            case 'individualPlayerSelectMarketTile':
                if(this.myself) {
                    const playerCollectedMarketTile = this.marketHandler.getPlayerCollectedMarketTile(this.myself.playerID);

                    if(this.isCurrentPlayerActive())
                        this.marketHandler.addSelectableClassToMarketTiles(args.possible_market_indexes);
                    else if(playerCollectedMarketTile.type === 'collecting'){
                        this.myself.pyramid.enableBuildPyramid(args.possible_moves[this.myself.playerID]);
                        this.updateStatusText(dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), {you: this.divYou()}));
                    }
                }
            break;
            case 'buildPyramid':
                if(this.myself)
                    this.myself.pyramid.enableBuildPyramid(args.possible_moves);
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
                let keys = ['textPlayerID', 'REVEALED_MARKET_TILES_DATA_STR', 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR', 'LOG_CLASS'];
                for(let key of keys) {
                    if(key in args) {
                        if(key == 'textPlayerID')
                            args['textPlayerID'] = this.divColoredPlayer(args['textPlayerID']);
                        else if(key == 'REVEALED_MARKET_TILES_DATA_STR')
                            args['REVEALED_MARKET_TILES_DATA_STR'] = this.logMutationObserver.createLogSelectedMarketTiles(args['collectedMarketTilesData']);
                        else if(key == 'INDIVIDUAL_MARKET_TILES_COLLECTION_STR')
                            args['INDIVIDUAL_MARKET_TILES_COLLECTION_STR'] = `<div class="player-collected-market-tile-row 'collecting'">${this.divColoredPlayer(args.player_id, {class: 'playername'}, false)}<i class="log-arrow log-arrow-left fa6 fa-arrow-left"></i><div class="a-market-tile-icon" market-index="${args.collected_market_index}"></div></div>`;
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
    private getAttributesHTML(attributes): string{ return Object.entries(attributes || {}).map(([key, value]) => `${key}="${value}"`).join(' '); }
    public getPos(node: HTMLDivElement): Record<string, number> { let pos = this.getBoundingClientRectIgnoreZoom(node); pos.w = pos.width; pos.h = pos.height; return pos; }
    public isDesktop(): boolean { return document.body.classList.contains('desktop_version'); }
    public isMobile(): boolean { return document.body.classList.contains('mobile_version'); }
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
    public rgbToHex(rgb: string): string { // Extract the numeric values using a regex
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match){
            this.printDebug('-- rgb --', rgb);
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
    public printDebug(...args: any[]): void{ args[0] = typeof args[0] == 'string' ? '*** ' + args[0] : args[0]; console.log(...args); }

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
}

interface MarketCube {
    color: string;
    cube_id: string;
    location: string;
    market_index: string;
}

interface CubeColor {
    name: string;
    colorCode: string;
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
    type: 'collecting' | 'pending';
}
