class MarketHandler{
    private marketContainer: HTMLDivElement;
    public marketTiles: HTMLDivElement[];
    private waitingPlayersContainer: HTMLDivElement;
    private marketTilesContainer: HTMLDivElement;
    public bonusCardIconsContainer: HTMLDivElement;

	constructor(private gameui: GameBody, private marketData: { [key: number]: MarketCube[] }, private bonusCardIDs: number[], private playerSelectedMarketIndex: number, private collectedMarketTilesData: CollectedMarketTilesData[]) {
		this.marketContainer = document.querySelector('#player-tables .market-container') as HTMLDivElement;
        this.marketTilesContainer = this.marketContainer.querySelector('.market-tiles-container') as HTMLDivElement;
        this.waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container') as HTMLDivElement;
        this.bonusCardIconsContainer = this.marketContainer.querySelector('.bonus-cards-container') as HTMLDivElement;

        this.marketTiles = [];

        this.initMarketContainer();
        this.initBonusCardContainer();
        this.updateStatusTextUponCubeSelection();
	}

    private initMarketContainer(){
        // Create and shuffle array of numbers 1-60
        const shuffledIndices = Array.from({length: 60}, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);

            Object.keys(this.gameui.players).forEach((_, i) => {
            // First loop: Create market tiles
            this.marketTiles[i] = document.createElement('div');
            this.marketTiles[i].innerHTML = '<div class="cubes-container"></div>';
            this.marketTiles[i].className = 'a-market-tile market-tile-' + i + ' ' + (this.playerSelectedMarketIndex !== null && Number(this.playerSelectedMarketIndex) === i ? 'selected-market-tile' : '');
            this.marketTiles[i].setAttribute('market-index', i.toString());
            this.marketTiles[i].setAttribute('random-placement-index', shuffledIndices[i].toString());

            this.marketTiles[i].addEventListener('click', (event: Event) => this.marketTileClicked(event));

            this.marketTilesContainer.appendChild(this.marketTiles[i]);
        });

        // Second loop: Create and position cubes
        Object.keys(this.gameui.players).forEach((_, i) => {
            const tilesData = this.marketData[i] || [];

            tilesData.forEach(cube => {
                const cubeDiv = document.createElement('div');
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
                cubeDiv.style.setProperty('--cube-color', '#' + this.gameui.CUBE_COLORS[Number(cube.color)].colorCode);

                this.marketTiles[i].querySelector('.cubes-container').appendChild(cubeDiv);
            });
        });

        // Add player avatars to market tiles and show waiting players container if any players are pending
        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile') {
            this.collectedMarketTilesData.sort((a, b) => a.turn_order - b.turn_order);
            this.collectedMarketTilesData.forEach(playerCollects => {
                this.addPlayerAvatar(playerCollects, true);
                if(playerCollects.type == 'pending')
                    this.waitingPlayersContainer.style.opacity = '1';
            });
        }
    }

    public addSelectableClassToMarketTiles(possibleMarketIndexes: number[] | 'all') {
        this.marketTiles.forEach(tile => tile.classList.remove('selectable-market-tile'));

        let selectableMarketTiles = [];
        if (possibleMarketIndexes === 'all')
            selectableMarketTiles = this.marketTiles;
        else possibleMarketIndexes.forEach((i) => selectableMarketTiles.push(this.marketTiles[i]));

        selectableMarketTiles.forEach(tile => tile.classList.add('selectable-market-tile'));
    }
    
    private marketTileClicked(event: Event){
        if(!['allSelectMarketTile', 'individualPlayerSelectMarketTile'].includes(this.gameui.gamedatas.gamestate.name) || this.gameui.isInterfaceLocked())
            return;
        
        const marketTile = event.target as HTMLDivElement;
        if(!marketTile.classList.contains('a-market-tile') || !marketTile.classList.contains('selectable-market-tile'))
            return;

        const marketIndex = marketTile.getAttribute('market-index');
        
        let actionName = '';
        if(this.gameui.gamedatas.gamestate.name === 'allSelectMarketTile'){
            if(!marketTile.classList.contains('selected-market-tile'))
                actionName = 'actAllSelectMarketTile';
            else actionName = 'actRevertAllSelectMarketTile';
        } else if(this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile')
            actionName = 'actIndividualPlayerSelectMarketTile';
        
        this.gameui.ajaxAction(actionName, {marketIndex: marketIndex}, true, false);

            // if(!marketTile.classList.contains('selected-market-tile')) //ekmek sil
            //     this.gameui.ajaxAction('actAllSelectMarketTile', {marketIndex: marketIndex}, true, false);
            // else this.gameui.ajaxAction('actRevertAllSelectMarketTile', {marketIndex: marketIndex}, true, false);
    }

    public async marketTileSelected(marketIndex: number) {
        const selectedTile = document.querySelector(`.a-market-tile[market-index="${marketIndex}"]`);
        
        this.marketContainer.querySelectorAll('.a-market-tile').forEach(tile => tile.classList.remove('selected-market-tile'));

        if (selectedTile) {
            this.playerSelectedMarketIndex = marketIndex;
            selectedTile.classList.add('selected-market-tile');
        } else {
            this.playerSelectedMarketIndex = null;
        }
        
        this.updateStatusTextUponCubeSelection();
    }

    public updateStatusTextUponCubeSelection(){
        if(this.gameui.gamedatas.gamestate.name != 'allSelectMarketTile')
            return;

        if(!this.gameui.myself)
            return;

        let statusText = '';
        if(this.playerSelectedMarketIndex !== null){
            let marketTileIcon = '<div class="a-market-tile-icon" market-index="' + this.playerSelectedMarketIndex + '"></div>';
            statusText = dojo.string.substitute(_('${you} selected ${marketTileIcon} Waiting for others'), {you: this.gameui.divYou(), marketTileIcon: marketTileIcon});
            statusText = '<span class="waiting-text">' + statusText + '</span>';
        } else {
            statusText = dojo.string.substitute(_('${you} must select a Market Tile'), {you: this.gameui.divYou()});
        }

        this.gameui.updateStatusText(statusText);

        if(this.playerSelectedMarketIndex)
            this.gameui.dotTicks(dojo.query('#page-title .waiting-text')[0]);
    }

    private initBonusCardContainer(){
        this.bonusCardIconsContainer.innerHTML = '';
        this.bonusCardIconsContainer.innerHTML = this.bonusCardIDs.map(id => `<div class="a-bonus-card-icon" bonus-card-id="${id}" id="bonus-card-icon-${id}"></div>`).join('');
	}

    public async animateAllMarketTileSelections(collectedMarketTilesData: { collectingPlayers: CollectedMarketTilesData[], pendingPlayers: CollectedMarketTilesData[] }) {
        this.collectedMarketTilesData = [
            ...collectedMarketTilesData.collectingPlayers.map(player => ({...player, type: 'collecting' as const})),
            ...collectedMarketTilesData.pendingPlayers.map(player => ({...player, type: 'pending' as const}))
        ];

        const raiseAvatarAnimations: ReturnType<typeof dojo.animateProperty>[] = [];
        const moveCollectingAvatarAnimations: ReturnType<typeof dojo.animateProperty>[] = [];
        const movePendingAvatarAnimations: ReturnType<typeof dojo.animateProperty>[] = [];

        this.collectedMarketTilesData.forEach((playerCollects, animationOrder) => {
            const avatarClone: HTMLDivElement = this.gameui.players[playerCollects.player_id].getAvatarClone(true);
            const currentTop = parseInt(window.getComputedStyle(avatarClone).top);
            const currentLeft = parseInt(window.getComputedStyle(avatarClone).left);

            var destAvatar = this.addPlayerAvatar(playerCollects, false);
            const destAvatarRect = destAvatar ? destAvatar.getBoundingClientRect() : {width: 0, height: 0};

            const raiseAvatarClone: Promise<void> = this.gameui.animationHandler.animateProperty({
                node: avatarClone,
                duration: 200,
                delay: animationOrder * 100,
                properties: {top: currentTop - 20, width: destAvatarRect.width, height: destAvatarRect.height},
                easing: 'sineIn',
            });

            raiseAvatarAnimations.push(raiseAvatarClone);

            const moveAvatarClone: Promise<void> = this.gameui.animationHandler.animateOnObject({
                node: avatarClone,
                goTo: destAvatar,
                delay: (playerCollects.type == 'collecting') ? moveCollectingAvatarAnimations.length * 200 : movePendingAvatarAnimations.length * 200,
                duration: 500,
                easing: `cubic-bezier(${0.1 + Math.random() * 0.2}, ${0.3 + Math.random() * 0.3}, ${0.5 + Math.random() * 0.3}, ${0.7 + Math.random() * 0.2})`,
                onEnd: () => { destAvatar.style.opacity = null; dojo.destroy(avatarClone); }
            })

            if(playerCollects.type == 'collecting')
                moveCollectingAvatarAnimations.push(moveAvatarClone);
            else movePendingAvatarAnimations.push(moveAvatarClone);
        });

        let raiseAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(raiseAvatarAnimations);
        let moveCollectingAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(moveCollectingAvatarAnimations);
        let movePendingAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(movePendingAvatarAnimations);

        await raiseAvatarsCombinedAnimation.start();
        await moveCollectingAvatarsCombinedAnimation.start();
        if(movePendingAvatarAnimations.length > 0){
            this.waitingPlayersContainer.style.opacity = '1';
            await movePendingAvatarsCombinedAnimation.start();
        }
    }

    public async animateIndividualPlayerCollected(playerID: number, collectedMarketIndex: number) {        
        var destAvatar = this.addPlayerAvatar({player_id: playerID, collected_market_index: collectedMarketIndex, type: 'collecting'} as CollectedMarketTilesData, false);
        const pendingAvatar: HTMLDivElement = this.waitingPlayersContainer.querySelector(`.yaxha-player-avatar.pending-player-avatar[player-id="${playerID}"]`) as HTMLDivElement;
        const avatarRect = pendingAvatar.getBoundingClientRect();

        // const pendingAvatarClone = pendingAvatar.cloneNode(true) as HTMLDivElement;        //ekmek sil
        // pendingAvatarClone.style.cssText = `position: absolute; width: ${avatarRect.width}px; height: ${avatarRect.height}px; --player-color: #${this.gameui.players[playerID].playerColor};`;

        const pendingAvatarClone = this.gameui.players[playerID].getAvatarClone(false, true, pendingAvatar.querySelector('img'));
        document.getElementById('overall-content').appendChild(pendingAvatarClone);
        this.gameui.placeOnObject(pendingAvatarClone, pendingAvatar);

        pendingAvatar.style.opacity = '0';
        destAvatar.style.opacity = '0';

        const shrinkPendingAvatar = this.gameui.animationHandler.animateProperty({
            node: pendingAvatar,
            properties: {width: 0, marginLeft: 0, marginRight: 0},
            duration: 500,
            easing: 'sineOut',
            onEnd: () => { dojo.destroy(pendingAvatar); }
        });

        const movePendingAvatarClone = this.gameui.animationHandler.animateOnObject({
            node: pendingAvatarClone,
            goTo: destAvatar,
            duration: 500,
            easing: `cubic-bezier(${0.1 + Math.random() * 0.2}, ${0.3 + Math.random() * 0.3}, ${0.5 + Math.random() * 0.3}, ${0.7 + Math.random() * 0.2})`,
            onEnd: () => { destAvatar.style.opacity = null; dojo.destroy(pendingAvatarClone); }
        });

        await this.gameui.animationHandler.combine([shrinkPendingAvatar, movePendingAvatarClone]).start();

        if(this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar').length === 0)
            this.waitingPlayersContainer.style.opacity = null;
    }

    private addPlayerAvatar(playerCollects: CollectedMarketTilesData, isVisible: boolean): HTMLDivElement {
        const avatarClone: HTMLDivElement = this.gameui.players[playerCollects.player_id].getAvatarClone();
        const newAvatarContainer: HTMLDivElement = playerCollects.type === 'collecting' 
            ? this.marketTiles[playerCollects.collected_market_index] 
            : this.marketContainer.querySelector('.waiting-players-container');

        avatarClone.removeAttribute("style");
        avatarClone.classList.add(`${playerCollects.type}-player-avatar`);
        avatarClone.classList.remove('avatar-clone');
        avatarClone.style.setProperty('--player-color', '#' + this.gameui.players[playerCollects.player_id].playerColor);
        
        if (!isVisible)
            avatarClone.style.opacity = '0';

        newAvatarContainer.appendChild(avatarClone);
        return avatarClone;
    }

    public getPlayerCollectedMarketTile(player_id: number){
        return this.collectedMarketTilesData.find(player => Number(player.player_id) === Number(player_id));
    }
}