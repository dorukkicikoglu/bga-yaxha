class TooltipHandler{
	constructor(private gameui: GameBody) { 
        this.addTooltipToBonusCards();
        this.addTooltipToTurnOrder();
	}

	public addTooltipToBonusCards(){
        const bonusCardIcons = this.gameui.marketHandler.getBonusCardIconsContainer().querySelectorAll('.a-bonus-card-icon');
        bonusCardIcons.forEach(cardIcon => {
            const cardIconID = cardIcon.getAttribute('id');
            const cardID = cardIcon.getAttribute('bonus-card-id');
            const tooltipHTML = this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text;

            //ekmek tooltip background guzellestir
            this.gameui.addTooltipHtml(
                cardIconID,
                `<div class="bonus-card-tooltip tooltip-wrapper" bonus-card-id="${cardID}">
                    <div class="tooltip-text">${_(this.gameui.BONUS_CARDS_DATA[cardID].tooltip_text)}</div>
                    <div class="tooltip-image"></div>
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
                    <div class="tooltip-text">${_('${player}\'s turn order: ${order}').replace('${player}', playerDiv).replace('${order}', turnOrder.toString())}</div>
                </div>`,
                400
            );
        });
    }
}