class TooltipHandler{
	constructor(private gameui: GameBody) { 
        this.addTooltipToBonusCards();
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
                1000
            );
        });
    }
}