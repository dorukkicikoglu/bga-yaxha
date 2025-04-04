class PlayerHandler{
    public overallPlayerBoard: HTMLDivElement;
    public pyramid: PyramidHandler;
	// public collectedMarketTileIndex: number; //ekmek sil

	constructor(private gameui: GameBody, public playerID: number, private playerName: string, public playerColor: string, private playerNo: number, private turnOrder: number, pyramidData: PyramidCube[], public built_cubes_this_round: boolean) {
		this.overallPlayerBoard = $('overall_player_board_' + this.playerID);

		this.pyramid = new PyramidHandler(this.gameui, this, this.gameui.PYRAMID_MAX_SIZE, pyramidData);
	}

    public getAvatarClone(placeOnPlayerBoard: boolean = false, get184by184: boolean = true, srcAvatar: HTMLImageElement = null): HTMLDivElement{
		if(!srcAvatar)
			srcAvatar = dojo.query('img.avatar', this.overallPlayerBoard)[0];

		if (srcAvatar) {
			// Get dimensions and source from original avatar
			const avatarRect = srcAvatar.getBoundingClientRect();
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

			if(placeOnPlayerBoard){ // If requested, place the cloned avatar on the original avatar's position
				document.getElementById('overall-content').appendChild(avatarClone);
				this.gameui.placeOnObject(avatarClone, srcAvatar);
			}

			return avatarClone;
		} else {
			console.log('avatar not found, playerID:', this.playerID);
			return null;
		}
    }

	public getCollectedMarketTileData(): CollectedMarketTilesData{
		return this.gameui.marketHandler.getPlayerCollectedMarketTile(this.playerID);
	}
}