class PlayerHandler{
    public overallPlayerBoard: HTMLDivElement;
    private pyramidContainer: HTMLDivElement;

	constructor(private gameui: GameBody, public playerID: number, private playerName: string, public playerColor: string, private playerNo: number, private turnOrder: number) {
		this.overallPlayerBoard = $('overall_player_board_' + this.playerID);
		this.pyramidContainer = null;

		this.initPyramidContainer();
	}

    private initPyramidContainer(){
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.playerID;
		this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.playerID.toString());

		// Set the custom property for player color
        this.pyramidContainer.style.setProperty('--player-color', '#' + this.playerColor);

		this.pyramidContainer.innerHTML = `
			<div class="player-name-text">
				<div class="text-container">${this.playerName}</div>
			</div>
        `;

		document.getElementById('player-tables')?.appendChild(this.pyramidContainer);
    }
}