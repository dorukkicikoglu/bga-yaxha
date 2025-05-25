interface LogRowData { //this is used to return strings containing log-class-tag divs
    log_html: string;
    log_class: string;
}

class LogMutationObserver{
	private nextTimestampValue:string = '';

    constructor(private gameui: GameBody) {
		this.observeLogs();
    }

    private observeLogs(): void{
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: HTMLDivElement) => {
                        if (node.nodeType === 1 && node.tagName.toLowerCase() === 'div' && node.classList.contains('log')){
                            this.processLogDiv(node);
                        }
                    });
                }
            });
        });

        // Configure the MutationObserver to observe changes to the container's child nodes
        const config = {
            childList: true,
            subtree: true // Set to true if you want to observe all descendants of the container
        };

        // Start observing the container
        observer.observe($('logs'), config);
        observer.observe($('chatbar'), config); //mobile notifs

        if(g_archive_mode){ //to observe replayLogs that appears at the bottom of the page on replays
            let replayLogsObserverStarted = false;
            const replayLogsObserver = new MutationObserver((mutations, obs) => {
              for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node: HTMLDivElement) => {
                        if(!replayLogsObserverStarted && node instanceof HTMLElement && node.id.startsWith('replaylogs')) {
                            this.processLogDiv(node);
                        }
                    });
                }
              }
            });
            replayLogsObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    private processLogDiv(node: HTMLDivElement): void{
        const classTags: HTMLDivElement[] = Array.from(node.querySelectorAll('*[log-class-tag]'));

        for(const classTag of classTags){
            const logClassName: string = classTag.getAttribute('log-class-tag');

            let parentLog: HTMLDivElement = null;
            let current: HTMLDivElement = classTag;
            while (current) {
                if (current.classList.contains('gamelogreview') || current.classList.contains('log')) {
                    parentLog = current;
                    break;
                }
                current = current.parentElement as HTMLDivElement;
            }

            if(parentLog)
                parentLog.classList.add('a-game-log', logClassName);
        }

        classTags.forEach(classTag => classTag.remove());
        
        node.querySelectorAll('.playername').forEach((playerName: HTMLElement) => {
            playerName.setAttribute('player-color', this.gameui.rgbToHex(window.getComputedStyle(playerName).color));
        });

        if(this.gameui.isDesktop() && node.classList.contains('a-game-log')){
            let timestamp: HTMLDivElement[] = Array.from(node.querySelectorAll('.timestamp'));
            if(timestamp.length > 0){
                this.nextTimestampValue = timestamp[0].innerText;
            } else if(this.observeLogs.hasOwnProperty('nextTimestampValue')){
                let newTimestamp: HTMLDivElement = document.createElement('div');
                newTimestamp.classList.add('timestamp');
                newTimestamp.innerHTML = this.nextTimestampValue;

                node.appendChild(newTimestamp);
            }
        }
    }

    private addLogClassTag(logHTML: string, logClass: string): LogRowData { return { log_html: logHTML + `<div log-class-tag="${logClass}"></div>`, log_class: logClass }; }

    public createLogSelectedMarketTiles(cardsData: {collectingPlayers: CollectedMarketTilesData[], pendingPlayers: CollectedMarketTilesData[]}): LogRowData {
        let logHTML = '';

        cardsData.collectingPlayers.sort((a, b) => a.turn_order - b.turn_order);
        cardsData.pendingPlayers.sort((a, b) => a.turn_order - b.turn_order);

        const createPlayerRow = (cardData, isCollecting = true) => {
            const cubesHTML = isCollecting ? '&nbsp; <div class="log-cubes-wrapper">' + cardData.collected_cubes.map(cube => this.gameui.createCubeDiv(cube).outerHTML).join('') + '</div>' : '';
            let playerRowHTML = `
                <div class="player-selected-market-tile-row ${isCollecting ? 'collecting' : 'pending'}">
                    ${this.gameui.divColoredPlayer(cardData.player_id, {class: 'playername'}, false)}
                    <i class="log-arrow log-arrow-left fa6 ${isCollecting ? 'fa-arrow-left' : 'fa-ban'}"></i>
                    <div class="a-market-tile-icon" market-index="${cardData.selected_market_index}"></div>
                    ${cubesHTML}
                </div>
            `;

            return playerRowHTML;
        };

        cardsData.collectingPlayers.forEach(cardData => { logHTML += createPlayerRow(cardData, true); });
        cardsData.pendingPlayers.forEach(cardData => { logHTML += createPlayerRow(cardData, false); });
        logHTML = `<div class="market-interaction-rows-wrapper">${logHTML}</div>`;

        return this.addLogClassTag(logHTML, 'all-selected-tiles-log');
    }

    public createLogIndividualMarketTileCollection(player_id: number, collected_market_index: number, collected_cubes: BaseCube[]): LogRowData {
        let logHTML = `<div class="player-collected-market-tile-row collecting">${this.gameui.divColoredPlayer(player_id, {class: 'playername'}, false)}<i class="log-arrow log-arrow-left fa6 fa-arrow-left"></i><div class="a-market-tile-icon" market-index="${collected_market_index}"></div></div>` + ' &nbsp; <div class="log-cubes-wrapper">' + collected_cubes.map(cube => this.gameui.createCubeDiv(cube).outerHTML).join('') + '</div>';
        return this.addLogClassTag(logHTML, 'individual-collected-tiles-log');
    }

    public createLogDisplayBuiltCubes(built_cubes: { [key: number]: CubeToPyramidMoveData[] }): LogRowData {
        let logHTML = '';

        for(const playerID in this.gameui.players){
            let cubesHTML = '';

            if (!built_cubes[playerID]) {
                console.error(`No built cubes data found for player ${playerID} (likely a zombie player)`, this.gameui.players[playerID]);
                continue;
            }

            // Sort cubes by counting and ordering colors
            const colorCounts = built_cubes[playerID].reduce((counts, cube) => {
                counts[cube.color] = (counts[cube.color] || 0) + 1;
                return counts;
            }, {});

            built_cubes[playerID].sort((a, b) => {
                // First sort by color frequency (descending)
                const countDiff = colorCounts[b.color] - colorCounts[a.color];
                if (countDiff !== 0) return countDiff;
                // If same frequency, sort by color value
                return Number(b.color) - Number(a.color);
            });

            for(const cube of built_cubes[playerID])
                cubesHTML += this.gameui.createCubeDiv(cube).outerHTML;
            
            logHTML += `<div class="player-built-cubes-row">
            ${this.gameui.divColoredPlayer(playerID, {class: 'playername'}, false)}
            <i class="log-arrow log-place-cube-icon fa6 fa-download"></i>
            <div class="log-cubes-wrapper">${cubesHTML}</div>
            </div>`;
        }

        logHTML = `<div class="built-cubes-rows-wrapper">${logHTML}</div>`;

        return this.addLogClassTag(logHTML, 'display-built-cubes-log');
    }

    public createLogSwapTurnOrders(swapData: SwapTurnOrdersData[]): LogRowData {
        let logHTML = `${this.gameui.divColoredPlayer(swapData[0].player_id, {class: 'playername swapper-name'}, false)} 
        <div class="turn-order-container-wrapper"><div class="turn-order-container" turn-order="${swapData[1].turn_order}"></div></div>
        <i class="log-arrow log-arrow-exchange fa6 fa-exchange"></i> 
        <div class="turn-order-container-wrapper"><div class="turn-order-container" turn-order="${swapData[0].turn_order}"></div></div>
        ${this.gameui.divColoredPlayer(swapData[1].player_id, {class: 'playername swapper-name'}, false)}`;

        return this.addLogClassTag(logHTML, 'swap-turn-orders-log');
    }
}