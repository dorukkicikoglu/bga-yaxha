class TooltipHandler{
	constructor(private gameui: GameBody) { 
        this.addTooltipToBonusCards('market');
        this.addTooltipToTurnOrder();
	}

	public addTooltipToBonusCards(where: 'market' | 'scoreSheet' ){
        const container = where === 'market' ? this.gameui.marketHandler.getBonusCardIconsContainer() : document.querySelector('.end-game-score-container');
        const bonusCardIcons = container.querySelectorAll('.a-bonus-card-icon');

        bonusCardIcons.forEach(cardIcon => {
            const cardIconID = cardIcon.getAttribute('id');
            const cardID = cardIcon.getAttribute('bonus-card-id');

            let tooltipHTML = bga_format(this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text, { '*': (t) => '<b>' + t + '</b>'});
            const rightPlayerDiv = this.gameui.rightPlayerID ? '(' + this.gameui.divColoredPlayer(this.gameui.rightPlayerID, {'class': 'tooltip-bold'}, false) + ')' : '';
            tooltipHTML = tooltipHTML.replace('${rightPlayer}', rightPlayerDiv);

            this.gameui.addTooltipHtml(
                cardIconID,
                `<div class="bonus-card-tooltip tooltip-wrapper" bonus-card-id="${cardID}">
                        <div class="tooltip-text">${tooltipHTML}</div>
                        <div class="tooltip-card tooltip-bonus-card"></div>
                        <div class="tooltip-card tooltip-cubes-card"></div>
                    </div>`,
                400
            );
        });
    }

    public addTooltipToTurnOrder() {
        const turnOrderContainers = document.querySelectorAll('.pyramids-container .turn-order-container');
        turnOrderContainers.forEach((container) => {
            const containerId = container.getAttribute('id');
            const turnOrder = parseInt(container.getAttribute('turn-order'));
            const playerId = container.closest('.a-pyramid-container').getAttribute('player-id');
            const playerDiv = this.gameui.divColoredPlayer(playerId, {}, false);
            
            this.gameui.addTooltipHtml(
                containerId,
                `<div class="turn-order-tooltip tooltip-wrapper">
                    <div class="tooltip-text">${_('${player}\'s turn order is ${order}').replace('${player}', playerDiv).replace('${order}', '<b>' + turnOrder.toString() + '</b>')}</div>
                </div>`,
                400
            );
        });
    }
}