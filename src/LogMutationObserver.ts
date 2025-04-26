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
        let config = {
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
        let classTag = dojo.query('*[log-class-tag]', node);
        if(classTag.length > 0){
            dojo.addClass(node, 'a-game-log ' + dojo.attr(classTag[0], 'log-class-tag'));
            classTag.forEach(dojo.destroy);
        } else if(dojo.query('.log-arrow-left, .log-arrow-right, .place-under-icon', node).length > 0) { //guarantee adding class in replay as preserve fields arent loaded
            dojo.addClass(node, 'a-game-log');
            if(dojo.query('.log-arrow-right', node).length > 0)
                dojo.addClass(node, 'selected-cards-log');
            else dojo.addClass(node, 'take-pile-log');
        }
        
        dojo.query('.playername', node).forEach((playerName) => { dojo.attr(playerName, 'player-color', this.gameui.rgbToHex(dojo.style(playerName, 'color'))); });

        if(this.gameui.isDesktop() && dojo.hasClass(node, 'a-game-log')){
            let timestamp = dojo.query('.timestamp', node);
            if(timestamp.length > 0){
                this.nextTimestampValue = timestamp[0].innerText;
            } else if(this.observeLogs.hasOwnProperty('nextTimestampValue')){
                let newTimestamp: HTMLDivElement = dojo.create('div', {class: 'timestamp'});
                newTimestamp.innerHTML = this.nextTimestampValue;
                dojo.place(newTimestamp, node);
            }
        }
    }

    public createLogSelectedMarketTiles(cardsData: {collectingPlayers: CollectedMarketTilesData[], pendingPlayers: CollectedMarketTilesData[]}): string {
        let logHTML = '';

        cardsData.collectingPlayers.sort((a, b) => a.turn_order - b.turn_order);
        cardsData.pendingPlayers.sort((a, b) => a.turn_order - b.turn_order);
        
        const createPlayerRow = (cardData, isCollecting = true) => {
            return `<div class="player-selected-market-tile-row ${isCollecting ? 'collecting' : 'pending'}">${
                this.gameui.divColoredPlayer(cardData.player_id, {class: 'playername'}, false)
            }<i class="log-arrow log-arrow-left fa6 ${isCollecting ? 'fa-arrow-left' : 'fa-ban'}"></i><div class="a-market-tile-icon" market-index="${
                cardData.selected_market_index
            }"></div></div>`;
        };

        cardsData.collectingPlayers.forEach(cardData => { logHTML += createPlayerRow(cardData, true); });
        cardsData.pendingPlayers.forEach(cardData => { logHTML += createPlayerRow(cardData, false); });
        logHTML = `<div class="market-interaction-rows-wrapper">${logHTML}</div>`;

        return logHTML;
    }

    public createLogDisplayBuiltCubes(built_cubes: { [key: number]: CubeToPyramidMoveData[] }): string {
        let logHTML = '';

        for(const playerID in this.gameui.players){
            let cubesHTML = '';

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
            ${cubesHTML}
            </div>`;
        }

        logHTML = `<div class="built-cubes-rows-wrapper">${logHTML}</div>`;

        return logHTML;
    }

    public createLogSwapTurnOrders(swapData: SwapTurnOrdersData[]): string {
        const logHTML = `${this.gameui.divColoredPlayer(swapData[0].player_id, {class: 'playername swapper-name'}, false)} 
        <div class="turn-order-container-wrapper"><div class="turn-order-container" turn-order="${swapData[0].turn_order}"></div></div>
        <i class="log-arrow log-arrow-exchange fa6 fa-exchange"></i> 
        <div class="turn-order-container-wrapper"><div class="turn-order-container" turn-order="${swapData[1].turn_order}"></div></div>
        ${this.gameui.divColoredPlayer(swapData[1].player_id, {class: 'playername swapper-name'}, false)}`;

        return logHTML;
    }
}