// @ts-ignore
GameGui = (function () { // this hack required so we fake extend GameGui
    function GameGui() {}
    return GameGui;
  })();

class GameBody extends GameGui { 
    public marketHandler: MarketHandler;
    public tooltipHandler: TooltipHandler;
    public logMutationObserver: LogMutationObserver;

    public players: Record<number, PlayerHandler> = {};
    public CUBE_COLORS: { [key: number]: CubeColor };
    public BONUS_CARDS_DATA: { [key: number]: BonusCardData };

    constructor() {
        super();

        console.log('yaxha constructor');
    }
     
    public setup(gamedatas: any) {
        console.log( "Starting game setup" );

        //ekmek minified images'i yap

        document.getElementById('game_play_area').insertAdjacentHTML('beforeend', `<div id="player-tables">
            <div class="market-container">
                <div class="market-tiles-container"></div>
                <div class="bonus-cards-container"></div>
            </div>    
        </div>`);

        for(let player_id in gamedatas.players) {
            const {name, color, player_no, turn_order} = this.gamedatas.players[player_id];
            this.players[player_id] = new PlayerHandler(this, parseInt(player_id), name, color, parseInt(player_no), turn_order);
        }

        this.CUBE_COLORS = gamedatas.CUBE_COLORS;
        this.BONUS_CARDS_DATA = gamedatas.BONUS_CARDS_DATA;

        this.marketHandler = new MarketHandler(this, gamedatas.marketData, gamedatas.bonusCardIDs);

        this.tooltipHandler = new TooltipHandler(this);
        this.logMutationObserver = new LogMutationObserver(this);

        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    public onEnteringState(stateName: string, args: any) {
        console.log( 'Entering state: '+stateName, args );
    }

    public onLeavingState(stateName: string) {
        console.log( 'Leaving state: '+stateName );
    }

    public onUpdateActionButtons(stateName: string, args: any) {
        console.log( 'onUpdateActionButtons: '+stateName, args );
        
        if(this.isCurrentPlayerActive()){            
            switch( stateName )
            {
                //ekmek birgun sil
                case 'playerTurn':    
                const playableCardsIds = args.playableCardsIds; // returned by the argPlayerTurn

                // Add test action buttons in the action status bar, simulating a card click:
                playableCardsIds.forEach(
                    cardId => this.statusBar.addActionButton(_('Play card with id ${card_id}').replace('${card_id}', cardId), () => this.onCardClick(cardId))
                ); 

                this.statusBar.addActionButton(_('Pass'), () => this.bgaPerformAction("actPass"), { color: 'secondary' }); 
                break;
            }
        }
    } 

    public onCardClick( card_id ) //ekmek birgun sil
    {
        console.log( 'onCardClick', card_id );

        this.bgaPerformAction("actPlayCard", { 
            card_id,
        }).then(() =>  {                
            // What to do after the server call if it succeeded
            // (most of the time, nothing, as the game will react to notifs / change of state instead)
        });        
    }

    //utility functions

    private format_string_recursive(log, args) {
        try {
            log = _(log);
            if (log && args && !args.processed) {
                args.processed = true;

                // list of special keys we want to replace with images
                let keys = ['textPlayerID', 'LOG_CLASS', 'ARROW_LEFT', 'ARROW_DOWN', 'NO_MORE_CARDS', 'PILE_NUM']; //ekmek cok gereksiz var
                for(let key of keys) {
                    if(key in args) {
                        if(key == 'textPlayerID')
                            args['textPlayerID'] = this.divColoredPlayer(args['textPlayerID']);
                        else if(key == 'LOG_CLASS')
                            log = log + '<div log-class-tag="' + args['LOG_CLASS'] + '"></div>';
                        else if(key == 'ARROW_LEFT')
                            args['ARROW_LEFT'] = '<i class="log-arrow log-arrow-left fa6 fa-angle-double-left"></i>';
                        else if(key == 'ARROW_DOWN')
                            args['ARROW_DOWN'] = '<i class="log-arrow place-under-icon fa6 fa-share"></i>';
                        else if(key == 'PILE_NUM')
                            args['PILE_NUM'] = '';
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
    public isDesktop(): boolean { return dojo.hasClass(dojo.body(), 'desktop_version'); }
    public isMobile(): boolean { return dojo.hasClass(dojo.body(), 'mobile_version'); }
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

        //ekmek sil
        // Here you can add any visual feedback or animations
        // For example, highlighting the selected tile
        // const selectedTile = document.querySelector(`.a-market-tile[market-index="${args.confirmed_selected_market_index}"]`);
        // if (selectedTile) {
        //     selectedTile.classList.add('selected');
        //     // Wait for a short animation if needed
        //     await this.wait(500);
        //     selectedTile.classList.remove('selected');
        // }
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