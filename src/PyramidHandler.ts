type PyramidCubeMoveType = 'from_market' | 'from_last_built';

class PyramidHandler {
    private pyramidContainer: HTMLDivElement;
    private cubesContainer: HTMLDivElement;
    private unplacedCube: PyramidCube;
    private possibleMoves: [number, number, number][] = []; //ekmek define type
    // public collectedMarketTileIndex: number; //ekmek sil
    private rollingCubeColorIndex: number = 0;
    private availableColors: string[] = [];
    private cubeAnim: ReturnType<typeof dojo.animateProperty>;
    private cubesInConstruction: { [cubeId: number]: PyramidCube } = {};
    private centerTilesAnim: ReturnType<typeof dojo.animateProperty>;

    constructor(private gameui: any,private owner: any,private PYRAMID_MAX_SIZE: number,private pyramidData: PyramidCube[]) {
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
				<div class="text-container">${this.owner.playerName}</div>
			</div>
			<div class="turn-order-container" id="${turnOrderContainerId}" turn-order="${this.owner.turnOrder}"></div>
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
        this.centerCubesContainer();
    }

	public enableBuildPyramid(possibleMoves: [number, number, number][]) {
        this.updatePyramidStatusText(); 

        // this.owner.collectedMarketTileIndex = this.gameui.marketHandler.getPlayerCollectedMarketTile(this.owner.playerID).collected_market_index; //ekmek sil
        if(this.owner.built_cubes_this_round)
            return;

        this.possibleMoves = possibleMoves;        
        this.pyramidContainer.setAttribute('build-pyramid-enabled', 'true'); 

        // this.collectedCubes = this.gameui.marketHandler.getCubesOfMarketTile(this.collectedMarketTileIndex); //ekmek sil
        // this.rollingCubeColorIndex = 0; //ekmek sil

        this.calcAvailableColors();

        // dojo.query('.pyramid-cube-snap-point', this.pyramidContainer).forEach( dojo.destroy ); //ekmek sil
        
        this.drawSnapPoints();
        this.displaySwitchColorButton();       
    }
	public disableBuildPyramid() { 
        this.pyramidContainer.removeAttribute('build-pyramid-enabled'); 
        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach(el => el.remove());
        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());
        this.centerCubesContainer();
        this.updatePyramidStatusText();
    }

    private onSnapPointClicked(args, doNotify = true) { //args is either event target or an array [posX, posY, posZ]
        //ekmek doNotify gerekli mi?
        let myPyramid = this.owner.playerID == this.gameui.player_id;
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

        let posX: number, posY: number, posZ: number;
        // if(Array.isArray(args)){ //ekmek sil? gerekli mi?
        //     posX = args[0];
        //     posY = args[1];
        //     posZ = args[2];
        // } else {
            posX = Number(args.target.getAttribute('pos-x'));
            posY = Number(args.target.getAttribute('pos-y'));
            posZ = Number(args.target.getAttribute('pos-z'));
        // }

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

        this.animateCubeToPyramid(cubeData, moveType); 

        if(doNotify) //ekmek gerekli mi?
            this.notifyCubeMovedOnGrid();
    }
    
    private drawSnapPoints() {
        let myPyramid = this.owner.playerID == this.gameui.player_id;

        if(!myPyramid)
            return;

        this.cubesContainer.querySelectorAll('.pyramid-cube-snap-point').forEach((el) => el.classList.add('to-remove'));
        
        this.possibleMoves.forEach((pos) => {
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
        
        this.centerCubesContainer();
    }

    private updatePyramidStatusText(){ //ekmek bu build sirasinda 2 defa cagiriliyor, possible_moves client'a tasininca duzelmeli
        let statusText = null;

        if (this.gameui.gamedatas.gamestate.name === 'individualPlayerSelectMarketTile'){
            if(this.owner.built_cubes_this_round)
                statusText = dojo.string.substitute(_('${actplayer} must select an available Market Tile'), {actplayer: this.gameui.divActivePlayer()});
            else statusText = dojo.string.substitute(_('${you} may build while others are selecting Market Tiles'), {you: this.gameui.divYou()});
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

    private animateCubeToPyramid(cubeData: PyramidCube, moveType: PyramidCubeMoveType) {
        console.log('animateCubeToPyramid');
        this.centerCubesContainer(false);

        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove());

        this.unplacedCube = cubeData;

        let slideMarketAnim = false;
        let animSpeed = 400;

        if(!this.unplacedCube.div){ //search Market Tiles
            const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
            let marketCubeDiv = marketTile.querySelector(`.a-cube[cube-id="${cubeData.cube_id}"]`);

            let cubeClone = marketCubeDiv.cloneNode(true);
            marketCubeDiv.parentNode.insertBefore(cubeClone, marketCubeDiv.nextSibling);
            marketCubeDiv.classList.add('selected-for-pyramid');

            this.gameui.placeOnObject(cubeClone, marketCubeDiv);
            this.unplacedCube.div = this.gameui.attachToNewParent(cubeClone, this.cubesContainer);

            animSpeed = 600;
        }

        if(this.cubeAnim)
            this.cubeAnim.stop();

        let goTo = this.cubesContainer.querySelector(`.pyramid-cube-snap-point[pos-x="${this.unplacedCube.pos_x}"][pos-y="${this.unplacedCube.pos_y}"][pos-z="${this.unplacedCube.pos_z}"]`);

        this.cubeAnim = this.gameui.animationHandler.animateOnObject({
            node: this.unplacedCube.div,
            goTo: goTo,
            duration: animSpeed,
            onBegin: () => {
                this.unplacedCube.div.classList.add('animating-cube');
            },
            onEnd: () => { 
                // this.container.style.zIndex = null; //ekmek sil
                this.unplacedCube.div.classList.remove('animating-cube'); //ekmek sil? baska yerde kullanmadiysan
                this.unplacedCube.div.setAttribute('pos-x', this.unplacedCube.pos_x.toString());
                this.unplacedCube.div.setAttribute('pos-y', this.unplacedCube.pos_y.toString()); 
                this.unplacedCube.div.setAttribute('pos-z', this.unplacedCube.pos_z.toString());
                this.cubeAnim = null;

                this.arrangeCubesZIndex();
                this.updatePyramidStatusText();

                this.gameui.ajaxAction(moveType == 'from_market' ? 'actAddCubeToPyramid' : 'actMoveCubeInPyramid', { cube_id: this.unplacedCube.cube_id, pos_x: this.unplacedCube.pos_x, pos_y: this.unplacedCube.pos_y, pos_z: this.unplacedCube.pos_z }, false, false);
            }
        });

        if(slideMarketAnim)
            this.cubeAnim = dojo.fx.combine([this.cubeAnim, slideMarketAnim]);

        this.cubeAnim.start();
    }

    private confirmPlaceCubeButtonClicked() {
        console.log('confirmPlaceCubeButtonClicked');
        this.gameui.ajaxAction('actConfirmBuildPyramid', {}, true, false);
    }

    public confirmedBuildPyramid() {
        console.log('confirmedBuildPyramid');

        this.owner.built_cubes_this_round = true;

        const marketTile = this.gameui.marketHandler.getPlayerCollectedMarketTileDiv(this.owner.playerID);
        marketTile.querySelectorAll('.a-cube').forEach(element => {
            element.classList.remove('selected-for-pyramid');
            element.classList.add('built-in-pyramid');
        });

        this.disableBuildPyramid();
    }

    private undoPlaceCubeButtonClicked() {
        console.log('undoPlaceCubeButtonClicked');

        // this.gameui.ajaxAction('actUndoBuildPyramid', {}, true, false); //ekmek burda olmali

        this.cubesContainer.querySelectorAll('.switch-color-button').forEach(el => el.remove()); //ekmek sil
        
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

        this.cubesInConstruction = {};
        this.unplacedCube = null;
        this.owner.built_cubes_this_round = false;

        let undoAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.combine(undoAnimArray);
        undoAnim.onEnd = () => {
            this.calcAvailableColors();
            this.rollingCubeColorIndex = 0;
            this.centerCubesContainer();
            this.updatePyramidStatusText();
            this.gameui.ajaxAction('actUndoBuildPyramid', {}, true, false);
        }
        
        undoAnim.start();
    }

    private centerCubesContainer(doAnimate = true) { //ekmek doAnimate gerekli mi?
        console.log('centerCubesContainer');
        const contentsRect = this.gameui.getContentsRectangle(this.cubesContainer, 'animating-cube');
        if(!contentsRect)
            return;

        let centerPointDiv = document.createElement('div');
        centerPointDiv.style.width = '1px';
        centerPointDiv.style.height = '1px';
        this.cubesContainer.appendChild(centerPointDiv);

        const centerPoint = centerPointDiv.getBoundingClientRect();
        centerPointDiv.remove();

        const offsetX = centerPoint.x - ((contentsRect.maxX + contentsRect.minX) / 2);
        const offsetY = centerPoint.y - ((contentsRect.maxY + contentsRect.minY) / 2);

        if(this.centerTilesAnim)
            this.centerTilesAnim.stop();

        if(doAnimate){
            this.centerTilesAnim = this.gameui.animationHandler.animateProperty({
                node: this.cubesContainer,
                duration: 400, //make animation 1 sec faster so the clicks near the end also work
                properties: {marginLeft: offsetX, marginTop: offsetY}
            }).play();
        } else {
            this.cubesContainer.style.marginLeft = offsetX + 'px';
            this.cubesContainer.style.marginTop = offsetY + 'px';
        }
    }

    private arrangeCubesZIndex() { //ekmek devam
        console.log('arrangeCubesZIndex');
        let cubes = Array.from(this.cubesContainer.querySelectorAll('.a-cube'));
        
        //ekmek sil
        // const cubePositions = {}; // Create a dictionary mapping cube coordinates to cubes
        // cubes.forEach(cube => { cubePositions[cube.getAttribute('pos-x') + '_' + cube.getAttribute('pos-y') + '_' + cube.getAttribute('pos-z')] = 1; });

        cubes.sort(function(a, b) {
            const posXA = parseInt(a.getAttribute("pos-x"));
            const posYA = parseInt(a.getAttribute("pos-y"));
            const posZA = parseInt(a.getAttribute("pos-z"));
            const posXB = parseInt(b.getAttribute("pos-x"));
            const posYB = parseInt(b.getAttribute("pos-y"));
            const posZB = parseInt(b.getAttribute("pos-z"));

            if (posZA !== posZB)
                return posZA - posZB;
            if (posXA !== posXB)
                return posXA - posXB;
            return posYB - posYA;
        });

        cubes.forEach((cube, index) => { 
            dojo.style(cube, "z-index", index + 1);

            //ekmek sil
            // // Check if there is a cube to the right
            // const posX = parseInt(cube.getAttribute("pos-x"));
            // const posY = parseInt(cube.getAttribute("pos-y")); 
            // const posZ = parseInt(cube.getAttribute("pos-z"));
            // const rightCubeKey = `${posX + 1}_${posY}_${posZ}`;
            // const bottomCubeKey = `${posX}_${posY}_${posZ + 1}`;
            
            // if (cubePositions[rightCubeKey])
            //     cube.classList.add('hide-right-side');

            // if (cubePositions[bottomCubeKey])
            //     cube.classList.add('hide-bottom-side');
        });
    }

    private displaySwitchColorButton() { //ekmek isim degistir
        console.log('displaySwitchColorButton');

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
    
    // private getNextUnplacedCube(){ //ekmek sil? bu tekrarlanmis olabilir
    //     const cubeColor = this.availableColors[this.rollingCubeColorIndex];
    //     const cubeData = this.gameui.marketHandler.getCubesOfMarketTile(this.collectedMarketTileIndex).find((cube) => cube.color === cubeColor);

    //     return cubeData;
    // }

    private getCurrentUnplacedMarketCube(): MarketCube{ return this.getNextUnplacedMarketCube(0); }
    
    private getNextUnplacedMarketCube(offset: number = 1): MarketCube{
        this.rollingCubeColorIndex = (this.rollingCubeColorIndex + offset) % this.availableColors.length;

        const nextColor = this.availableColors[this.rollingCubeColorIndex];
        const collectedMarketTileIndex: number = this.owner.getCollectedMarketTileData().collected_market_index;
        const marketTile = this.gameui.marketHandler.marketTiles[collectedMarketTileIndex];
        const nextCubeDiv:HTMLDivElement = Array.from(marketTile.querySelectorAll('.a-cube')).find((cube: HTMLDivElement) => 
            !cube.classList.contains('selected-for-pyramid') && 
            !cube.classList.contains('built-in-pyramid') &&
            cube.getAttribute('color') === nextColor
        ) as HTMLDivElement;

        if(!nextCubeDiv)
            return null;

        const cubeID = nextCubeDiv.getAttribute('cube-id');
        const cubeData: MarketCube = this.gameui.marketHandler.marketData[collectedMarketTileIndex].find((cube) => cube.cube_id === cubeID);

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
        console.log('onSwitchColorButtonClicked');
        let myPyramid = this.owner.playerID == this.gameui.player_id;
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
    
    private notifyCubeMovedOnGrid() { //ekmek devam grid ismini sil
        console.log('notifyCubeMovedOnGrid');
    }

    public getUnplacedCube(): PyramidCube{ return this.unplacedCube; }
    public getCubesInConstruction(): { [cubeId: number]: PyramidCube }{ return this.cubesInConstruction; }
}
