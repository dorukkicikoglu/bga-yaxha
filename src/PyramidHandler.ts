type PyramidCubeMoveType = 'from_market' | 'from_last_built';

class PyramidHandler {
    private pyramidContainer: HTMLDivElement;
    private cubesContainer: HTMLDivElement;
    private unplacedCube: PyramidCube;
    private rollingCubeColorIndex: number = 0;
    private availableColors: string[] = [];
    private cubesInConstruction: { [cubeId: number]: PyramidCube } = {};
    private centerTilesAnim: ReturnType<typeof dojo.animateProperty>;

    constructor(private gameui: GameBody,private owner: PlayerHandler,private PYRAMID_MAX_SIZE: number,private pyramidData: PyramidCube[]) {
        this.initPyramidContainer();
    }

    private initPyramidContainer(): void {
        this.pyramidContainer = document.createElement('div');
        this.pyramidContainer.id = 'pyramid-container-' + this.owner.playerID;
		this.pyramidContainer.className = 'a-pyramid-container';
        this.pyramidContainer.setAttribute('player-id', this.owner.playerID.toString());

		// Set the custom property for player color
        this.pyramidContainer.style.setProperty('--player-color', '#' + this.owner.playerColor);
        this.pyramidContainer.style.setProperty('--player-color-hex', this.gameui.hexToRgb(this.owner.playerColor));

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

        // Create cubes from pyramid data
        
        let maxOrderCubeInConstruction = null;
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
            }

        });

        if(!this.owner.built_cubes_this_round && maxOrderCubeInConstruction)
            this.unplacedCube = maxOrderCubeInConstruction;
        
        this.arrangeCubesZIndex();

        this.centerCubesContainer(false);
    }

	public enableBuildPyramid() {
        this.updatePyramidStatusText(); 

        if(this.owner.built_cubes_this_round)
            return;

        const previouslyEnabled = this.pyramidContainer.getAttribute('build-pyramid-enabled') === 'true';
        this.pyramidContainer.setAttribute('build-pyramid-enabled', 'true'); 

        this.calcAvailableColors();
        
        this.drawSnapPoints();
        this.centerCubesContainer(previouslyEnabled);
        this.displaySwitchColorButton();
        this.arrangeCubesZIndex();
    }
	public disableBuildPyramid() { 
        this.pyramidContainer.removeAttribute('build-pyramid-enabled'); 
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(el => el.remove());
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());
        this.centerCubesContainer();
        this.updatePyramidStatusText();
    }

    private onSnapPointClicked(args) { //args is either event target or an array [posX, posY, posZ]
        let myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if(!myPyramid)
            return;

        const lastBuiltCube = this.unplacedCube;

        if(this.unplacedCube){ //save the last built cube
            const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            marketTile.querySelectorAll('.a-cube').forEach(cube => { 
                cube.classList.remove('selected-for-pyramid'); 
                if(cube.getAttribute('cube-id') === this.unplacedCube.cube_id)
                    cube.classList.add('built-in-pyramid');
            });
            this.unplacedCube = null;

            this.rollingCubeColorIndex = 0;
            this.calcAvailableColors();
        }

        const posX = Number(args.target.getAttribute('pos-x'));
        const posY = Number(args.target.getAttribute('pos-y'));
        const posZ = Number(args.target.getAttribute('pos-z'));

        let marketCubeData: MarketCube = this.getCurrentUnplacedMarketCube();
        const moveType: PyramidCubeMoveType = marketCubeData ? 'from_market' : 'from_last_built';
        
        let cubeData: PyramidCube;
        if(moveType == 'from_market') {
            cubeData = {
                pos_x: posX,
                pos_y: posY,
                pos_z: posZ,
                color: marketCubeData.color,
                cube_id: marketCubeData.cube_id,
                order_in_construction: Object.keys(this.cubesInConstruction).length + 1,
                div: null
            };
        } else {
            cubeData = lastBuiltCube;
            cubeData.pos_x = posX;
            cubeData.pos_y = posY;
            cubeData.pos_z = posZ;
        }

        this.cubesInConstruction[cubeData.cube_id] = cubeData; //ekmek buildleme bitince resetle

        this.animateUnplacedCubeToPyramid(cubeData, moveType); 
    }
    
    private drawSnapPoints() {
        let myPyramid = this.owner.playerID.toString() == this.gameui.player_id;

        if(!myPyramid)
            return;

        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach((el) => el.classList.add('to-remove'));
        
        const possibleMoves = this.getPossibleMoves();
        possibleMoves.forEach((pos) => {
            const existingSnapPoint = Array.from(this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point')).find(el =>
              el.getAttribute('pos-x') === pos[0].toString() &&
              el.getAttribute('pos-y') === pos[1].toString() &&
              el.getAttribute('pos-z') === pos[2].toString()
            );

            if(existingSnapPoint){
                existingSnapPoint.classList.remove('to-remove');
                return;
            }

            const snapPoint = document.createElement('div');
            snapPoint.className = 'pyramid-cube-snap-point';
            snapPoint.setAttribute('pos-x', pos[0].toString());
            snapPoint.setAttribute('pos-y', pos[1].toString());
            snapPoint.setAttribute('pos-z', pos[2].toString());

            this.cubesContainer.appendChild(snapPoint);
            
            snapPoint.addEventListener('click', (args) => this.onSnapPointClicked(args));
            this.gameui.animationHandler.animateProperty({node: snapPoint, properties: {opacity: 1}, duration: 300}).play();
        });

        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point.to-remove').forEach((el) => el.remove());
    }

    private getPossibleMoves(): [number, number, number][] {
        const cubesInPyramid = [...Object.values(this.pyramidData), ...Object.values(this.cubesInConstruction)];

        if (cubesInPyramid.length === 0)
            return [[0, 0, 0]];
    
        const possibleMovesDict: Record<number, Record<number, number>> = {};
        const cubeCoordsDictByLayer: Record<number, Record<number, Record<number, number>>> = {};
        const cubeCountByLayer: Record<number, number> = {};
    
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
    
        // calculate possible moves for the bottom layer
        for (const cube of cubesInPyramid) {
            if (cube.order_in_construction == this.gameui.CUBES_PER_MARKET_TILE) // final cube does not add to possible moves
                continue;
    
            const posX = Number(cube.pos_x);
            const posY = Number(cube.pos_y);
            const posZ = Number(cube.pos_z);
    
            cubeCoordsDictByLayer[posZ] ??= {};
            cubeCoordsDictByLayer[posZ][posX] ??= {};
            cubeCoordsDictByLayer[posZ][posX][posY] = 1;
    
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
        if (cubeCoordsDictByLayer[0]) {
            for (const posXStr in cubeCoordsDictByLayer[0]) {
                const posX = parseInt(posXStr);
                for (const posYStr in cubeCoordsDictByLayer[0][posX]) {
                    const posY = parseInt(posYStr);
                    if (possibleMovesDict[posX]) {
                        delete possibleMovesDict[posX][posY];
                    }
                }
            }
        }
    
        const playerPossibleMoves: [number, number, number][] = [];
        for (const posXStr in possibleMovesDict) {
            const posX = parseInt(posXStr);
            for (const posYStr in possibleMovesDict[posX]) {
                const posY = parseInt(posYStr);
                playerPossibleMoves.push([posX, posY, 0]);
            }
        }
    
        // first layer finished, check upper layers
        let posZ = 1;
        while (posZ < this.gameui.PYRAMID_MAX_SIZE) {
            if (!cubeCountByLayer[posZ - 1] || cubeCountByLayer[posZ - 1] < 4)
                break;
    
            for (const posXStr in cubeCoordsDictByLayer[posZ - 1]) {
                const posX = parseInt(posXStr);
                for (const posYStr in cubeCoordsDictByLayer[posZ - 1][posX]) {
                    const posY = parseInt(posYStr);
    
                    if (cubeCoordsDictByLayer[posZ]?.[posX]?.[posY])
                        continue;
                    if (!cubeCoordsDictByLayer[posZ - 1][posX + 1]?.[posY])
                        continue;
                    if (!cubeCoordsDictByLayer[posZ - 1][posX]?.[posY + 1])
                        continue;
                    if (!cubeCoordsDictByLayer[posZ - 1][posX + 1]?.[posY + 1])
                        continue;
    
                    playerPossibleMoves.push([posX, posY, posZ]);
                }
            }
    
            posZ++;
        }
    
        return playerPossibleMoves.length > 0 ? playerPossibleMoves : [[0, 0, 0]];
    }

    private updatePyramidStatusText(){ //ekmek bu build sirasinda 2 defa cagiriliyor, possible_moves client'a tasininca duzelmeli
        let statusText = null;

        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile'){
            if(this.owner.built_cubes_this_round)
                statusText = dojo.string.substitute(_('${actplayer} must select an available Market Tile'), {actplayer: this.gameui.divActivePlayer()});
            else {
                statusText = dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), {you: this.gameui.divYou()});
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = statusText;

                document.title = '◣' + tempDiv.innerText;
            }
        } else if (this.gameui.gamedatas.gamestate.name === 'buildPyramid'){
            if(this.owner.built_cubes_this_round)
                statusText = dojo.string.substitute(_('Waiting for other players to build Pyramids'), {you: this.gameui.divYou()});
            else statusText = dojo.string.substitute(_('${you} need to build your Pyramid'), {you: this.gameui.divYou()});
        }

        if(!statusText)
            return;
        
        const showConfirmButton = !this.owner.built_cubes_this_round && Object.keys(this.cubesInConstruction).length == this.gameui.CUBES_PER_MARKET_TILE; //ekmek test
        const showUndoButton = Object.keys(this.cubesInConstruction).length > 0;

        if(showConfirmButton || showUndoButton){
            let buttonHTML = '';
            if(showConfirmButton){
                let cubeIconsHTML = '';
                const sortedCubes = Object.values(this.cubesInConstruction).sort((a, b) => a.order_in_construction - b.order_in_construction);
                for(let cube of sortedCubes)
                    cubeIconsHTML += this.gameui.createCubeDiv(cube).outerHTML;

                cubeIconsHTML = '<div class="cube-wrapper">' + cubeIconsHTML + '</div>';

                statusText = dojo.string.substitute(_('Place${cubeIcons}'), {cubeIcons: cubeIconsHTML});
                buttonHTML += '<a class="confirm-place-cube-button bgabutton bgabutton_blue">' + _('Confirm') + '</a>';
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
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());

        this.unplacedCube = cubeData;

        let animSpeed = 400;

        if(!this.unplacedCube.div){ //search Market Tiles
            const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            let marketCubeDiv: HTMLDivElement = marketTile.querySelector(`.a-cube[cube-id="${cubeData.cube_id}"]`);

            this.unplacedCube.div = marketCubeDiv.cloneNode(true) as HTMLDivElement;
            this.cubesContainer.appendChild(this.unplacedCube.div);
            marketCubeDiv.classList.add('selected-for-pyramid');
            this.gameui.placeOnObject(this.unplacedCube.div, marketCubeDiv);

            animSpeed = 600;
        }

        let goTo: HTMLDivElement = this.cubesContainer.querySelector(`.pyramid-cube-snap-point[pos-x="${this.unplacedCube.pos_x}"][pos-y="${this.unplacedCube.pos_y}"][pos-z="${this.unplacedCube.pos_z}"]`);

        const cubeAnim = this.gameui.animationHandler.animateProperty({
            node: this.unplacedCube.div,
            properties: { top: goTo.offsetTop, left: goTo.offsetLeft },
            duration: animSpeed,
            onBegin: () => {
                this.unplacedCube.div.classList.add('animating-cube');
            },
            onEnd: () => { 
                this.unplacedCube.div.classList.remove('animating-cube');
                this.unplacedCube.div.setAttribute('pos-x', this.unplacedCube.pos_x.toString());
                this.unplacedCube.div.setAttribute('pos-y', this.unplacedCube.pos_y.toString()); 
                this.unplacedCube.div.setAttribute('pos-z', this.unplacedCube.pos_z.toString());
                this.unplacedCube.div.style.top = null;
                this.unplacedCube.div.style.left = null;

                this.arrangeCubesZIndex();
                this.updatePyramidStatusText();

                this.gameui.ajaxAction(moveType == 'from_market' ? 'actAddCubeToPyramid' : 'actMoveCubeInPyramid', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
            }
        });

        cubeAnim.start();
    }

    public animatePlayerCubesToPyramid(cubeMoves: CubeToPyramidMoveData[]): ReturnType<typeof dojo.animateProperty> {
        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        const animSpeed = 600;
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

        for(const move of cubeMoves){
            let marketCubeDiv: HTMLDivElement = marketTile.querySelector(`.a-cube[cube-id="${move.cube_id}"]`);

            if(!marketCubeDiv)
                continue;

            marketCubeDiv.setAttribute('pos-x', move.pos_x.toString());
            marketCubeDiv.setAttribute('pos-y', move.pos_y.toString());
            marketCubeDiv.setAttribute('pos-z', move.pos_z.toString());

            let pyramidCubeDiv: HTMLDivElement = marketCubeDiv.cloneNode(true) as HTMLDivElement;
            pyramidCubeDiv.style.opacity = '0';
            pyramidCubeDiv.style.top = null;
            pyramidCubeDiv.style.left = null;
            this.cubesContainer.appendChild(pyramidCubeDiv);

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

            const builtCubeAnim = this.gameui.animationHandler.animateOnObject({
                node: marketCubeDiv,
                goTo: pyramidCubeDiv,
                duration: animSpeed + Math.floor(Math.random() * 101) - 50,
                easing: 'circleOut',
                delay: Math.floor(Math.random() * 51),
                onEnd: () => { 
                    marketCubeDiv.remove();
                    pyramidCubeDiv.style.opacity = '1';
                }
            });
    
            cubeAnimArray.push(builtCubeAnim);
        }

        this.arrangeCubesZIndex();

        let cubeAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(cubeAnimArray);
        cubeAnim.onEnd = () => { this.arrangeCubesZIndex(); }

        return cubeAnim;
    }

    public saveAllCubesInPyramid() {
        for (let i = 0; i < this.pyramidData.length; i++)
            this.pyramidData[i].order_in_construction = null;

        this.unplacedCube = null;
        this.cubesInConstruction = {};
        this.owner.built_cubes_this_round = false;
    }
    
    private confirmPlaceCubeButtonClicked() {
        this.gameui.ajaxAction('actConfirmBuildPyramid', {}, true, false);
    }

    public confirmedBuildPyramid() {
        this.owner.built_cubes_this_round = true;

        // Save all cubes in construction to pyramid data
        Object.values(this.cubesInConstruction).forEach(cube => {
            if (!this.pyramidData.some(existingCube => existingCube.cube_id === cube.cube_id)) {
                this.pyramidData.push(cube);
            }
        });

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(element => {
            element.classList.remove('selected-for-pyramid');
            element.classList.add('built-in-pyramid');
        });

        this.disableBuildPyramid();
    }

    private undoPlaceCubeButtonClicked() {
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(snapPoint => {
            this.gameui.animationHandler.fadeOutAndDestroy(snapPoint as HTMLDivElement);
        });
        
        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);

        let undoAnimArray: ReturnType<typeof dojo.animateProperty>[] = [];

        // Get all cubes in construction and animate them back to their market positions
        Object.values(this.cubesInConstruction).forEach(cube => {
            const goTo = marketTile.querySelector(`.a-cube[cube-id="${cube.cube_id}"]`);
            if (!goTo) return;

            undoAnimArray.push(this.gameui.animationHandler.animateOnObject({
                node: cube.div,
                goTo: goTo,
                duration: 500,
                onBegin: () => {
                    cube.div.classList.add('animating-cube');
                },
                onEnd: () => {
                    cube.div.remove();
                    goTo.classList.remove('selected-for-pyramid', 'built-in-pyramid');
                }
            }));
        });

        // Remove cubes from pyramidData that match IDs in cubesInConstruction
        this.pyramidData = this.pyramidData.filter(cube => 
            !Object.values(this.cubesInConstruction).some(constructionCube => 
                constructionCube.cube_id === cube.cube_id
            )
        );
        this.cubesInConstruction = {};
        this.unplacedCube = null;
        this.owner.built_cubes_this_round = false;

        this.gameui.ajaxAction('actUndoBuildPyramid', {}, true, false);
        
        let undoAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(undoAnimArray);
        undoAnim.onEnd = () => {
            // this.calcAvailableColors();
            this.rollingCubeColorIndex = 0;
            this.enableBuildPyramid();
            // this.disableBuildPyramid();
            // this.updatePyramidStatusText();
        }
        
        undoAnim.start();
    }

    private centerCubesContainer(doAnimate = true) {
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
        
        const offsetX = centerPoint.x - midPointX;
        const offsetY = centerPoint.y - midPointY;

        if(this.centerTilesAnim){
            this.centerTilesAnim.stop();
            this.centerTilesAnim = null;
        }

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
            if(cube.classList.contains('a-cube'))
                zIndex++;
        });
    }

    private displaySwitchColorButton() {
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());

        if(!this.unplacedCube)
            return;

        this.calcAvailableColors();
        if(this.availableColors.length <= 1)
            return;

        this.rollingCubeColorIndex = this.availableColors.indexOf(this.unplacedCube.color);

        let switchColorButton: HTMLDivElement = document.createElement('div');
        switchColorButton.innerHTML = `<div class="switch-color-button" pos-x="${this.unplacedCube.pos_x}" pos-y="${this.unplacedCube.pos_y}" pos-z="${this.unplacedCube.pos_z}"><i class="fa6 fa6-exchange switch-color-icon"></i></div>`;
        switchColorButton = switchColorButton.firstElementChild as HTMLDivElement;

        this.cubesContainer.appendChild(switchColorButton);

        switchColorButton.style.opacity = '0.82';
        switchColorButton.addEventListener('click', () => this.onSwitchColorButtonClicked());
    }
    
    private getCurrentUnplacedMarketCube(): MarketCube{ return this.getNextUnplacedMarketCube(0); }
    
    private getNextUnplacedMarketCube(offset: number = 1): MarketCube{
        if(this.rollingCubeColorIndex === null || this.rollingCubeColorIndex === undefined)
            this.rollingCubeColorIndex = 0;

        this.rollingCubeColorIndex = (this.rollingCubeColorIndex + offset) % this.availableColors.length;

        const nextColor = this.availableColors[this.rollingCubeColorIndex];
        const collectedMarketTileIndex: number = this.owner.getCollectedMarketTileData().collected_market_index;
        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        const nextCubeDiv:HTMLDivElement = Array.from(marketTile.querySelectorAll('.a-cube')).find((cube: HTMLDivElement) => 
            !cube.classList.contains('selected-for-pyramid') && 
            !cube.classList.contains('built-in-pyramid') &&
            cube.getAttribute('color') === nextColor
        ) as HTMLDivElement;

        if(!nextCubeDiv)
            return null;

        const cubeID = nextCubeDiv.getAttribute('cube-id');
        const cubeData: MarketCube = this.gameui.marketHandler.getCubesOfMarketTile(collectedMarketTileIndex).find((cube) => cube.cube_id === cubeID);

        return cubeData;
    }

    private calcAvailableColors(){
        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        const availableCubes: HTMLDivElement[] = Array.from(marketTile.querySelectorAll('.a-cube:not(.built-in-pyramid)'));

        let availableColorsDict = {};
        availableCubes.forEach(cube => {
            const cubeColor = cube.getAttribute('color');
            availableColorsDict[cubeColor] = 1;
        });

        if(this.unplacedCube) //also add unplaced cube color to available colors
            availableColorsDict[this.unplacedCube.color] = 1;

        this.availableColors = Object.keys(availableColorsDict);
    }

    private onSwitchColorButtonClicked() {
        let myPyramid = this.owner.playerID.toString() == this.gameui.player_id;
        if(!myPyramid)
            return;

        const nextCubeData: MarketCube = this.getNextUnplacedMarketCube();

        delete this.cubesInConstruction[this.unplacedCube.cube_id];

        this.unplacedCube.cube_id = nextCubeData.cube_id;
        this.unplacedCube.color = nextCubeData.color;
        this.unplacedCube.div.setAttribute('color', nextCubeData.color);
        this.unplacedCube.div.setAttribute('cube-id', nextCubeData.cube_id);
        this.cubesInConstruction[nextCubeData.cube_id] = this.unplacedCube;

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(cube => { 
            if(cube.getAttribute('cube-id') === nextCubeData.cube_id)
                cube.classList.add('selected-for-pyramid');
            else cube.classList.remove('selected-for-pyramid'); 
        });

        this.gameui.ajaxAction('actPyramidCubeColorSwitched', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
    }
    
    private notifyCubeMovedOnGrid() { //ekmek gerekli mi
        console.log('notifyCubeMovedOnGrid');
    }

    public getUnplacedCube(): PyramidCube{ return this.unplacedCube; }
    public getCubesInConstruction(): { [cubeId: number]: PyramidCube }{ return this.cubesInConstruction; }
    public getPyramidContainerRect(): DOMRect{ return this.gameui.getPos(this.pyramidContainer); }
    public getTurnOrderContainer(): HTMLDivElement{ return this.pyramidContainer.querySelector('.turn-order-container') as HTMLDivElement; }
    public getPyramidContainer(): HTMLDivElement{ return this.pyramidContainer; }
}
