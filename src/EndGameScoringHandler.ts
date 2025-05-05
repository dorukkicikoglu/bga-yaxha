class EndGameScoringHandler{
    private endGameScoring: EndGameScoreData;
    private scoreContainer: HTMLDivElement;
    private table: HTMLTableElement;
    private thead: HTMLTableSectionElement;
    private tbody: HTMLTableSectionElement;
    private showButton: HTMLButtonElement;
    private hideButton: HTMLButtonElement;
    private fastForwardButton: HTMLButtonElement;
    private bodyClickHandler = null;
    private winner_ids: number[];

	constructor(private gameui: GameBody) { }

    public async displayEndGameScore(endGameScoring: EndGameScoreData) {
        this.endGameScoring = endGameScoring;

        if(this.scoreContainer){
            console.error('end-game-score-container already exists');
            return;
        }

        this.endGameScoring.player_scores = endGameScoring.player_scores;
        this.winner_ids = endGameScoring.winner_ids;

        document.getElementById('end-game-score-container')?.remove();

        this.scoreContainer = document.createElement('div');
        this.scoreContainer.classList.add('end-game-score-container');
        this.scoreContainer.style.opacity = '0';
        this.scoreContainer.innerHTML = `
            <div class="show-table-button" style="display: none;">
                <i class="fa6 fa6-ranking-star"></i>
            </div> 
            <div class="maximized-content"> 
                <i class="fa6 fa6-minimize close-table-button"></i>
                <table>
                    <thead></thead>
                    <tbody></tbody>
                </table>
                <div class="fast-forward-text"></div> 
            </div>
        `;
        document.getElementById('game_play_area_wrap')?.appendChild(this.scoreContainer);

        this.table = this.scoreContainer.querySelector('table');
        this.thead = this.scoreContainer.querySelector('thead');
        this.tbody = this.scoreContainer.querySelector('tbody');
        this.showButton = this.scoreContainer.querySelector('.show-table-button');
        this.hideButton = this.scoreContainer.querySelector('.close-table-button');
        this.fastForwardButton = this.scoreContainer.querySelector('.fast-forward-text');

        this.fillTable();
        this.bindShowHideButtons();

        this.fastForwardButton.innerHTML = '* ' + _(this.gameui.clickOrTap(true) + ' anywhere to fast forward');

        const instantFadeIn = this.gameui.gamedatas.gamestate.name === 'gameEnd';
        const anim = this.gameui.animationHandler.animateProperty({
            node: this.scoreContainer,
            properties: { opacity: 1 },
            duration: instantFadeIn ? 0 : 1000,
            delay: instantFadeIn ? 0 : 100,
            onEnd: async () => {
                this.scoreContainer.style.opacity = null;
                this.bindBodyScroll();
            }
        });
        await anim.start();
        await this.fadeInNextCell(); 
    }

    private fillTable() {
        // Create header row with player names
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th class="corner-no-border-cell"></th>'; // Empty corner cell
        
        // Add player name columns
        for(let player_id of this.gameui.playerSeatOrder) {
            const playerNameDiv = this.gameui.divColoredPlayer(player_id, {}, false);
            headerRow.innerHTML += `<th class="player-name-cell" player-id="${player_id}">${playerNameDiv}</th>`;
        }
        this.thead.appendChild(headerRow);

        // Create rows for each score type

        const scoreTypes = [];
        for (let colorIndex in this.gameui.CUBE_COLORS)
            scoreTypes.push({ index: colorIndex, type: 'color' });

        const firstPlayerScore = this.endGameScoring.player_scores[Object.keys(this.endGameScoring.player_scores)[0]];
        for (let bonusCardID in firstPlayerScore.bonus_card_points)
            scoreTypes.push({ index: bonusCardID, type: 'bonus' });

        scoreTypes.push({ index: 0, type: 'total' });

        // Add score rows
        for(let i = 0; i < scoreTypes.length; i++) {
            const row = document.createElement('tr');
            const scoreType = scoreTypes[i];
            
            let scoreTypeIconHTML: string;
            if(scoreType.type === 'color')
                scoreTypeIconHTML = this.gameui.createCubeDiv({color: scoreType.index, cube_id: 'score-sheet-cube'}).outerHTML;
            else if(scoreType.type === 'bonus')
                scoreTypeIconHTML = `<div class="a-bonus-card-icon-wrapper"><div class="a-bonus-card-icon" bonus-card-id="${scoreType.index}" id="score-sheet-bonus-card-${scoreType.index}"></div></div>`;
            else scoreTypeIconHTML = `<i class="fa fa-star total-icon"></i>`;

            row.innerHTML = `<td class="score-type-icon-cell"><div class="score-type-icon ${scoreType.type}-${scoreType.index}">${scoreTypeIconHTML}</div></td>`;
            

            for(let player_id of this.gameui.playerSeatOrder) {
                const playerScore = this.endGameScoring.player_scores[player_id];
                const cellScore = scoreTypes[i].type === 'color' ?
                    playerScore.color_points[scoreType.index] :
                    (scoreTypes[i].type === 'bonus' ? playerScore.bonus_card_points[scoreType.index] : playerScore.total);

                row.innerHTML += `<td><div class="cell-text" style="opacity: 0;" row-index="${i}" player-id="${player_id}">${cellScore}</div></td>`;
            }
            
            this.tbody.appendChild(row);
        }

        this.gameui.tooltipHandler.addTooltipToBonusCards('scoreSheet');
    }

    private bindShowHideButtons() {
        this.hideButton.addEventListener('click', () => {
            this.hideButton.style.display = 'none';
            this.scoreContainer.querySelectorAll('.maximized-content').forEach((node: HTMLDivElement) => { node.style.display = 'none'; });
            this.showButton.style.display = null;
        });

        this.showButton.addEventListener('click', () => {
            this.hideButton.style.display = null;
            this.scoreContainer.querySelectorAll('.maximized-content').forEach((node: HTMLDivElement) => { node.style.display = null; });
            this.showButton.style.display = 'none';
        });
    }

    private bindBodyScroll() {
        let fadeInTimeout: number = null;
        let scrollFadeAnim: ReturnType<typeof dojo.animateProperty> = false; 
        const ANIM_STATE: Record<string, number> = {still: 1, fadingIn: 2, fadingOut: 3};
        let animStatus = ANIM_STATE.still;

        // Bind scroll event listener to the body
        window.addEventListener('scroll', () => {
            clearTimeout(fadeInTimeout);

            fadeInTimeout = setTimeout(() => {
                if(scrollFadeAnim)
                    scrollFadeAnim.stop();

                animStatus = ANIM_STATE.fadingIn;
                scrollFadeAnim = this.gameui.animationHandler.animateProperty({
                    node: this.scoreContainer, 
                    duration: 300, 
                    properties: {opacity: 1}, 
                    onEnd: () => { animStatus = ANIM_STATE.still; }
                });

                scrollFadeAnim.start();
            }, 100);
            
            if(animStatus === ANIM_STATE.fadingOut)
                return;

            if(animStatus === ANIM_STATE.fadingIn && scrollFadeAnim)
                scrollFadeAnim.stop();

            animStatus = ANIM_STATE.fadingOut;
            scrollFadeAnim = this.gameui.animationHandler.animateProperty({
                node: this.scoreContainer, 
                duration: 300, 
                properties: {opacity: 0.3}, 
                onEnd: () => { animStatus = ANIM_STATE.still; }
            });
            scrollFadeAnim.start();
        });
    }

    private async fadeInNextCell() {
        const cells: HTMLDivElement[] = Array.from(this.tbody.querySelectorAll('.cell-text:not(.displayed)'));

        const overallContent: HTMLDivElement = document.getElementById('overall-content') as HTMLDivElement;
        overallContent.removeEventListener('click', this.bodyClickHandler);
    
        if(cells.length <= Object.keys(this.gameui.players).length * 2)
            this.gameui.animationHandler.animateProperty({node: this.fastForwardButton, duration: 400, properties: {opacity: 0}}).start();

        if(cells.length <= 0){
            const allCells = Array.from(this.tbody.querySelectorAll('.cell-text'));
            allCells.forEach((cell: HTMLDivElement) => { cell.style.opacity = ''; });
            this.makeWinnersJump();
            this.setPlayerScores();

            return;
        }

        let cell: HTMLDivElement = cells[0];
        const instantFadeIn = this.gameui.gamedatas.gamestate.name === 'gameEnd';
        cell.classList.add('displayed');
        const fadeInAnim = this.gameui.animationHandler.animateProperty({
            properties: {opacity: 1},
            node: cell, 
            duration: instantFadeIn ? 0 : 500,
            delay: instantFadeIn ? 0 : 100,
        });

        this.bodyClickHandler = async (event: MouseEvent) => {
            cell.style.opacity = '1 !important';
            fadeInAnim.onEnd();
        };

        overallContent.addEventListener('click', this.bodyClickHandler);

        await fadeInAnim.start();
        await this.fadeInNextCell();
    }

    private makeWinnersJump() {
        for(let winner_id of this.winner_ids)
            this.thead.querySelector(`.player-name-cell[player-id="${winner_id}"]`).classList.add('jumping-text');
    }

    private setPlayerScores() {
        for(let player_id of this.gameui.playerSeatOrder)
            this.gameui.players[player_id].setPlayerScore(this.endGameScoring.player_scores[player_id].total);
    }
}

//ekmek skor tipini guzellestir