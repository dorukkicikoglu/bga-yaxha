class PyramidHandler {
    private pyramidContainer: HTMLDivElement;
    private cubesContainer: HTMLDivElement;
    private unplacedCube: any = {}; //ekmek define type
    private possibleMoves: [number, number, number][] = []; //ekmek define type

    constructor(private gameui: any,private owner: any,private PYRAMID_MAX_SIZE: number,private pyramidData: any) {
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
    }

	public enableBuildPyramid(possibleMoves: [number, number, number][]) { 
        this.pyramidContainer.setAttribute('build-pyramid-enabled', 'true'); 

        this.possibleMoves = possibleMoves;
                
        dojo.query('.pyramid-cubd-snap-point', this.pyramidContainer).forEach( dojo.destroy );
        
        var myPyramid = this.owner.playerID == this.gameui.player_id;
        this.possibleMoves.forEach((pos) => {
            // Create snap point element
            const snapPoint = document.createElement('div');
            snapPoint.className = 'pyramid-cube-snap-point';
            snapPoint.setAttribute('pos-x', pos[0].toString());
            snapPoint.setAttribute('pos-y', pos[1].toString());
            snapPoint.setAttribute('pos-z', pos[2].toString());
            
            // Add to container
            this.cubesContainer.appendChild(snapPoint);
            
            // Add clickable class
            snapPoint.classList.add('clickable');
        
            if(myPyramid)
                snapPoint.addEventListener('click', this.onSnapPointClicked);

            this.gameui.animationHandler.animateProperty({node: snapPoint, properties: {opacity: 1}, duration: 300}).play();
        });
    }
	public disableBuildPyramid() { this.pyramidContainer.removeAttribute('build-pyramid-enabled'); }

    private onSnapPointClicked(args, doNotify = true) { //args is either event target or an array [posX, posY, posZ]
        debugger;
        //ekmek doNotify gerekli mi?
        var myGrid = this.owner.playerID == this.gameui.player_id;
        if(!myGrid)
            return;

        var posX: number, posY: number, posZ: number;
        if(Array.isArray(args)){
            posX = args[0];
            posY = args[1];
            posZ = args[2];
        } else {
            if(!args.target.classList.contains('clickable'))
                return;

            posX = this.gameui.getAttr(args.target, 'pos-x');
            posY = this.gameui.getAttr(args.target, 'pos-y');
            posZ = this.gameui.getAttr(args.target, 'pos-z');

            args.target.classList.remove('clickable');
        }

        this.unplacedCube.pos = {x: posX, y: posY, z: posZ};
        this.cubeBuilt(false, false); 

        dojo.query('.pyramid-cube-snap-point', this.pyramidContainer).forEach( function(snapPoint){ 
            if(Number(snapPoint.getAttribute('pos-x')) == posX && Number(snapPoint.getAttribute('pos-y')) == posY && Number(snapPoint.getAttribute('pos-z')) == posZ)
                snapPoint.classList.remove('clickable')
            else snapPoint.classList.add('clickable')
        });

        if(doNotify)
            this.notifyTileMovedOnGrid();
    }
    
    private cubeBuilt(tileData, savePlacement, onAnimationEnd = () => {}) { //ekmek devam
        console.log('cubeBuilt');
    }
    
    private notifyTileMovedOnGrid() { //ekmek devam grid ismini sil
        console.log('notifyTileMovedOnGrid');
    }
}
