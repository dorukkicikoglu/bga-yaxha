class PlayerHandler{
    public overallPlayerBoard: HTMLDivElement;
    public pyramid: PyramidHandler;
	// public collectedMarketTileIndex: number; //ekmek sil

	constructor(private gameui: GameBody, public playerID: number, private playerName: string, public playerColor: string, private playerNo: number, private turnOrder: number, pyramidData: PyramidCube[], public built_cubes_this_round: boolean) {
		this.overallPlayerBoard = $('overall_player_board_' + this.playerID);
		this.pyramid = new PyramidHandler(this.gameui, this, this.gameui.PYRAMID_MAX_SIZE, pyramidData);
	}

    public createAvatarClone(srcAvatar: HTMLImageElement = null): HTMLDivElement{
		if(!srcAvatar)
			srcAvatar = this.overallPlayerBoard.querySelector('img.avatar');

		const get184by184 = true;

		if (srcAvatar) {
			// Get dimensions and source from original avatar
			let withinPageContent = document.getElementById('page-content').contains(srcAvatar);
			// withinPageContent = true; //ekmek sil
			const avatarRect = withinPageContent ? this.gameui.getPos(srcAvatar) : srcAvatar.getBoundingClientRect();

			let avatarSrc = srcAvatar.getAttribute('src');
			const avatarSrc32 = avatarSrc;
			avatarSrc = get184by184 ? avatarSrc.replace('32.jpg', '184.jpg') : avatarSrc;

			// Create new avatar clone structure with innerHTML
			const avatarClone = document.createElement('div');
			avatarClone.className = 'avatar-clone yaxha-player-avatar';
			avatarClone.setAttribute('player-id', this.playerID.toString());
			avatarClone.style.cssText = `position: absolute; width: ${avatarRect.width}px; height: ${avatarRect.height}px; --player-color: #${this.playerColor};`;
			avatarClone.innerHTML = `<img src="${avatarSrc}" style="width: 100%; height: 100%;">`;

			if(get184by184){ // If requesting 184x184 avatar, handle fallback to 32x32 if larger image fails to load
				const addedImg = avatarClone.querySelector('img');
			
				const tempImg = new Image();
				tempImg.src = avatarSrc;
				tempImg.onerror = () => {
					document.querySelectorAll('img').forEach(img => {
						if (img.getAttribute('src') === avatarSrc)
							img.src = avatarSrc32;
					});
					addedImg.src = avatarSrc32; 
				};
			}

			return avatarClone;
		} else {
			console.error('avatar not found, playerID:', this.playerID);
			return null;
		}
    }

	public setPlayerScore(newScore: number):void { this.overallPlayerBoard.querySelector('.player_score_value').innerHTML = newScore.toString(); }

	public getPlayerName(): string{ return this.playerName; }
	public getTurnOrder(): number{ return this.turnOrder; }

	public getCollectedMarketTileData(): CollectedMarketTilesData{
		return this.gameui.marketHandler.getPlayerCollectedMarketTile(this.playerID);
	}

	public setTurnOrder(turnOrder: number){ this.turnOrder = turnOrder; }
}