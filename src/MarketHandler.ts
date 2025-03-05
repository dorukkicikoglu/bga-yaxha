class MarketHandler{
    private marketContainer: HTMLDivElement;
    private marketTiles: HTMLDivElement[];

	constructor(private gameui: GameBody, private marketData: { [key: number]: MarketCube[] }) {
		this.marketContainer = document.querySelector('#player-tables .market-container') as HTMLDivElement;
        this.marketTiles = [];

        this.initMarketContainer();
	}

    private initMarketContainer(){
        Object.keys(this.gameui.players).forEach((_, i) => {
            // First loop: Create market tiles
            this.marketTiles[i] = document.createElement('div');
            this.marketTiles[i].className = 'a-market-tile market-tile-' + i;
            this.marketTiles[i].setAttribute('market-index', i.toString());
            this.marketContainer.appendChild(this.marketTiles[i]);
        });

        // Second loop: Create and position cubes
        Object.keys(this.gameui.players).forEach((_, i) => {
            const tilesData = this.marketData[i] || [];
            const existingCubes: HTMLDivElement[] = [];

            tilesData.forEach(cube => {
                const cubeDiv = document.createElement('div');
                cubeDiv.className = 'a-cube';
                cubeDiv.setAttribute('cube-id', cube.cube_id.toString());
                cubeDiv.setAttribute('color', cube.color.toString());
                cubeDiv.style.setProperty('--bg-color', '#' + this.gameui.CUBE_COLORS[Number(cube.color)].colorCode);

                this.marketTiles[i].appendChild(cubeDiv);

                const { x, y } = this.getRandomPositionOnTile(this.marketTiles[i], existingCubes);
                cubeDiv.style.left = x + '%';
                cubeDiv.style.top = y + '%';
                
                existingCubes.push(cubeDiv);
            });
        });
    }

    private getRandomPositionOnTile(marketTile: HTMLDivElement, existingCubes: HTMLDivElement[]): { x: number, y: number } {
        const tileSize = this.gameui.getPos(marketTile);
    
        // Get cube size (fallback if no cubes exist)
        const sampleCube = dojo.query('.a-cube', marketTile)[0];
        const cubeSize = sampleCube ? this.gameui.getPos(sampleCube) : { w: 25, h: 25 }; // Default to 40px cubes
    
        const marginPercent = 0.16;
        const margin = tileSize.w * marginPercent; // 20% margin from edges
        const minSpacing = tileSize.w * 0.06; // Minimum spacing between cubes
        const maxAttempts = 100; // Avoid infinite loops

        let attempt = 0;
        while (attempt < maxAttempts) {
            // Generate random x, y inside marketTile with margin applied
            const x = margin + Math.random() * (tileSize.w - 2 * margin - cubeSize.w);
            const y = margin + Math.random() * (tileSize.h - 2 * margin - cubeSize.h);
            let isOverlap: boolean = false;
let ekmekista = [];
            for(let cube of existingCubes){ //check for overlaps
                const cubePos = {
                    x: parseInt(cube.style.left) * (tileSize.w / 100) || 0,
                    y: parseInt(cube.style.top) * (tileSize.h / 100) || 0
                };
ekmekista.push(cubePos);
                if ( //there is an overlap
                    x > cubePos.x - (cubeSize.w + minSpacing) &&
                    x < cubePos.x + cubeSize.w + minSpacing &&
                    y > cubePos.y - (cubeSize.h + minSpacing) &&
                    y < cubePos.y + cubeSize.h + minSpacing
                ) {
                    isOverlap = true;
                    continue;
                }
            }
    
            if(isOverlap){
                console.log('lets make new attempt ekmek !!!!!!!!!!!!!');
                console.log('random x: ' + x + ', random y: ' + y);
                console.log('existing cubes positions: ', ekmekista);
                attempt++;
            }
            else return { x: (x / tileSize.w) * 100, y: (y / tileSize.h) * 100 };
        }
    alert('sictik ekmek !!!!!!!!!!!!!');
        return { x: marginPercent, y: marginPercent }; // Fallback if no valid placement is found
    }
}