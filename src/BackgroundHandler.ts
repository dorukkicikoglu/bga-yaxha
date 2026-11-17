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
          
            if(this.shaman.classList.contains('rainbow-eyes')) //dont close eyes if rainbow eyes is active
                return;
    
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

    // Scroll parallax: the background pyramid grows from 1x to 1.5x (and opacity 0.8 to 1) as the page scrolls
    // from 30% to 120% of the viewport height. Only transform and opacity change, so it stays on the compositor.
    // The element is laid out at the max size (--bg-pyramid-max-scale in yaxha.scss) and scaled down, so the layer
    // is rasterized at full resolution and doesn't get blurry when it grows.
    private bindBodyScrollEvent() {
        const MAX_SCALE = 1.5; // keep in sync with --bg-pyramid-max-scale in yaxha.scss
        const reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

        let scrollRangeStart = 0;
        let scrollRangeEnd = 0;
        let framePending = false;
        let lastProgress = -1;

        const cacheMeasurements = () => {
            const windowHeight = window.innerHeight;
            scrollRangeStart = windowHeight * 0.3;
            scrollRangeEnd = windowHeight * 1.2;
        };

        const applyProgress = (progress: number) => {
            if(progress === lastProgress)
                return;
            lastProgress = progress;

            const scale = (1 + progress * (MAX_SCALE - 1)) / MAX_SCALE;
            this.pyramid.style.transform = `translate3d(-50%, -100%, 0) scale(${scale})`;
            this.pyramid.style.opacity = `${0.8 + progress * 0.2}`;
        };

        const update = () => {
            framePending = false;
            if(reducedMotionQuery && reducedMotionQuery.matches){
                applyProgress(0);
                return;
            }

            const scrollTop = window.scrollY;
            const progress = scrollTop <= scrollRangeStart ? 0 : (Math.min(scrollTop, scrollRangeEnd) - scrollRangeStart) / (scrollRangeEnd - scrollRangeStart);
            applyProgress(progress);
        };

        const requestUpdate = () => {
            if(framePending)
                return;
            framePending = true;
            window.requestAnimationFrame(update);
        };

        cacheMeasurements();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', () => { cacheMeasurements(); requestUpdate(); }, { passive: true });

        if(reducedMotionQuery){
            if(reducedMotionQuery.addEventListener)
                reducedMotionQuery.addEventListener('change', requestUpdate);
            else if((reducedMotionQuery as any).addListener) // Safari < 14
                (reducedMotionQuery as any).addListener(requestUpdate);
        }

        requestUpdate();
    }
}




            