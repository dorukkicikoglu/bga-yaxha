class PlayerHandler{
    public overallPlayerBoard: HTMLDivElement;
    public pyramid: PyramidHandler;

	constructor(private gameui: GameBody, public playerID: number, private playerName: string, public playerColor: string, private playerNo: number, private isZombiePlayer: boolean, private turnOrder: number, pyramidData: PyramidCube[], public are_cubes_built: boolean) {
		this.overallPlayerBoard = $('overall_player_board_' + this.playerID);
		this.pyramid = new PyramidHandler(this.gameui, this, this.gameui.PYRAMID_MAX_SIZE, pyramidData);
	}

	//new, independent avatar element sized and positioned like geometrySource (the player panel avatar by default), showing the 184px avatar
    public createAvatarClone(geometrySource: HTMLImageElement = null): HTMLDivElement{
		if(!geometrySource)
			geometrySource = this.getPanelAvatarImg();

		if(!geometrySource){
			console.error('avatar not found, playerID:', this.playerID);
			return null;
		}

		const withinPageContent = document.getElementById('page-content').contains(geometrySource);
		const avatarRect = withinPageContent ? this.gameui.getPos(geometrySource) : geometrySource.getBoundingClientRect();

		const avatarClone = document.createElement('div');
		avatarClone.className = 'avatar-clone yaxha-player-avatar';
		avatarClone.setAttribute('player-id', this.playerID.toString());
		avatarClone.style.cssText = `position: absolute; width: ${avatarRect.width}px; height: ${avatarRect.height}px; --player-color: #${this.playerColor};`;

		const img = document.createElement('img');
		img.style.width = '100%';
		img.style.height = '100%';
		if(!this.setAvatarImgSrc(img, 184))
			img.src = geometrySource.src;
		avatarClone.appendChild(img);

		return avatarClone;
    }

	private getPanelAvatarImg(): HTMLImageElement { return this.overallPlayerBoard ? this.overallPlayerBoard.querySelector('img.avatar') : null; }

	//official this.bga.players.getPlayerAvatarUrl() when the framework provides it; otherwise the player panel avatar (32px) with the size swapped
	public getAvatarUrl(size: 32 | 50 | 92 | 184 = 184): string | null {
		const bgaPlayers = this.gameui.bga ? this.gameui.bga.players : null;
		if(bgaPlayers && typeof bgaPlayers.getPlayerAvatarUrl === 'function'){
			try {
				const url = bgaPlayers.getPlayerAvatarUrl(this.playerID, size);
				if(url)
					return url;
			} catch(e) {
				console.warn('bga.players.getPlayerAvatarUrl failed, using the player panel avatar', e);
			}
		}

		const panelAvatar = this.getPanelAvatarImg();
		const src32 = panelAvatar ? panelAvatar.getAttribute('src') : null;
		if(!src32)
			return null;

		return size === 32 ? src32 : src32.replace('32.jpg', size + '.jpg');
	}

	//sets img to this player's avatar; if that size fails to load, only this img falls back to 32px. false if no avatar was found
	public setAvatarImgSrc(img: HTMLImageElement, size: 32 | 50 | 92 | 184 = 184): boolean {
		const url = this.getAvatarUrl(size);
		if(!url)
			return false;

		const fallbackUrl = size === 32 ? null : this.getAvatarUrl(32);
		if(fallbackUrl && fallbackUrl !== url)
			img.addEventListener('error', () => {
				if(img.getAttribute('src') !== fallbackUrl)
					img.src = fallbackUrl;
			});

		img.src = url;
		return true;
	}

	public setPlayerScore(newScore: number):void { this.overallPlayerBoard.querySelector('.player_score_value').innerHTML = newScore.toString(); }

	public getPlayerName(): string{ return this.playerName; }
	public getTurnOrder(): number{ return this.turnOrder; }
	public isZombie(): boolean{ return this.isZombiePlayer; }

	public getCollectedMarketTileData(): CollectedMarketTilesData{
		return this.gameui.marketHandler.getPlayerCollectedMarketTile(this.playerID);
	}

	public setTurnOrder(turnOrder: number){ this.turnOrder = turnOrder; }
	public setZombie(isZombieIn: boolean){ this.isZombiePlayer = isZombieIn; }
}