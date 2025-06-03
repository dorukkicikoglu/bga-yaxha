class BackgroundHandler{
    private backgroundContainer: HTMLDivElement;
    private shaman: HTMLDivElement;
    private pyramid: HTMLDivElement;
    private shamanTop = 0.14;
    private shamanMinTop = 0.02;
    private shamanMaxTop = 0.2;
    private shamanLeft = 0.18;
    private lastShamanMoveTime: number = 0;
    private minTimeBetweenShamanMoves = 10000;

	constructor(private gameui: GameBody) {
        this.displayBackground();
        this.bindBodyScrollEvent();
    }

    private displayBackground(){
        this.backgroundContainer = document.createElement('div');


        this.backgroundContainer.classList.add('background-container');
        this.backgroundContainer.innerHTML = `
            <div class="bg-pyramid">
                <div class="bg-shaman">
                    <div class="eye-lid lid-top lid-left"></div>
                    <div class="eye-lid lid-top lid-right"></div>
                    <div class="eye-lid lid-bottom lid-left"></div>
                    <div class="eye-lid lid-bottom lid-right"></div>
                </div>
            </div>
        `;

        document.body.appendChild(this.backgroundContainer);
        this.shaman = this.backgroundContainer.querySelector('.bg-shaman') as HTMLDivElement;
        this.pyramid = this.backgroundContainer.querySelector('.bg-pyramid') as HTMLDivElement;

        this.shaman.style.top = `${this.pyramid.offsetHeight * this.shamanTop}px`;
        this.shaman.style.left = `${this.pyramid.offsetWidth * this.shamanLeft}px`;

        this.moveShamanUpDown(Math.random() < 0.5 ? 'up' : 'down');
        this.closeEyes();
    }

    private async moveShamanUpDown(direction: 'up' | 'down' = 'up'){
        if (Date.now() - this.lastShamanMoveTime < this.minTimeBetweenShamanMoves) {
            setTimeout(() => this.moveShamanUpDown(direction), this.minTimeBetweenShamanMoves);
            return;
        }

        const distance = 0.035 + Math.random() * 0.025;
        let destinationTop = direction === 'up' 
            ? this.shamanTop + distance
            : this.shamanTop - distance;

        destinationTop = Math.min(destinationTop, this.shamanMaxTop);
        destinationTop = Math.max(destinationTop, this.shamanMinTop);

        const destinationLeft = this.shamanLeft + (Math.random() * 0.02 + 0.01);

        const moveTime = 800 + Math.random() * 200;
        const delay = 38000 + Math.random() * 27000;
        
        const moveShamanAnim: ReturnType<typeof dojo.animateProperty> = this.gameui.animationHandler.animateProperty({
            node: this.shaman,
            properties: {top: this.pyramid.offsetHeight * destinationTop, left: this.pyramid.offsetWidth * destinationLeft},
            duration: moveTime,
            delay: delay,
            easing: 'ease-in-out',
            onBegin: () => { 
                this.lastShamanMoveTime = Date.now();        
                this.shaman.classList.add('is-shaking'); 
            },
            onEnd: () => { 
                this.shamanTop = destinationTop;
                this.shaman.classList.add('final-shake');
                this.shaman.classList.remove('is-shaking');
                setTimeout(() => { this.shaman.classList.remove('final-shake'); }, 500);
                this.moveShamanUpDown(direction === 'up' ? 'down' : 'up');
            }
        });

        moveShamanAnim.start();
    }

    private closeEyes(){
        if (Date.now() - this.lastShamanMoveTime < this.minTimeBetweenShamanMoves) {
            setTimeout(() => this.closeEyes(), this.minTimeBetweenShamanMoves);
            return;
        }

        const arr = [
            '.eye-lid', //both eyes
            '.eye-lid', //both eyes
            '.eye-lid', //both eyes
            '.eye-lid', //both eyes
            '.eye-lid', //both eyes
            '.eye-lid.lid-left', //left eye
            '.eye-lid.lid-left', //left eye
            '.eye-lid.lid-left', //left eye
            '.eye-lid.lid-right', //right eye
            '.eye-lid.lid-right', //right eye
        ];
        const whichEyes = arr[Math.floor(Math.random() * arr.length)];
        const delay = 24000 + Math.random() * 10000;

        const eyelids = this.shaman.querySelectorAll(whichEyes);
        
        setTimeout(() => {
            this.lastShamanMoveTime = Date.now();
            eyelids.forEach(lid => { lid.classList.add('eyes-closed') });
            
            setTimeout(() => {
                eyelids.forEach(lid => { lid.classList.remove('eyes-closed') });
                this.closeEyes();
            }, 250 + Math.random() * 40);
        }, delay);
    }

    public startEyesRainbow(){ 
        const rainbowColors = [
            '#fbe985',
            '#9ec8b2', 
            '#d06b63',
            '#c5e0f3',
            '#69ba61',
        ];

        this.shaman.classList.add('rainbow-eyes');

        let colorIndex = 0;
        const setNextColor = () => {
            if(!this.shaman.classList.contains('rainbow-eyes'))
                return;

            this.shaman.style.setProperty('--rainbow-eyes-color', rainbowColors[colorIndex]);
            colorIndex = (colorIndex + (2 + Math.floor(Math.random() * (rainbowColors.length - 3)))) % rainbowColors.length;
            setTimeout(() => { setNextColor(); }, 400);
        };
        setNextColor();
    }

    public stopEyesRainbow(){
        this.shaman.classList.remove('rainbow-eyes');
    }

    private bindBodyScrollEvent() {
        if(this.gameui.isMobile())
            return;

        document.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const scrollRangeStart = windowHeight * 0.3;
            const scrollRangeEnd = windowHeight * 1.2;
    
            let scale = 1;
            let opacity = 0.8;
    
            if (scrollTop > scrollRangeStart) {
                const relativeScroll = Math.min(scrollTop, scrollRangeEnd) - scrollRangeStart;
                const scalePercent = relativeScroll / (scrollRangeEnd - scrollRangeStart);
                scale = 1 + scalePercent * 0.5; // scale from 1 to 1.5
                
                opacity = 0.8 + scalePercent * 0.2;
            }
    
            this.pyramid.style.transform = `translateX(-50%) translateY(-100%) scale(${scale})`;
            this.pyramid.style.opacity = `${opacity}`;
        });
    }  
}




            