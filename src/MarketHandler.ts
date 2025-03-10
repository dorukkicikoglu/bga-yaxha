class MarketHandler{
    private marketContainer: HTMLDivElement;
    private marketTiles: HTMLDivElement[];
    private waitingPlayersContainer: HTMLDivElement;
    private marketTilesContainer: HTMLDivElement;
    private bonusCardIconsContainer: HTMLDivElement;

	constructor(private gameui: GameBody, private marketData: { [key: number]: MarketCube[] }, private bonusCardIDs: number[], private playerSelectedMarketIndex: number) {
		this.marketContainer = document.querySelector('#player-tables .market-container') as HTMLDivElement;
        // this.waitingPlayersContainer = this.marketContainer.querySelector('.waiting-players-container') as HTMLDivElement; //ekmek sil
        this.marketTilesContainer = this.marketContainer.querySelector('.market-tiles-container') as HTMLDivElement;
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

                this.marketTiles[i].appendChild(cubeDiv);
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
            this.gameui.ajaxAction('actAllSelectMarketTile', {marketIndex: marketIndex}, true, false); //ekmek promise yap
        else this.gameui.ajaxAction('actRevertAllSelectMarketTile', {marketIndex: marketIndex}, true, false); //ekmek promise yap
    }

    public async marketTileSelected(marketIndex: number) {
        const selectedTile = document.querySelector(`.a-market-tile[market-index="${marketIndex}"]`);
        
        this.marketContainer.querySelectorAll('.a-market-tile').forEach(tile => tile.classList.remove('selected-market-tile'));

        if (selectedTile) {
            this.playerSelectedMarketIndex = marketIndex;
            selectedTile.classList.add('selected-market-tile');
            // await this.gameui.wait(500); //ekmek sil
            // selectedTile.classList.remove('selected');
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

    public getBonusCardIconsContainer(){ return this.bonusCardIconsContainer; }
}