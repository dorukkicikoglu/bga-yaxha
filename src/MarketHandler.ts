class MarketHandler{
    private marketContainer: HTMLDivElement;
    private marketTiles: HTMLDivElement[];
    private waitingPlayersContainer: HTMLDivElement;
    private marketTilesContainer: HTMLDivElement;
    private bonusCardIconsContainer: HTMLDivElement;

	constructor(private gameui: GameBody, private marketData: { [key: number]: MarketCube[] }, private bonusCardIDs: number[], private collectedMarketTilesData: CollectedMarketTilesData[]) {
		this.marketContainer = document.querySelector('#player-tables .market-container') as HTMLDivElement;
        this.marketTilesContainer = this.marketContainer.querySelector('.market-tiles-container') as HTMLDivElement;
        this.waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container') as HTMLDivElement;
        this.bonusCardIconsContainer = this.marketContainer.querySelector('.bonus-cards-container') as HTMLDivElement;

        this.marketTiles = [];

        this.initMarketContainer();
        this.initBonusCardContainer();
        this.updateStatusTextUponMarketTileSelection();
	}

    private initMarketContainer(){
        const playerSelectedMarketIndex = this.getMySelectedMarketIndex();
        
        Object.keys(this.gameui.players).forEach((_, i) => {
            // First loop: Create Market Tiles
            this.marketTiles[i] = document.createElement('div');
            this.marketTiles[i].innerHTML = '<div class="cubes-container"></div>';
            this.marketTiles[i].className = 'a-market-tile market-tile-' + i + ' ' + (this.gameui.gamedatas.gamestate.name === 'allSelectMarketTile' && playerSelectedMarketIndex !== null && Number(playerSelectedMarketIndex) === i ? 'selected-market-tile' : '');
            this.marketTiles[i].setAttribute('market-index', i.toString());

            this.marketTiles[i].addEventListener('click', (event: Event) => this.marketTileClicked(event));

            this.marketTilesContainer.appendChild(this.marketTiles[i]);
        });

        this.fillMarketTilesWithCubes();

        // Add player avatars to Market Tiles and show waiting players container if any players are pending
        if (this.collectedMarketTilesData.length > 0) {
            this.collectedMarketTilesData.sort((a, b) => a.turn_order - b.turn_order);
            this.collectedMarketTilesData.forEach(playerCollects => {
                const playerAvatar = this.addPlayerAvatar(playerCollects, true);
                if(playerAvatar && playerCollects.type == 'pending')
                    this.waitingPlayersContainer.style.opacity = '1';
            });
        }
    }

    private fillMarketTilesWithCubes(){
        const shuffledIndices = Array.from({length: 60}, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);

        this.marketTiles.forEach((tile, index) => {
            tile.setAttribute('random-placement-index', shuffledIndices[index].toString());
        });

        const playerCollectedMarketIndex = this.getMyCollectedMarketIndex();
        Object.keys(this.marketData).forEach((_, marketIndex) => {
            const tilesData = this.marketData[marketIndex] || [];
            const cubesContainer = this.marketTiles[marketIndex].querySelector('.cubes-container');

            for(const cube of tilesData){
                const cubeDiv = this.gameui.createCubeDiv(cube);

                if(playerCollectedMarketIndex !== null && this.gameui.myself && marketIndex == playerCollectedMarketIndex){
                    const unplacedCube = this.gameui.myself.pyramid.getUnplacedCube();
                    const cubesInConstruction = this.gameui.myself.pyramid.getCubesInConstruction();

                    if (cube.cube_id === unplacedCube?.cube_id)
                        cubeDiv.classList.add('selected-for-pyramid');
                    else if (parseInt(cube.cube_id) in cubesInConstruction)
                        cubeDiv.classList.add('built-in-pyramid');
                }

                cubesContainer.appendChild(cubeDiv);
            }
        });
    }

    public addSelectableClassToMarketTiles(possibleMarketIndexes: number[] | 'all' | 'none') {
        this.marketTiles.forEach(tile => tile.classList.remove('selectable-market-tile'));

        if (possibleMarketIndexes === 'none')
            return;
        
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
        if(!marketTile.classList.contains('a-market-tile'))
            return;
        
        if(this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile' && !marketTile.classList.contains('selectable-market-tile'))
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
    }

    public async marketTileSelected(marketIndex: number) {
        const selectedTile = document.querySelector(`.a-market-tile[market-index="${marketIndex}"]`);
        
        this.marketContainer.querySelectorAll('.a-market-tile').forEach(tile => tile.classList.remove('selected-market-tile'));

        if (selectedTile) {
            this.setPlayerSelectedMarketIndex(marketIndex);
            selectedTile.classList.add('selected-market-tile');
            this.addSelectableClassToMarketTiles('none');
        } else {
            this.setPlayerSelectedMarketIndex(null);
            this.addSelectableClassToMarketTiles('all');
        }
        this.updateStatusTextUponMarketTileSelection();
    }

    public updateStatusTextUponMarketTileSelection(){
        if(this.gameui.gamedatas.gamestate.name != 'allSelectMarketTile')
            return;

        if(!this.gameui.myself)
            return;

        let statusText = '';
        const playerSelectedMarketIndex = this.getMySelectedMarketIndex();
        if(playerSelectedMarketIndex !== null){
            let marketTileIcon = '<div class="a-market-tile-icon" market-index="' + playerSelectedMarketIndex + '"></div>';
            statusText = dojo.string.substitute(_('${you} selected ${marketTileIcon} Waiting for others'), {you: this.gameui.divYou(), marketTileIcon: marketTileIcon});
            statusText = '<span class="waiting-text">' + statusText + '</span>';
        } else {
            statusText = dojo.string.substitute(_('${you} must select a Market Tile'), {you: this.gameui.divYou()});
        }

        this.gameui.updateStatusText(statusText);

        if(playerSelectedMarketIndex)
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

            let destAvatar = this.addPlayerAvatar(playerCollects, false);
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

    // public async animateIndividualPlayerCollected(playerID: number, collectedMarketIndex: number) { //ekmek sil
    public async animateIndividualPlayerCollected(playerID: number, collectedMarketIndex: number) {
        const playerIndex = this.collectedMarketTilesData.findIndex(data => Number(data.player_id) === Number(playerID));
        if(playerIndex === -1){
            console.error('Could not find player in collectedMarketTilesData');
            return;
        }

        this.collectedMarketTilesData[playerIndex].type = 'collecting';
        this.collectedMarketTilesData[playerIndex].collected_market_index = collectedMarketIndex;

        let destAvatar = this.addPlayerAvatar({player_id: playerID, collected_market_index: collectedMarketIndex, type: 'collecting'} as CollectedMarketTilesData, false);
        const pendingAvatar: HTMLDivElement = this.waitingPlayersContainer.querySelector(`.yaxha-player-avatar.pending-player-avatar[player-id="${playerID}"]`) as HTMLDivElement;
       
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

    public async animateBuiltCubes(built_cubes: { [key: number]: CubeToPyramidMoveData[] }) {
        // this.removePlayerAvatarsFromMarketTiles(); //ekmek sil

        const cubeAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];
        let delay = 0;
        for(const marketIndex in this.marketTiles) {
            const playerID = this.collectedMarketTilesData.find((data) => Number(data.collected_market_index) === Number(marketIndex))?.player_id;

            if(!playerID || !built_cubes[playerID]) continue;
            if(this.gameui.myself && this.gameui.myself.playerID == Number(playerID))
                continue;

            const player = this.gameui.players[playerID];
            let playerCubesAnimation = player.pyramid.animatePlayerCubesToPyramid(built_cubes[playerID]);
            playerCubesAnimation = playerCubesAnimation.addDelay(delay);
            delay += 400;

            cubeAnimArray.push(playerCubesAnimation);
        }

        let cubeAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(cubeAnimArray);
        await cubeAnim.start();

        for (const playerID in this.gameui.players)
            this.gameui.players[playerID].pyramid.saveAllCubesInPyramid();
    }

    public async animateNewCubesDrawn(marketData: { [key: number]: MarketCube[] }) {
        this.removePlayerAvatarsFromMarketTiles();
        this.marketTiles.forEach(marketTile => { marketTile.querySelector('.cubes-container').innerHTML = ''; });

        this.marketData = marketData;
        this.fillMarketTilesWithCubes();

        const cubeAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];
        let delay = 0;

        this.marketTiles.forEach(marketTile => {
            marketTile.querySelectorAll('.a-cube').forEach((cube: HTMLElement) => {
                cube.style.marginLeft = '-800px';
                cube.style.marginTop = '-400px';
    
                const cubeAnim = this.gameui.animationHandler.animateProperty({
                    node: cube,
                    properties: {marginLeft: 0, marginTop: 0},
                    duration: 450 + Math.floor(Math.random() * 101),
                    easing: 'sineOut',
                    delay: delay + Math.floor(Math.random() * 51),
                    onEnd: () => {
                        cube.style.marginLeft = null;
                        cube.style.marginTop = null;
                    }
                });
    
                cubeAnimArray.push(cubeAnim);
                delay += 40;
            });

            delay += 100;
        });

        let cubeAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(cubeAnimArray);
        await cubeAnim.start();
    }

    private addPlayerAvatar(playerCollects: CollectedMarketTilesData, isVisible: boolean): HTMLDivElement {
        if(!['pending', 'collecting'].includes(playerCollects.type))
            return null;

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

    private removePlayerAvatarsFromMarketTiles(){
        this.marketTiles.forEach(tile => {
            tile.querySelectorAll('.yaxha-player-avatar.collecting-player-avatar').forEach((avatar: HTMLDivElement) => {
                this.gameui.animationHandler.fadeOutAndDestroy(avatar);
            });
        });
    }

    public getPlayerCollectedMarketTile(player_id: number): CollectedMarketTilesData{
        return this.collectedMarketTilesData.find(player => Number(player.player_id) === Number(player_id));
    }

    public getPlayerCollectedMarketTileDiv(player_id: number): HTMLDivElement{
        return this.marketTiles[this.getPlayerCollectedMarketTile(player_id).collected_market_index];
    }

    private getMyMarketIndex(type: 'collected' | 'selected'): number {
        if(!this.gameui.myself)
            return null;

        const marketTile: CollectedMarketTilesData = this.getPlayerCollectedMarketTile(this.gameui.myself.playerID);
        return marketTile ? (type == 'collected' ? marketTile.collected_market_index : marketTile.selected_market_index) : null;
    }

    private getMyCollectedMarketIndex(): number { return this.getMyMarketIndex('collected'); }
    private getMySelectedMarketIndex(): number { return this.getMyMarketIndex('selected'); }

    private setPlayerSelectedMarketIndex(marketIndex: number){
        if(!this.gameui.myself)
            return null;

        const playerIndex = this.collectedMarketTilesData.findIndex(player => Number(player.player_id) === Number(this.gameui.myself.playerID));
        this.collectedMarketTilesData[playerIndex].selected_market_index = marketIndex;
    }

    // public getCubesOfMarketTile(market_index: number): MarketCube[] { return this.marketData[market_index]; } //ekmek sil

    public getMarketTiles(): HTMLDivElement[]{ return this.marketTiles; }
    public setCollectedMarketTilesData(collectedMarketTilesData: CollectedMarketTilesData[]){ this.collectedMarketTilesData = collectedMarketTilesData; }
    public getBonusCardIconsContainer(): HTMLDivElement{ return this.bonusCardIconsContainer; }
}