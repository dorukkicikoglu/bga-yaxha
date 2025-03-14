class PlayerHandler{
    public overallPlayerBoard: HTMLDivElement;
    private pyramidContainer: HTMLDivElement;

	constructor(private gameui: GameBody, public playerID: number, private playerName: string, public playerColor: string, private playerNo: number, private turnOrder: number) {
		this.overallPlayerBoard = $('overall_player_board_' + this.playerID);
		this.pyramidContainer = null;

		this.initPyramidContainer();
	}

    public getAvatarClone(placeOnPlayerBoard: boolean = false, get184by184: boolean = true): HTMLDivElement{
		const avatar = dojo.query('img.avatar', this.overallPlayerBoard)[0];
		if (avatar) {
			// Get dimensions and source from original avatar
			const avatarRect = avatar.getBoundingClientRect();
			let avatarSrc = avatar.getAttribute('src');
			const avatarSrc32 = avatarSrc;
			avatarSrc = get184by184 ? avatarSrc.replace('32.jpg', '184.jpg') : avatarSrc;

			// Create new avatar clone structure with innerHTML
			const avatarClone = document.createElement('div');
			avatarClone.className = 'avatar-clone yaxha-player-avatar';
			avatarClone.setAttribute('player-id', this.playerID.toString());
			avatarClone.style.cssText = `width: ${avatarRect.width}px; height: ${avatarRect.height}px; position: absolute; --player-color: #${this.playerColor};`;
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
				this.gameui.placeOnObject(avatarClone, avatar);
			}

			return avatarClone;
		} else {
			console.log('avatar not found, playerID:', this.playerID);
			return null;
		}
    }

    private initPyramidContainer(){
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.playerID;
		this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.playerID.toString());

		// Set the custom property for player color
        this.pyramidContainer.style.setProperty('--player-color', '#' + this.playerColor);

        const turnOrderContainerId = `turn-order-${this.playerID}`;

		this.pyramidContainer.innerHTML = `
			<div class="player-name-text">
				<div class="text-container">${this.playerName}</div>
			</div>
			<div class="turn-order-container" id="${turnOrderContainerId}" turn-order="${this.turnOrder}">${this.turnOrder}</div>
        `;
		
		document.getElementById('player-tables').querySelector('.pyramids-container').insertAdjacentElement(
			Number(this.playerID) === Number(this.gameui.player_id) ? 'afterbegin' : 'beforeend',
			this.pyramidContainer
		);
    }
}