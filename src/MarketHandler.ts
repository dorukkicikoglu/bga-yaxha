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
            this.highlightCollectedMarketTile();
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
                        cubeDiv.setAttribute('built-status', 'selected-cube');
                    else if (parseInt(cube.cube_id) in cubesInConstruction)
                        cubeDiv.setAttribute('built-status', 'built-cube');
                    else if (cube.location == 'to_discard')
                        cubeDiv.setAttribute('built-status', 'discarded-cube');
                }

                cubesContainer.appendChild(cubeDiv);
            }
        });
    }

    public addSelectableClassToMarketTiles(possibleMarketIndexes: number[] = null) {
        this.marketTiles.forEach(tile => tile.classList.remove('selectable-market-tile'));

        if(this.gameui.myself && this.gameui.myself.isZombie()){
            this.marketTiles.forEach(tile => tile.classList.add('zombie-market-tile'));
            return;
        }

        let selectableMarketTiles = [];

        if(possibleMarketIndexes){
            possibleMarketIndexes.forEach((i) => selectableMarketTiles.push(this.marketTiles[i]));
        } else {
            const selectedMarketIndex = this.getMySelectedMarketIndex();
            if(selectedMarketIndex !== null)
                return;
            else selectableMarketTiles = this.marketTiles;
        }

        selectableMarketTiles.forEach(tile => tile.classList.add('selectable-market-tile'));
    }
    
    private marketTileClicked(event: Event){
        if(!['allSelectMarketTile', 'individualPlayerSelectMarketTile'].includes(this.gameui.gamedatas.gamestate.name) || this.gameui.isInterfaceLocked())
            return;
        
        const marketTile = event.target as HTMLDivElement;
        if(!marketTile.classList.contains('a-market-tile') || marketTile.classList.contains('zombie-market-tile'))
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
        } else this.setPlayerSelectedMarketIndex(null);
        
        this.addSelectableClassToMarketTiles();
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

        //add player avatars first for correct positioning in animation
        this.collectedMarketTilesData.forEach((playerCollects, animationOrder) => { this.addPlayerAvatar(playerCollects, false); });

        this.collectedMarketTilesData.forEach((playerCollects, animationOrder) => {
            const avatarClone: HTMLDivElement = this.gameui.players[playerCollects.player_id].createAvatarClone();
            avatarClone.style.transform = 'none';
            avatarClone.style.zIndex = '1000';
            const srcAvatar: HTMLImageElement = this.gameui.players[playerCollects.player_id].overallPlayerBoard.querySelector('img.avatar');

            document.body.appendChild(avatarClone);
			this.gameui.placeOnObject(avatarClone, srcAvatar);
            const currentTop = parseInt(window.getComputedStyle(avatarClone).top);

            const destAvatar = this.marketContainer.querySelector(`.yaxha-player-avatar[player-id="${playerCollects.player_id}"]`) as HTMLDivElement;
            const destAvatarRect = destAvatar ? destAvatar.getBoundingClientRect() : {width: 0, height: 0};

            const destAvatarClone = avatarClone.cloneNode(true) as HTMLDivElement;
            destAvatarClone.style.opacity = '0';
            avatarClone.after(destAvatarClone);
            this.gameui.placeOnObject(destAvatarClone, destAvatar, true);

            const raiseAvatarClone: Promise<void> = this.gameui.animationHandler.animateProperty({
                node: avatarClone,
                duration: 200,
                delay: animationOrder * 100,
                properties: {top: currentTop - 20, width: destAvatarRect.width, height: destAvatarRect.height},
                easing: 'sineIn',
            });

            raiseAvatarAnimations.push(raiseAvatarClone);

            const moveAvatarClone: Promise<void> = this.gameui.animationHandler.animateProperty({
                node: avatarClone,
                properties: {top: this.gameui.remove_px(destAvatarClone.style.top), left: this.gameui.remove_px(destAvatarClone.style.left)},
                delay: (playerCollects.type == 'collecting') ? moveCollectingAvatarAnimations.length * 200 : movePendingAvatarAnimations.length * 200,
                duration: 500,
                easing: `cubic-bezier(${0.1 + Math.random() * 0.2}, ${0.3 + Math.random() * 0.3}, ${0.5 + Math.random() * 0.3}, ${0.7 + Math.random() * 0.2})`,
                onEnd: () => { destAvatar.style.opacity = null; avatarClone.remove(); destAvatarClone.remove(); }
            });

            if(playerCollects.type == 'collecting')
                moveCollectingAvatarAnimations.push(moveAvatarClone);
            else movePendingAvatarAnimations.push(moveAvatarClone);
        });

        let raiseAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(raiseAvatarAnimations);
        let moveCollectingAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(moveCollectingAvatarAnimations);
        let movePendingAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(movePendingAvatarAnimations);

        await raiseAvatarsCombinedAnimation.start();

        await moveCollectingAvatarsCombinedAnimation.start();
        this.highlightCollectedMarketTile();

        if(movePendingAvatarAnimations.length > 0){
            this.waitingPlayersContainer.style.opacity = '1';
            await movePendingAvatarsCombinedAnimation.start();
        }
    }

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
       
        const pendingAvatarClone = this.gameui.players[playerID].createAvatarClone(pendingAvatar.querySelector('img'));
        pendingAvatarClone.style.zIndex = '1000';
        this.marketContainer.appendChild(pendingAvatarClone);
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
            onEnd: () => { destAvatar.style.opacity = null; pendingAvatarClone.remove(); this.highlightCollectedMarketTile(); }
        });

        await this.gameui.animationHandler.combine([shrinkPendingAvatar, movePendingAvatarClone]).start();

        if(this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar').length === 0)
            this.closeWaitingPlayersContainer();
    }

    public closeWaitingPlayersContainer(){
        this.waitingPlayersContainer.style.opacity = null;
        this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar').forEach((avatar: HTMLDivElement) => this.gameui.animationHandler.fadeOutAndDestroy(avatar));
    }

    public clearZombiePendingAvatars(nextCollectingPlayerID: number){ //any avatar to the left of the next collecting player is a zombie
        const allPendingAvatars: HTMLDivElement[] = Array.from(this.waitingPlayersContainer.querySelectorAll('.pending-player-avatar'));
        const zombieAvatars = [];
        
        for(const avatar of allPendingAvatars){
            if(Number(avatar.getAttribute('player-id')) == nextCollectingPlayerID)
                break;
            zombieAvatars.push(avatar);
        }
        zombieAvatars.forEach(avatar => this.gameui.animationHandler.fadeOutAndDestroy(avatar));
    }

    private highlightCollectedMarketTile(){ 
        if(!this.gameui.myself)
            return;

        const collectedMarketIndex = this.getMyCollectedMarketIndex();
        if(collectedMarketIndex === null)
            return;

        const collectedMarketTile = this.marketTiles[collectedMarketIndex];
        collectedMarketTile.style.setProperty('--collecting-player-color', '#' + this.gameui.players[this.gameui.myself.playerID].playerColor);
        collectedMarketTile.classList.add('collected-market-tile');
    }

    public async animateBuiltCubes(built_cubes: { [key: number]: CubeToPyramidMoveData[] }) {
        const cubeAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];
        let delay = 0;

        if(this.gameui.myself){
            const myAvatar: HTMLDivElement = this.marketContainer.querySelector(`.yaxha-player-avatar.collecting-player-avatar[player-id="${this.gameui.myself.playerID}"]`) as HTMLDivElement;
            if(myAvatar)
            this.gameui.animationHandler.fadeOutAndDestroy(myAvatar, 100);
        }

        for(const marketIndex in this.marketTiles) {
            const playerID = this.collectedMarketTilesData.find((data) => Number(data.collected_market_index) === Number(marketIndex))?.player_id;

            if(!playerID || !built_cubes[playerID]) continue;
            if(this.gameui.myself && this.gameui.myself.playerID == Number(playerID))
                continue;

            const player = this.gameui.players[playerID];
            let playerCubes = built_cubes[playerID].sort((a, b) => a.pos_z - b.pos_z);
            let playerCubesAnimation = player.pyramid.animateOtherPlayerCubesToPyramid(playerCubes);
            playerCubesAnimation = playerCubesAnimation.addDelay(delay);
            delay += 400;

            cubeAnimArray.push(playerCubesAnimation);
        }

        let cubeAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(cubeAnimArray);
        await cubeAnim.start();
        await this.gameui.wait(300);

        for (const playerID in this.gameui.players)
            this.gameui.players[playerID].pyramid.saveAllCubesInPyramid();
    }

    public async animateNewCubesDrawn(marketData: { [key: number]: MarketCube[] }) {
        this.removePlayerAvatarsFromMarketTiles();
        this.marketTiles.forEach(marketTile => { 
            marketTile.querySelector('.cubes-container').innerHTML = '';  
            marketTile.classList.remove('collected-market-tile');
        });

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

    public async animateSwapTurnOrders(swapData: SwapTurnOrdersData[]) {
        let [swapperLeft, swapperRight] = swapData;

        const rect1: DOMRect = this.gameui.players[swapperLeft.player_id].pyramid.getPyramidContainerRect();
        const rect2: DOMRect = this.gameui.players[swapperRight.player_id].pyramid.getPyramidContainerRect();

        if (rect2.left < rect1.left || (rect2.left === rect1.left && rect2.top < rect1.top)) {
            [swapperLeft, swapperRight] = [swapperRight, swapperLeft];
        }

        this.gameui.players[swapperLeft.player_id].setTurnOrder(swapperRight.turn_order);
        this.gameui.players[swapperRight.player_id].setTurnOrder(swapperLeft.turn_order);
        
        //get the raised card width
        const currentCardWidths: { [playerID: number]: number } = {};
        [swapperLeft, swapperRight].forEach(swapper => {
            const turnOrderContainer = this.gameui.players[swapper.player_id].pyramid.getTurnOrderContainer();
            turnOrderContainer.style.transform = 'none'; 
            const cardRect = turnOrderContainer.getBoundingClientRect();
            currentCardWidths[swapper.player_id] = cardRect.width;
            turnOrderContainer.style.transform = null;
        });
        const expandedCardWidth = Math.max(...Object.values(currentCardWidths)) * 2;

        const raiseAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];
        const turnOrderClones: HTMLDivElement[] = [];
        [swapperLeft, swapperRight].forEach(swapper => {
            const isLeftPlayer = swapper.player_id == swapperLeft.player_id;
            const destinationPlayerID = isLeftPlayer ? swapperRight.player_id : swapperLeft.player_id;

            const turnOrderContainer = this.gameui.players[swapper.player_id].pyramid.getTurnOrderContainer();
            const turnOrderClone = turnOrderContainer.cloneNode(true) as HTMLDivElement;
            turnOrderClone.classList.add('animating-turn-order-container');
            turnOrderClone.setAttribute('destination-player-id', destinationPlayerID.toString());
            turnOrderClone.setAttribute('is-left-player', isLeftPlayer ? 'true' : 'false');
            turnOrderContainer.style.opacity = '0';
            turnOrderClone.style.position = 'fixed';
            
            turnOrderClone.style.width = currentCardWidths[swapper.player_id] + 'px';

            document.body.appendChild(turnOrderClone);
            this.gameui.placeOnObject(turnOrderClone, turnOrderContainer);
            turnOrderClones.push(turnOrderClone);
            const targetRaised = document.createElement('div');
            targetRaised.classList.add(isLeftPlayer ? 'left-turn-order-animation-target' : 'right-turn-order-animation-target');
            document.body.appendChild(targetRaised);
            
            turnOrderContainer.setAttribute('turn-order', isLeftPlayer ? swapperRight.turn_order.toString() : swapperLeft.turn_order.toString());

            raiseAnimArray.push(this.gameui.animationHandler.animateProperty({
                node: turnOrderClone,
                properties: { width: expandedCardWidth, left: targetRaised.offsetLeft, top: targetRaised.offsetTop },
                duration: 400,
                delay: isLeftPlayer ? 0 : 600,
                easing: 'easeInOut',
                onEnd: () => { targetRaised.remove(); }
            }));
        });

        let swapIconsHTML = '<div class="swap-icons">' + this.gameui.divColoredPlayer(swapperLeft.player_id);
        swapIconsHTML += '<div class="turn-order-container-wrapper"><div class="turn-order-container" turn-order="' + swapperLeft.turn_order + '"></div></div>';
        swapIconsHTML += '<i class="log-arrow log-arrow-exchange fa6 fa-exchange"></i>';
        swapIconsHTML += '<div class="turn-order-container-wrapper"><div class="turn-order-container" turn-order="' + swapperRight.turn_order + '"></div></div>';
        swapIconsHTML += this.gameui.divColoredPlayer(swapperRight.player_id);
        swapIconsHTML += '</div>';
        const statusText = _('Swapping Turn Orders: {$swapIcons}').replace('{$swapIcons}', swapIconsHTML);
        this.gameui.updateStatusText(statusText);

        const raiseAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(raiseAnimArray);
        await raiseAnim.start();

        const lowerAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];
        turnOrderClones.forEach(turnOrderClone => {
            const destinationPlayerID = Number(turnOrderClone.getAttribute('destination-player-id'));
            const isLeftPlayer = turnOrderClone.getAttribute('is-left-player') == 'true';

            const otherPyramid = this.gameui.players[destinationPlayerID].pyramid;
            const otherTurnOrderContainer = otherPyramid.getTurnOrderContainer();

            const targetLowered = otherTurnOrderContainer.cloneNode(true) as HTMLDivElement;

            //need to temporarily remove transform to get correct bounding client rect without rotation
            otherPyramid.getPyramidContainer().appendChild(targetLowered);
            targetLowered.style.transform = 'none';
            const loweredCardRect = targetLowered.getBoundingClientRect();
            const loweredCardWidth = loweredCardRect.width;
            targetLowered.style.transform = null;

            targetLowered.classList.add('target-turn-order-container');
            targetLowered.style.position = 'fixed';
            targetLowered.style.width = loweredCardWidth + 'px';
            targetLowered.style.opacity = '0';            
            document.body.appendChild(targetLowered);
            this.gameui.placeOnObject(targetLowered, otherTurnOrderContainer);
            
            lowerAnimArray.push(this.gameui.animationHandler.animateProperty({
                node: turnOrderClone,
                properties: { width: loweredCardWidth, top: targetLowered.offsetTop, left: targetLowered.offsetLeft },
                duration: 350,
                delay: isLeftPlayer ? 200 : 550,
                easing: 'easeIn',
                onEnd: () => { otherTurnOrderContainer.style.opacity = null; turnOrderClone.remove(); targetLowered.remove(); }
            }));  
        });

        const lowerAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(lowerAnimArray);
        await lowerAnim.start();
    }

    public async zombieIndividualPlayerCollection(player_id: number){
        const waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container');
        const playerAvatar: HTMLDivElement = waitingPlayersContainer.querySelector(`.yaxha-player-avatar[player-id="${player_id}"]`);
        if (playerAvatar)
            await this.gameui.animationHandler.fadeOutAndDestroy(playerAvatar, 500);
    }

    private addPlayerAvatar(playerCollects: CollectedMarketTilesData, isVisible: boolean): HTMLDivElement {
        if(playerCollects.type == 'zombie')
            return null;

        const avatarClone: HTMLDivElement = this.gameui.players[playerCollects.player_id].createAvatarClone();

        if(playerCollects.type != 'pending' && playerCollects.collected_market_index == null)
            return null;

        const newAvatarContainer: HTMLDivElement = playerCollects.type === 'pending' 
            ? this.marketContainer.querySelector('.waiting-players-container')
            : this.marketTiles[playerCollects.collected_market_index];

        const avatarClass = playerCollects.type === 'pending' ? 'pending-player-avatar' : 'collecting-player-avatar';
            
        avatarClone.removeAttribute("style");
        avatarClone.classList.add(avatarClass);
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

    public resetCollectedMarketTilesData(){
        for(let i = 0; i < this.collectedMarketTilesData.length; i++){
            this.collectedMarketTilesData[i].selected_market_index = null;
            this.collectedMarketTilesData[i].collected_market_index = null;
        }
    }

    private getMyCollectedMarketIndex(): number { return this.getMyMarketIndex('collected'); }
    private getMySelectedMarketIndex(): number { return this.getMyMarketIndex('selected'); }

    private setPlayerSelectedMarketIndex(marketIndex: number){
        if(!this.gameui.myself)
            return null;

        const playerIndex = this.collectedMarketTilesData.findIndex(player => Number(player.player_id) === Number(this.gameui.myself.playerID));
        this.collectedMarketTilesData[playerIndex].selected_market_index = marketIndex;
    }

    public getCubesOfMarketTile(market_index: number): MarketCube[] { return this.marketData[market_index]; }

    public getMarketTiles(): HTMLDivElement[]{ return this.marketTiles; }
    public setCollectedMarketTilesData(collectedMarketTilesData: CollectedMarketTilesData[]){ this.collectedMarketTilesData = collectedMarketTilesData; }
    public getBonusCardIconsContainer(): HTMLDivElement{ return this.bonusCardIconsContainer; }
}