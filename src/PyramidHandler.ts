type PyramidCubeMoveType = 'from_market' | 'from_last_built';

class PyramidHandler {
    private pyramidContainer: HTMLDivElement;
    private cubesContainer: HTMLDivElement;
    private unplacedCube: PyramidCube;
    private cubesInConstruction: { [cubeId: number]: PyramidCube } = {};
    private centerTilesAnim: ReturnType<typeof dojo.animateProperty>;
    private moveCubeAnim: ReturnType<typeof dojo.animateProperty> = null;
    private expandToBuildDuration: number = 300;

    constructor(private gameui: GameBody,private owner: PlayerHandler,private PYRAMID_MAX_SIZE: number,private pyramidData: PyramidCube[]) {
        this.initPyramidContainer();
    }

    private initPyramidContainer(): void {
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.owner.playerID;
		this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.owner.playerID.toString());
        if(this.owner.playerID.toString() == this.gameui.player_id)
            this.pyramidContainer.classList.add('my-pyramid');

        this.pyramidContainer.style.setProperty('--player-color', '#' + this.owner.playerColor);
        this.pyramidContainer.style.setProperty('--player-color-hex', this.gameui.hexToRgb(this.owner.playerColor));
        
        this.pyramidContainer.style.setProperty('--expand-to-build-duration', `${this.expandToBuildDuration / 1000}s`);
        
        const turnOrderContainerId = `turn-order-${this.owner.playerID}`;

		this.pyramidContainer.innerHTML = `
			<div class="player-name-text">
				<div class="text-container">${this.owner.getPlayerName()}</div>
			</div>
			<div class="turn-order-container" id="${turnOrderContainerId}" turn-order="${this.owner.getTurnOrder()}"></div>
            <div class="cubes-container"></div>
        `;
		
		document.getElementById('player-tables').querySelector('.pyramids-container').insertAdjacentElement(
			Number(this.owner.playerID) === Number(this.gameui.player_id) ? 'afterbegin' : 'beforeend',
			this.pyramidContainer
		);

        this.cubesContainer = this.pyramidContainer.querySelector('.cubes-container');
        if(this.canPlayerBuildPyramid())
            this.enableBuildPyramid();

        // Create cubes from pyramid data
        
        let maxOrderCubeInConstruction = null;
        const buildCubes: PyramidCube[] = [];

        this.pyramidData.forEach(cube => {
            cube.div = this.gameui.createCubeDiv(cube);
            cube.div.setAttribute('pos-x', cube.pos_x.toString());
            cube.div.setAttribute('pos-y', cube.pos_y.toString());
            cube.div.setAttribute('pos-z', cube.pos_z.toString());
            this.cubesContainer.appendChild(cube.div);

            if(cube.order_in_construction) {
                this.cubesInConstruction[cube.cube_id] = cube;
                if(!maxOrderCubeInConstruction || cube.order_in_construction > maxOrderCubeInConstruction.order_in_construction) {
                    maxOrderCubeInConstruction = cube;
                }
            } else buildCubes.push(cube);
        });
        this.pyramidData = buildCubes;

        if(!this.owner.are_cubes_built && maxOrderCubeInConstruction)
            this.unplacedCube = maxOrderCubeInConstruction;
        
        this.arrangeCubesZIndex();
        this.centerCubesContainer(false);
    }

	private async enableBuildPyramid() {
        if(this.owner.are_cubes_built || this.owner.isZombie()){
            this.updatePyramidStatusText();
            return;
        }

        const previouslyEnabled = this.pyramidContainer.getAttribute('build-pyramid-enabled') === 'true';
        
        await this.enableAndExpandIfMobile();
        this.drawSnapPoints();
        this.centerCubesContainer(previouslyEnabled);
        this.displaySwitchColorButton();
        this.arrangeCubesZIndex();
        this.updatePyramidStatusText();
    }
    public enableBuildOnEnteringState() {
        const canBuild = this.canPlayerBuildPyramid();
        if(!canBuild || this.pyramidContainer.getAttribute('build-pyramid-enabled') === 'true'){
            if(this.gameui.gamedatas.gamestate.name == 'buildPyramid' || canBuild || this.owner.are_cubes_built)
                this.updatePyramidStatusText();
            return;
        }
        
        this.enableBuildPyramid();
    }

    private onSnapPointClicked(args) { //args is either event target or an array [posX, posY, posZ]
        if(this.moveCubeAnim)
            return;
        
        const myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if(!myPyramid)
            return;

        const lastBuiltCube = this.unplacedCube;
        if(this.unplacedCube){ //save the last built cube
            const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            
            marketTile.querySelectorAll('.a-cube[built-status="selected-cube"]').forEach(cube => { cube.removeAttribute('built-status'); });
            marketTile.querySelector('.a-cube[cube-id="' + this.unplacedCube.cube_id + '"]').setAttribute('built-status', 'built-cube');

            this.unplacedCube = null;
        }

        const posX = Number(args.target.getAttribute('pos-x'));
        const posY = Number(args.target.getAttribute('pos-y'));
        const posZ = Number(args.target.getAttribute('pos-z'));

        const marketCubeData: MarketCube = this.getNextUnplacedMarketCube(args.target.getAttribute('possible-colors'));
        const moveType: PyramidCubeMoveType = marketCubeData ? 'from_market' : 'from_last_built';

        const cubeData: PyramidCube = (moveType == 'from_market') ?
            {
                pos_x: posX,
                pos_y: posY,
                pos_z: posZ,
                color: marketCubeData.color,
                cube_id: marketCubeData.cube_id,
                order_in_construction: Object.keys(this.cubesInConstruction).length + 1,
                div: null
            } :
            {
                pos_x: posX,
                pos_y: posY,
                pos_z: posZ,
                color: lastBuiltCube.color,
                cube_id: lastBuiltCube.cube_id,
                order_in_construction: lastBuiltCube.order_in_construction,
                div: lastBuiltCube.div
            };

        this.cubesInConstruction[cubeData.cube_id] = cubeData;

        this.animateUnplacedCubeToPyramid(cubeData, moveType); 
    }
    
    private drawSnapPoints() {
        const myPyramid = this.owner.playerID.toString() == this.gameui.player_id;

        if(!myPyramid)
            return;

        const possibleMoves = this.getPossibleMoves();

        if(!possibleMoves){
            console.error(`No possible moves for player ${this.owner.playerID} (likely a zombie player coming back to game)`, this.owner);
            return;
        }
        
        const placeIcon = 'fa-download';
        const moveIcon = 'fa-angle-double-right';

        const snapPointIcon = Object.keys(this.cubesInConstruction).length < this.gameui.CUBES_PER_MARKET_TILE ? placeIcon : moveIcon;

        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach((el) => el.classList.add('to-remove'));
        possibleMoves.forEach((pos) => {
            const existingSnapPoint: HTMLDivElement = this.cubesContainer.querySelector(`.pyramid-cube-snap-point[pos-x="${pos.pos_x}"][pos-y="${pos.pos_y}"][pos-z="${pos.pos_z}"]`);

            const interactableMarketCube = this.getNextUnplacedMarketCube(pos.possible_colors.join('_'));
            // const icon = interactableMarketCube != null ? placeIcon : moveIcon;

            if(existingSnapPoint){
                existingSnapPoint.classList.remove('to-remove');
                existingSnapPoint.setAttribute('possible-colors', pos.possible_colors.join('_'));
                if(!existingSnapPoint.querySelector('.snap-point-icon.' + snapPointIcon))
                existingSnapPoint.innerHTML = `<i class="snap-point-icon fa6 ${snapPointIcon}" style="opacity: 0;"></i>`;

                return;
            }

            const snapPoint = document.createElement('div');
            snapPoint.className = 'pyramid-cube-snap-point';
            snapPoint.setAttribute('pos-x', pos.pos_x.toString());
            snapPoint.setAttribute('pos-y', pos.pos_y.toString());
            snapPoint.setAttribute('pos-z', pos.pos_z.toString());
            snapPoint.setAttribute('possible-colors', pos.possible_colors.join('_'));
            snapPoint.innerHTML = `<i class="snap-point-icon fa6 ${snapPointIcon}" style="opacity: 0;"></i>`;

            this.cubesContainer.appendChild(snapPoint);
            snapPoint.addEventListener('click', (args) => this.onSnapPointClicked(args));
            this.gameui.animationHandler.animateProperty({node: snapPoint, properties: {opacity: 1}, duration: 300}).play();
        });

        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point.to-remove').forEach((el) => el.remove());
        setTimeout(() => {
            this.cubesContainer.querySelectorAll('.snap-point-icon').forEach((el: HTMLDivElement) => { el.style.opacity = null; });
        }, 200);
    }

    private getPossibleMoves(): PossibleMove[] {
        if(this.owner.isZombie())
            return null;

        const cubesInPyramid = this.getPyramidCubesExceptFinalBuilt();

        let colorsOnMarketTile = this.getAvailableColorsOnMarketTile();

        if(colorsOnMarketTile == null){
            console.error(`No available colors on market tile for player ${this.owner.playerID} (likely a zombie player coming back to game)`, this.owner);
            return null;
        }

        if(colorsOnMarketTile.length == 0 && this.unplacedCube) //if no colors on market tile, the unplaced cube will be moving around
            colorsOnMarketTile = [this.unplacedCube.color];

        if (cubesInPyramid.length === 0)
            return [{pos_x: 0, pos_y: 0, pos_z: 0, possible_colors: colorsOnMarketTile}];

        const possibleMovesDict: Record<number, Record<number, number>> = {};
        const cubeCoordsZXY_Color: Record<number, Record<number, Record<number, string>>> = {};
        const cubeCountByLayer: Record<number, number> = {};
    
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
    
        // calculate possible moves for the bottom layer
        for (const cube of cubesInPyramid) {
            const posX = Number(cube.pos_x);
            const posY = Number(cube.pos_y);
            const posZ = Number(cube.pos_z);
    
            cubeCoordsZXY_Color[posZ] ??= {};
            cubeCoordsZXY_Color[posZ][posX] ??= {};
            cubeCoordsZXY_Color[posZ][posX][posY] = cube.color;
    
            cubeCountByLayer[posZ] = (cubeCountByLayer[posZ] ?? 0) + 1;
    
            possibleMovesDict[posX] ??= {};
            possibleMovesDict[posX][posY + 1] = 1;
            possibleMovesDict[posX][posY - 1] = 1;
            possibleMovesDict[posX + 1] ??= {};
            possibleMovesDict[posX + 1][posY] = 1;
            possibleMovesDict[posX - 1] ??= {};
            possibleMovesDict[posX - 1][posY] = 1;
    
            minX = Math.min(minX, posX);
            minY = Math.min(minY, posY);
            maxX = Math.max(maxX, posX);
            maxY = Math.max(maxY, posY);
        }
    
        const xFilled = (maxX - minX) >= this.gameui.PYRAMID_MAX_SIZE - 1;
        const yFilled = (maxY - minY) >= this.gameui.PYRAMID_MAX_SIZE - 1;
    
        if (xFilled) {
            delete possibleMovesDict[minX - 1];
            delete possibleMovesDict[maxX + 1];
        }
    
        if (yFilled) {
            for (const x in possibleMovesDict) {
                delete possibleMovesDict[parseInt(x)][minY - 1];
                delete possibleMovesDict[parseInt(x)][maxY + 1];
            }
        }
    
        // remove occupied cells
        if (cubeCoordsZXY_Color[0]) {
            for (const posXStr in cubeCoordsZXY_Color[0]) {
                const posX = parseInt(posXStr);
                for (const posYStr in cubeCoordsZXY_Color[0][posX]) {
                    const posY = parseInt(posYStr);
                    if (possibleMovesDict[posX]) {
                        delete possibleMovesDict[posX][posY];
                    }
                }
            }
        }
    
        let playerPossibleMoves: PossibleMove[] = [];
        for (const posXStr in possibleMovesDict) {
            const posX = parseInt(posXStr);
            for (const posYStr in possibleMovesDict[posX]) {
                const posY = parseInt(posYStr);
                playerPossibleMoves.push({pos_x: posX, pos_y: posY, pos_z: 0, possible_colors: colorsOnMarketTile});
            }
        }

        // first layer finished, check upper layers
        let posZ = 1;
        while (posZ < this.gameui.PYRAMID_MAX_SIZE) {
            if (!cubeCountByLayer[posZ - 1] || cubeCountByLayer[posZ - 1] < 4)
                break;

            for (const posXStr in cubeCoordsZXY_Color[posZ - 1]) {
                const posX = parseInt(posXStr);
                for (const posYStr in cubeCoordsZXY_Color[posZ - 1][posX]) {
                    const posY = parseInt(posYStr);

                    if (cubeCoordsZXY_Color[posZ]?.[posX]?.[posY]) //continue if the cube is already in the pyramid
                        continue;
                    if (!cubeCoordsZXY_Color[posZ - 1][posX + 1]?.[posY]) //continue if the cube has no neighbor on the right-bottom
                        continue;
                    if (!cubeCoordsZXY_Color[posZ - 1][posX]?.[posY + 1]) //continue if the cube has no neighbor on the left-top
                        continue;
                    if (!cubeCoordsZXY_Color[posZ - 1][posX + 1]?.[posY + 1]) //continue if the cube has no neighbor on the right-top
                        continue;

                    const potentialCube = {pos_x: posX, pos_y: posY, pos_z: posZ, color: '', cube_id: '', order_in_construction: null, div: null};
                    const neighborColors = this.getCubeNeighborColors(potentialCube, cubeCoordsZXY_Color);
              
                    if (neighborColors.length == 0)
                        continue;

                    const possibleColors = neighborColors.filter(color => colorsOnMarketTile.includes(color));

                    if (possibleColors.length === 0)
                        continue;
    
                    playerPossibleMoves.push({pos_x: posX, pos_y: posY, pos_z: posZ, possible_colors: possibleColors});
                }
            }
    
            posZ++;
        }

        if (this.unplacedCube) { //make sure the unplaced cube is not in the possible moves since getPyramidCubesExceptFinalBuilt rules it out
            playerPossibleMoves = playerPossibleMoves.filter(move => 
                move.pos_x !== this.unplacedCube.pos_x || 
                move.pos_y !== this.unplacedCube.pos_y || 
                move.pos_z !== this.unplacedCube.pos_z
            );
        }

        return playerPossibleMoves;
    }

    private getPyramidCubesExceptFinalBuilt(): PyramidCube[] {
        const cubes = [];
        const allCubes = [...Object.values(this.pyramidData), ...Object.values(this.cubesInConstruction)];

        for(const cube of allCubes) // final cube does not add to possible moves
            if(Number(cube.order_in_construction) !== Number(this.gameui.CUBES_PER_MARKET_TILE))
                cubes.push(cube);

        return cubes;
    }

    private getCubeNeighborColors(cube: PyramidCube, cubeCoordsZXY_Color: Record<number, Record<number, Record<number, string>>> | null = null): string[] {
        const posX = Number(cube.pos_x);
        const posY = Number(cube.pos_y);
        const posZ = Number(cube.pos_z);

        if(!cubeCoordsZXY_Color){
            const cubesInPyramid = this.getPyramidCubesExceptFinalBuilt();
            cubeCoordsZXY_Color = cubesInPyramid.reduce((acc: Record<number, Record<number, Record<number, string>>>, cube) => {
                acc[cube.pos_z] ??= {};
                acc[cube.pos_z][cube.pos_x] ??= {};
                acc[cube.pos_z][cube.pos_x][cube.pos_y] = cube.color;
                return acc;
            }, {});
        }

        const neighborPositions = [
            [posX + 1, posY, posZ],
            [posX - 1, posY, posZ],
            [posX, posY + 1, posZ],
            [posX, posY - 1, posZ],
            [posX, posY, posZ - 1],
            [posX + 1, posY, posZ - 1],
            [posX, posY + 1, posZ - 1],
            [posX + 1, posY + 1, posZ - 1],
        ];

        // Get colors of all neighbor cubes in a hash
        const neighborColors = {};
        neighborPositions.forEach(([neighX, neighY, neighZ]) => {
            if (cubeCoordsZXY_Color[neighZ]?.[neighX]?.[neighY])
                neighborColors[cubeCoordsZXY_Color[neighZ][neighX][neighY]] = 1;
        });

        return Object.keys(neighborColors);
    }

    private getAvailableColorsOnMarketTile(): string[] {
        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        if(!marketTile){
            console.error(`No collected market tile for player ${this.owner.playerID} (likely a zombie player coming back to game)`, this.owner);
            return null;
        }

        const availableCubes: HTMLDivElement[] = Array.from(marketTile.querySelectorAll('.a-cube:not([built-status])'));

        const availableColorsDict: Record<string, number> = {};
        availableCubes.forEach(cube => {
            const cubeColor = cube.getAttribute('color');
            availableColorsDict[cubeColor] = 1;
        });

        return Object.keys(availableColorsDict);
    }

    public updatePyramidStatusText(){
        let statusText = null;

        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile'){
            if(this.owner.are_cubes_built)
                statusText = dojo.string.substitute(_('${actplayer} must select an available Market Tile'), {actplayer: this.gameui.divActivePlayer()});
            else {
                statusText = dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), {you: this.gameui.divYou()});
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = statusText;

                document.title = '◣' + tempDiv.innerText;
            }
        } else if (this.gameui.gamedatas.gamestate.name === 'buildPyramid'){
            if(this.owner.are_cubes_built)
                statusText = dojo.string.substitute(_('Waiting for other players to build Pyramids'), {you: this.gameui.divYou()});
            else statusText = dojo.string.substitute(_('${you} need to build your Pyramid'), {you: this.gameui.divYou()});
        }

        if(!statusText)
            return;
        
        const showConfirmButton = (Object.keys(this.cubesInConstruction).length >= this.gameui.CUBES_PER_MARKET_TILE || this.pyramidContainer.querySelectorAll('.pyramid-cube-snap-point').length <= 0) && !this.owner.are_cubes_built;
        const showUndoButton = Object.keys(this.cubesInConstruction).length > 0;
        
        if(showConfirmButton || showUndoButton){
            let buttonHTML = '';
            if(showConfirmButton){
                const allCubesBuilt = Object.keys(this.cubesInConstruction).length >= this.gameui.CUBES_PER_MARKET_TILE;

                if(Object.keys(this.cubesInConstruction).length > 0){
                    let cubeIconsHTML = '';
                    const sortedCubes = Object.values(this.cubesInConstruction).sort((a, b) => a.order_in_construction - b.order_in_construction);
                    for(let cube of sortedCubes)
                        cubeIconsHTML += this.gameui.createCubeDiv(cube).outerHTML;

                    cubeIconsHTML = '<div class="cube-wrapper">' + cubeIconsHTML + '</div>';

                    statusText = dojo.string.substitute(_('Place${cubeIcons}'), {cubeIcons: cubeIconsHTML});
                } else {
                    statusText = _('You cannot place any of your cubes 😔');
                }
                buttonHTML += `<a class="confirm-place-cube-button bgabutton bgabutton_${allCubesBuilt ? 'blue' : 'red'}">` + (allCubesBuilt ? _('Confirm') : _('Confirm and discard the rest')) + '</a>';
            }

            if(showUndoButton)
                buttonHTML += '<a class="undo-place-cube-button bgabutton bgabutton_gray">' + _('Undo Build') + '</a>';

            statusText += buttonHTML;
        }

        this.gameui.updateStatusText(statusText);

        document.querySelector('#page-title .confirm-place-cube-button')?.addEventListener('click', () => this.confirmPlaceCubeButtonClicked());
        document.querySelector('#page-title .undo-place-cube-button')?.addEventListener('click', () => this.undoPlaceCubeButtonClicked());
    }

    private animateUnplacedCubeToPyramid(cubeData: PyramidCube, moveType: PyramidCubeMoveType) {
        if(this.moveCubeAnim)
            return;

        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());

        this.unplacedCube = cubeData;
        let goTo: HTMLDivElement = this.cubesContainer.querySelector(`.pyramid-cube-snap-point[pos-x="${this.unplacedCube.pos_x}"][pos-y="${this.unplacedCube.pos_y}"][pos-z="${this.unplacedCube.pos_z}"]`);

        const marketCubeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--market-cube-size'));
        const pyramidCubeSize = goTo.offsetWidth;

        let animSpeed = 400;

        if(!this.unplacedCube.div){ //search Market Tiles
            const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            let marketCubeDiv: HTMLDivElement = marketTile.querySelector(`.a-cube[cube-id="${cubeData.cube_id}"]`);

            this.unplacedCube.div = marketCubeDiv.cloneNode(true) as HTMLDivElement;
            this.unplacedCube.div.style.width = marketCubeSize + 'px';
            this.unplacedCube.div.style.height = marketCubeSize + 'px';
            this.unplacedCube.div.style.maxWidth = pyramidCubeSize + 'px'; //so that the expansion animation happens half way
            this.unplacedCube.div.style.maxHeight = pyramidCubeSize + 'px';

            this.cubesContainer.appendChild(this.unplacedCube.div);

            marketCubeDiv.setAttribute('built-status', 'selected-cube');
            this.gameui.placeOnObject(this.unplacedCube.div, marketCubeDiv);

            animSpeed = 600;
        }

        this.unplacedCube.div.style.transition = 'none';
        this.moveCubeAnim = this.gameui.animationHandler.animateProperty({
            node: this.unplacedCube.div,
            properties: { top: goTo.offsetTop, left: goTo.offsetLeft, width: pyramidCubeSize * 2, height: pyramidCubeSize * 2 },
            duration: animSpeed,
            easing: 'easeIn',
            onBegin: () => { this.unplacedCube.div.classList.add('animating-cube'); },
            onEnd: () => { 
                this.unplacedCube.div.classList.remove('animating-cube');
                            
                this.unplacedCube.div.setAttribute('pos-x', goTo.getAttribute('pos-x'));
                this.unplacedCube.div.setAttribute('pos-y', goTo.getAttribute('pos-y'));
                this.unplacedCube.div.setAttribute('pos-z', goTo.getAttribute('pos-z'));

                goTo.replaceWith(this.unplacedCube.div);
                this.unplacedCube.div.style.width = null;
                this.unplacedCube.div.style.height = null;
                this.unplacedCube.div.style.maxWidth = null;
                this.unplacedCube.div.style.maxHeight = null;
                this.unplacedCube.div.style.left = null;
                this.unplacedCube.div.style.top = null;
                this.unplacedCube.div.style.transition = null;
                this.gameui.ajaxAction(moveType == 'from_market' ? 'actAddCubeToPyramid' : 'actMoveCubeInPyramid', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
                this.moveCubeAnim = null;
                this.enableBuildPyramid();
            }
        });

        this.moveCubeAnim.start();
    }

    public animateOtherPlayerCubesToPyramid(cubeMoves: CubeToPyramidMoveData[]): ReturnType<typeof dojo.animateProperty> {
        if(this.moveCubeAnim)
            return;

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        const animSpeed = 600;

        const marketCubeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--market-cube-size'));
        const pyramidCubeSize = parseInt(getComputedStyle(document.body).getPropertyValue('--pyramid-cube-size'));

        let cubeAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];

        const collectingAvatar = marketTile.querySelector('.yaxha-player-avatar.collecting-player-avatar');
        if (collectingAvatar) {
            const fadeOutAvatar = this.gameui.animationHandler.animateProperty({
                node: collectingAvatar,
                properties: {opacity: 0},
                duration: 200,
                onEnd: () => {
                    collectingAvatar.remove();
                }
            });
            cubeAnimArray.push(fadeOutAvatar);
        }

        // Clone and position market cubes before animation to prevent visual glitches on removal
        marketTile.querySelectorAll('.a-cube').forEach((cube: HTMLElement) => {
            const cubeStyle = window.getComputedStyle(cube);
            cube.style.top = cubeStyle.top;
            cube.style.left = cubeStyle.left;
        });

        let delay = 0;

        const movedPyramidCubeDivs = [];
        for(const move of cubeMoves){
            let marketCubeDiv: HTMLDivElement = marketTile.querySelector(`.a-cube[cube-id="${move.cube_id}"]`);

            if(!marketCubeDiv)
                continue;

            marketCubeDiv.setAttribute('pos-x', move.pos_x.toString());
            marketCubeDiv.setAttribute('pos-y', move.pos_y.toString());
            marketCubeDiv.setAttribute('pos-z', move.pos_z.toString());
            marketCubeDiv.classList.add('animating-cube');
            
            let pyramidCubeDiv: HTMLDivElement = marketCubeDiv.cloneNode(true) as HTMLDivElement;
            pyramidCubeDiv.style.opacity = '0';
            pyramidCubeDiv.style.top = null;
            pyramidCubeDiv.style.left = null;
            this.cubesContainer.appendChild(pyramidCubeDiv);

            marketCubeDiv.style.width = marketCubeSize + 'px';
            marketCubeDiv.style.height = marketCubeSize + 'px';
            marketCubeDiv.style.maxWidth = pyramidCubeSize + 'px';
            marketCubeDiv.style.maxHeight = pyramidCubeSize + 'px';
            
            marketCubeDiv = this.gameui.attachToNewParent(marketCubeDiv, this.cubesContainer);

            let cubeData: PyramidCube = {
                cube_id: move.cube_id,
                pos_x: move.pos_x,
                pos_y: move.pos_y,
                pos_z: move.pos_z,
                color: move.color,
                order_in_construction: null,
                div: pyramidCubeDiv
            };

            this.pyramidData.push(cubeData);

            const builtCubeAnim = this.gameui.animationHandler.animateProperty({
                node: marketCubeDiv,
                properties: { top: pyramidCubeDiv.offsetTop, left: pyramidCubeDiv.offsetLeft, width: pyramidCubeSize * 2, height: pyramidCubeSize * 2 },
                duration: animSpeed + Math.floor(Math.random() * 101) - 50,
                easing: 'circleOut',
                delay: delay + Math.floor(Math.random() * 100),
                onEnd: () => { 
                    pyramidCubeDiv.replaceWith(marketCubeDiv);
                    pyramidCubeDiv = marketCubeDiv;
                    pyramidCubeDiv.classList.remove('animating-cube');
                    pyramidCubeDiv.style.width = null;
                    pyramidCubeDiv.style.height = null;
                    pyramidCubeDiv.style.maxWidth = null;
                    pyramidCubeDiv.style.maxHeight = null;
                    pyramidCubeDiv.style.top = null;
                    pyramidCubeDiv.style.left = null;

                    movedPyramidCubeDivs.push(pyramidCubeDiv);

                    const shineAnimationDuration = 2000; 
                    if(movedPyramidCubeDivs.length >= cubeMoves.length){
                        movedPyramidCubeDivs.forEach(cube => {
                            cube.setAttribute('shine-once', shineAnimationDuration.toString());
                        });
                        this.arrangeCubesZIndex();
                        this.centerCubesContainer(true);
                        this.moveCubeAnim = null; 
                    }
                }
            });
    
            cubeAnimArray.push(builtCubeAnim);
            delay += 50;
        }

        this.arrangeCubesZIndex();

        this.moveCubeAnim = this.gameui.animationHandler.combine(cubeAnimArray);
        
        return this.moveCubeAnim;
    }

    public saveAllCubesInPyramid() {
        for (let i = 0; i < this.pyramidData.length; i++)
            this.pyramidData[i].order_in_construction = null;

        this.unplacedCube = null;
        this.cubesInConstruction = {};
        this.owner.are_cubes_built = false;
    }
    
    private confirmPlaceCubeButtonClicked() {
        this.gameui.ajaxAction('actConfirmBuildPyramid', {}, true, false);
    }

    public async confirmedBuildPyramid() {
        this.owner.are_cubes_built = true;

        // Save all cubes in construction to pyramid data
        Object.values(this.cubesInConstruction).forEach(cube => {
            if (!this.pyramidData.some(existingCube => existingCube.cube_id === cube.cube_id)) {
                this.pyramidData.push(cube);
            }
        });

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(cube => {
            if(!cube.hasAttribute('built-status'))
                cube.setAttribute('built-status', 'discarded-cube');
            else cube.setAttribute('built-status', 'built-cube');
        });
        
        await this.disableAndShrinkIfMobile();
    }

    private async undoPlaceCubeButtonClicked() {
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(snapPoint => {
            this.gameui.animationHandler.fadeOutAndDestroy(snapPoint as HTMLDivElement, 100);
        });

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);

        const marketCubeSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--market-cube-size'));
        const pyramidCubeSize = (this.cubesContainer.querySelector('.a-cube') as HTMLElement).offsetWidth;

        let maxDuration = 0;
        
        // Get all cubes in construction and animate them back to their market positions
        Object.values(this.cubesInConstruction).forEach(async cube => {
            const marketCube: HTMLDivElement = marketTile.querySelector(`.a-cube[cube-id="${cube.cube_id}"]`);
            if (!marketCube) 
                return;

            const goTo: HTMLDivElement = marketCube.cloneNode(true) as HTMLDivElement;
            goTo.style.width = marketCubeSize + 'px';
            goTo.style.height = marketCubeSize + 'px';
            goTo.style.opacity = '0';

            document.getElementById('player-tables').appendChild(goTo);
            this.gameui.placeOnObject(goTo, marketCube);
            
            cube.div.style.width = pyramidCubeSize + 'px';
            cube.div.style.height = pyramidCubeSize + 'px';
            cube.div.style.minWidth = marketCubeSize + 'px'; //so that the shrinking animation happens half way
            cube.div.style.minHeight = marketCubeSize + 'px';
            cube.div.classList.add('animating-cube');

            const cubeDivClone = cube.div.cloneNode(true) as HTMLDivElement;
            cubeDivClone.style.width = pyramidCubeSize + 'px';
            cubeDivClone.style.height = pyramidCubeSize + 'px';
            cubeDivClone.style.zIndex = '1000';
            document.getElementById('player-tables').appendChild(cubeDivClone);
            this.gameui.placeOnObject(cubeDivClone, cube.div);
            cube.div.remove();

            const goToLeft = this.gameui.remove_px(goTo.style.left);
            const goToTop = this.gameui.remove_px(goTo.style.top);

            goTo.remove();

            const delay = Math.floor(Math.random() * 50);
            const duration = 450 + Math.floor(Math.random() * 50);
            maxDuration = Math.max(maxDuration, duration);

            await this.gameui.wait(delay);

            cubeDivClone.style.transition = `width ${duration}ms, height ${duration}ms, left ${duration}ms, top ${duration}ms`;
            cubeDivClone.style.width = marketCubeSize/2 + 'px';
            cubeDivClone.style.height = marketCubeSize/2 + 'px';
            cubeDivClone.style.left = goToLeft + 'px';
            cubeDivClone.style.top = goToTop + 'px';

            setTimeout(() => {
                cubeDivClone.remove();
                marketCube.removeAttribute('built-status');
            }, duration);
        });

        // Remove cubes from pyramidData that match IDs in cubesInConstruction
        this.pyramidData = this.pyramidData.filter(cube => 
            !Object.values(this.cubesInConstruction).some(constructionCube => 
                constructionCube.cube_id === cube.cube_id
            )
        );
        this.cubesInConstruction = {};
        this.unplacedCube = null;
        this.owner.are_cubes_built = false;

        this.gameui.ajaxAction('actUndoBuildPyramid', {}, true, false);

        marketTile.querySelectorAll('.a-cube[built-status="discarded-cube"]').forEach((cube: HTMLDivElement) => {
            cube.style.transition = 'opacity 200ms';
            cube.style.opacity = '1';
            setTimeout(() => {
                cube.removeAttribute('built-status');
                cube.style.opacity = null;
                cube.style.transition = null;
            }, 200);
        });

        await this.gameui.wait(maxDuration + 100);
        this.enableBuildPyramid();
    }

    private centerCubesContainer(doAnimate) {
        const contentsRect = this.gameui.getContentsRectangle(this.cubesContainer, 'animating-cube');
        
        if(!contentsRect)
            return;
        
        const centerPointDiv = document.createElement('div');
        centerPointDiv.style.width = '1px';
        centerPointDiv.style.height = '1px';
        this.cubesContainer.appendChild(centerPointDiv);

        const centerPoint = this.gameui.getPos(centerPointDiv);
        centerPointDiv.remove();

        const midPointX = (contentsRect.maxX + contentsRect.minX) / 2;
        const midPointY = (contentsRect.maxY + contentsRect.minY) / 2;
        
        let offsetX = centerPoint.x - midPointX;
        const offsetY = centerPoint.y - midPointY;

        if(this.centerTilesAnim){
            this.centerTilesAnim.stop();
            this.centerTilesAnim = null;
        }

        const pyramidCubeSize = parseInt(getComputedStyle(document.body).getPropertyValue('--pyramid-cube-size'));
        offsetX -= pyramidCubeSize * 0.16; //move slightly left to make up for right-side of cubes

        if(doAnimate){
            this.centerTilesAnim = this.gameui.animationHandler.animateProperty({
                node: this.cubesContainer,
                duration: 400, //make animation 1 sec faster so the clicks near the end also work
                properties: {marginLeft: offsetX, marginTop: offsetY}
            });
            this.centerTilesAnim.start();
        } else {    
            this.cubesContainer.style.marginLeft = offsetX + 'px';
            this.cubesContainer.style.marginTop = offsetY + 'px';
        }
    }

    private arrangeCubesZIndex() {
        let cubes: HTMLDivElement[] = Array.from(this.cubesContainer.querySelectorAll('.a-cube, .pyramid-cube-snap-point, .switch-color-button'));

        cubes.sort(function(a, b) {
            const posZA = parseInt(a.getAttribute("pos-z"));
            const posZB = parseInt(b.getAttribute("pos-z"));
            const posXA = parseInt(a.getAttribute("pos-x"));
            const posXB = parseInt(b.getAttribute("pos-x"));
            const posYA = parseInt(a.getAttribute("pos-y"));
            const posYB = parseInt(b.getAttribute("pos-y"));

            if (posZA !== posZB)
                return posZA - posZB;

            if (a.classList.contains('pyramid-cube-snap-point'))
                return -1;
            if (b.classList.contains('pyramid-cube-snap-point'))
                return 1;

            if (posXA !== posXB)
                return posXA - posXB;
            return posYB - posYA;
        });

        let zIndex = 1;
        cubes.forEach((cube) => { 
            cube.style.zIndex = zIndex.toString();
            zIndex++;
        });
    }

    private async enableAndExpandIfMobile() {
        if(this.pyramidContainer.getAttribute('build-pyramid-enabled') === 'true')
            return;

        this.pyramidContainer.setAttribute('build-pyramid-enabled', 'true'); 

        if(!this.gameui.isMobile())
            return;
        
        const expansionRate: number = parseFloat(getComputedStyle(this.pyramidContainer).getPropertyValue('--expansion-rate').trim());
        const currentMarginLeft = parseFloat(this.cubesContainer.style.marginLeft);
        const currentMarginTop = parseFloat(this.cubesContainer.style.marginTop);
        const goToMarginLeft = currentMarginLeft * expansionRate;
        const goToMarginTop = currentMarginTop * expansionRate;
       
       this.centerTilesAnim = this.gameui.animationHandler.animateProperty({
            node: this.cubesContainer,
            duration: this.expandToBuildDuration - 20,
            properties: {marginLeft: goToMarginLeft, marginTop: goToMarginTop}
        });
        this.centerTilesAnim.start();

        await this.gameui.wait(this.expandToBuildDuration);
    }

    public async disableAndShrinkIfMobile() {
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(el => el.remove());
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());

        if(!this.gameui.isMobile()){
            this.pyramidContainer.removeAttribute('build-pyramid-enabled'); 
            this.centerCubesContainer(true); 
            this.updatePyramidStatusText();
            return;
        }

        if(this.pyramidContainer.getAttribute('build-pyramid-enabled') !== 'true'){
            this.updatePyramidStatusText();
            return;
        }

        const expansionRate: number = parseFloat(getComputedStyle(this.pyramidContainer).getPropertyValue('--expansion-rate').trim()); 
        const currentMarginLeft = parseFloat(this.cubesContainer.style.marginLeft);
        const currentMarginTop = parseFloat(this.cubesContainer.style.marginTop);
        const goToMarginLeft = currentMarginLeft / expansionRate;
        const goToMarginTop = currentMarginTop / expansionRate;
        
        this.centerTilesAnim = this.gameui.animationHandler.animateProperty({
            node: this.cubesContainer,
            duration: this.expandToBuildDuration - 20,
            properties: {marginLeft: goToMarginLeft, marginTop: goToMarginTop}
        });
        this.centerTilesAnim.start();

        this.cubesContainer.classList.add('shrinking-pyramid-cubes');
        this.pyramidContainer.removeAttribute('build-pyramid-enabled');

        await this.gameui.wait(this.expandToBuildDuration + 200);

        this.cubesContainer.classList.remove('shrinking-pyramid-cubes');
        this.centerCubesContainer(true); 
        this.updatePyramidStatusText();
    }

    private displaySwitchColorButton() {
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());

        if(!this.unplacedCube)
            return;

        if(Object.keys(this.cubesInConstruction).length >= this.gameui.CUBES_PER_MARKET_TILE)
            return;

        const availableColors = this.getAvailableColorsOnMarketTile();
        let availableColorsDict = {};
        availableColors.forEach(color => { availableColorsDict[color] = 1; });

        availableColorsDict[this.unplacedCube.color] = 1;

        if(this.unplacedCube.pos_z > 0){
            const neighborColors = this.getCubeNeighborColors(this.unplacedCube);
            const filteredColors = {};
            neighborColors.forEach(color => {
                if(color in availableColorsDict)
                    filteredColors[color] = 1;
            });
            availableColorsDict = filteredColors;
        }

        const possibleColors = Object.keys(availableColorsDict);
        if(possibleColors.length <= 1)
            return;

        const possibleColorsString = possibleColors.join('_');

        let switchColorButton: HTMLDivElement = document.createElement('div');
        switchColorButton.innerHTML = `<div class="switch-color-button" pos-x="${this.unplacedCube.pos_x}" pos-y="${this.unplacedCube.pos_y}" pos-z="${this.unplacedCube.pos_z}" possible-colors="${possibleColorsString}" ><i class="fa6 fa6-exchange switch-color-icon"></i></div>`;
        switchColorButton = switchColorButton.firstElementChild as HTMLDivElement;

        this.cubesContainer.appendChild(switchColorButton);

        switchColorButton.style.opacity = '0.82';
        switchColorButton.addEventListener('click', () => this.onSwitchColorButtonClicked());
    }
     
    private onSwitchColorButtonClicked() {
        const myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if(!myPyramid)
            return;

        const switchColorButton = this.cubesContainer.querySelector('.switch-color-button') as HTMLDivElement;
        const nextCubeData: MarketCube = this.getNextUnplacedMarketCube(switchColorButton.getAttribute('possible-colors'), this.unplacedCube.color);

        delete this.cubesInConstruction[this.unplacedCube.cube_id];

        this.unplacedCube.cube_id = nextCubeData.cube_id;
        this.unplacedCube.color = nextCubeData.color;
        this.unplacedCube.div.setAttribute('color', nextCubeData.color);
        this.unplacedCube.div.setAttribute('cube-id', nextCubeData.cube_id);
        this.cubesInConstruction[nextCubeData.cube_id] = this.unplacedCube;

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        
        marketTile.querySelectorAll('.a-cube[built-status="selected-cube"]').forEach(cube => { cube.removeAttribute('built-status'); });
        marketTile.querySelector('.a-cube[cube-id="' + nextCubeData.cube_id + '"]').setAttribute('built-status', 'selected-cube');

        this.gameui.ajaxAction('actPyramidCubeColorSwitched', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
        this.drawSnapPoints(); //newly placed block might have allowed placement of a same color cube on top of this cube
        this.arrangeCubesZIndex();
        this.updatePyramidStatusText(); //with the new cube color, possible positions might have changed which will change the confirm button text
    }
   
    private getNextUnplacedMarketCube(possibleColorsString: string, currentColor: string | null = null): MarketCube{
        const possibleColors = possibleColorsString.split('_');
        const nextColor = currentColor === null ? possibleColors[0] : possibleColors[(possibleColors.indexOf(currentColor) + 1) % possibleColors.length];

        const collectedMarketTileIndex: number = this.owner.getCollectedMarketTileData().collected_market_index;
        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        
        const nextCubeDiv:HTMLDivElement = marketTile.querySelector(`.a-cube:not([built-status])[color="${nextColor}"]`) as HTMLDivElement;

        if(!nextCubeDiv)
            return null;

        const cubeID = nextCubeDiv.getAttribute('cube-id');
        const cubeData: MarketCube = this.gameui.marketHandler.getCubesOfMarketTile(collectedMarketTileIndex).find((cube) => cube.cube_id === cubeID);

        return cubeData;
    }

    private canPlayerBuildPyramid(): boolean{
        if(this.owner.playerID.toString() != this.gameui.player_id.toString())
            return false;
        if(this.owner.are_cubes_built || this.owner.isZombie())
            return false;
        if(this.gameui.gamedatas.gamestate.name == 'buildPyramid')
            return true;
        if(this.gameui.gamedatas.gamestate.name == 'individualPlayerSelectMarketTile'){
            const playerCollectedMarketTile = this.gameui.myself ? //if called at page load, myself is not set yet
                this.gameui.myself.getCollectedMarketTileData() :
                this.gameui.gamedatas.collectedMarketTilesData.find((data) => data.player_id.toString() === this.owner.playerID.toString());

                if(playerCollectedMarketTile.type == 'collecting')
                return true;
        }

        return false;
    }

    public getUnplacedCube(): PyramidCube{ return this.unplacedCube; }
    public getCubesInConstruction(): { [cubeId: number]: PyramidCube }{ return this.cubesInConstruction; }
    public getPyramidContainerRect(): DOMRect{ return this.gameui.getPos(this.pyramidContainer); }
    public getTurnOrderContainer(): HTMLDivElement{ return this.pyramidContainer.querySelector('.turn-order-container') as HTMLDivElement; }
    public getPyramidContainer(): HTMLDivElement{ return this.pyramidContainer; }
}
function cube(value: Element, key: number, parent: NodeListOf<Element>): void {
    throw new Error("Function not implemented.");
}

