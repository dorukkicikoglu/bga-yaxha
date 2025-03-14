class MarketHandler{
    private marketContainer: HTMLDivElement;
    private marketTiles: HTMLDivElement[];
    private waitingPlayersContainer: HTMLDivElement;
    private marketTilesContainer: HTMLDivElement;
    private bonusCardIconsContainer: HTMLDivElement;

	constructor(private gameui: GameBody, private marketData: { [key: number]: MarketCube[] }, private bonusCardIDs: number[], private playerSelectedMarketIndex: number) {
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
    }
    
    private marketTileClicked(event: Event){
        if(!['allSelectMarketTile'].includes(this.gameui.gamedatas.gamestate.name) || this.gameui.isInterfaceLocked())
            return;

        if(!(event.target as HTMLElement).classList.contains('a-market-tile'))
            return;

        const marketTile = event.target as HTMLDivElement;
        const marketIndex = marketTile.getAttribute('market-index');
        
        if(!marketTile.classList.contains('selected-market-tile'))
            this.gameui.ajaxAction('actAllSelectMarketTile', {marketIndex: marketIndex}, true, false);
        else this.gameui.ajaxAction('actRevertAllSelectMarketTile', {marketIndex: marketIndex}, true, false);
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

    public async animateAllMarketTileSelections(marketTileSelectionsData: { collectingPlayers: MarketTileSelectionsData[], pendingPlayers: MarketTileSelectionsData[] }) {
        const allPlayers = [
            ...marketTileSelectionsData.collectingPlayers.map(player => ({...player, type: 'collecting'})),
            ...marketTileSelectionsData.pendingPlayers.map(player => ({...player, type: 'pending'}))
        ];

        const raiseAvatarAnimations: ReturnType<typeof dojo.animateProperty>[] = [];
        const moveCollectingAvatarAnimations: ReturnType<typeof dojo.animateProperty>[] = [];
        const movePendingAvatarAnimations: ReturnType<typeof dojo.animateProperty>[] = [];

        allPlayers.forEach((player, animationOrder) => {
            const avatarClone: HTMLDivElement = this.gameui.players[player.player_id].getAvatarClone(true);
            const currentTop = parseInt(window.getComputedStyle(avatarClone).top);
            const currentLeft = parseInt(window.getComputedStyle(avatarClone).left);

            var destAvatar = player.type == 'collecting' ? 
                this.addPlayerAvatar(player.player_id, 'collecting', player.selected_market_index, false) : 
                this.addPlayerAvatar(player.player_id, 'pending', undefined, false);
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
                delay: (player.type == 'collecting') ? moveCollectingAvatarAnimations.length * 200 : movePendingAvatarAnimations.length * 200,
                duration: 500,
                easing: `cubic-bezier(${0.1 + Math.random() * 0.2}, ${0.3 + Math.random() * 0.3}, ${0.5 + Math.random() * 0.3}, ${0.7 + Math.random() * 0.2})`,
                onEnd: () => { destAvatar.style.opacity = null; dojo.destroy(avatarClone); }
            })

            if(player.type == 'collecting')
                moveCollectingAvatarAnimations.push(moveAvatarClone);
            else movePendingAvatarAnimations.push(moveAvatarClone);
        });

        let raiseAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = dojo.fx.combine(raiseAvatarAnimations);
        let moveCollectingAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = dojo.fx.combine(moveCollectingAvatarAnimations);
        let movePendingAvatarsCombinedAnimation: ReturnType<typeof dojo.animateProperty> = dojo.fx.combine(movePendingAvatarAnimations);

        await this.gameui.animationHandler.play(raiseAvatarsCombinedAnimation);
        await this.gameui.animationHandler.play(moveCollectingAvatarsCombinedAnimation);
        this.waitingPlayersContainer.style.opacity = '1';
        await this.gameui.animationHandler.play(movePendingAvatarsCombinedAnimation);

        marketTileSelectionsData.pendingPlayers.forEach((player) => {
            var playerBoard = this.gameui.players[player.player_id].overallPlayerBoard;
            console.log('pending playerBoard', playerBoard);
        });
    }

    private addPlayerAvatar(player_id: number, type: 'collecting' | 'pending', marketTileIndex?: number, isVisible: boolean = true): HTMLDivElement {
        const avatarClone: HTMLDivElement = this.gameui.players[player_id].getAvatarClone();
        const newAvatarContainer: HTMLDivElement = type === 'collecting' 
            ? this.marketTiles[marketTileIndex] 
            : this.marketContainer.querySelector('.waiting-players-container');

        avatarClone.removeAttribute("style");
        avatarClone.classList.add(`${type}-player-avatar`);
        avatarClone.classList.remove('avatar-clone');
        avatarClone.style.setProperty('--player-color', '#' + this.gameui.players[player_id].playerColor);
        
        if (!isVisible)
            avatarClone.style.opacity = '0';

        newAvatarContainer.appendChild(avatarClone);
        return avatarClone;
    }

    public getBonusCardIconsContainer(){ return this.bonusCardIconsContainer; }
}