class AnimationHandlerPromiseBased{
	constructor(private gameui: GameBody) {}

	public animateProperty(args): ReturnType<typeof dojo.animateProperty> {
        args = this.addEasing(args);

        let dojoAnim = dojo.animateProperty(args);
        dojoAnim = this.bindWrapperFunctions(dojoAnim);

        return dojoAnim;
    }

    public animateOnObject(args: Record<string, any>, ignoreGoToPositionChange: boolean = false): ReturnType<typeof dojo.animateProperty>{
        let initialGoToPos = args.goTo ? this.gameui.getPos(args.goTo) : null;

        if(!args.hasOwnProperty('properties'))
            args.properties = {};

        let dojoAnim;

        let arg_beforeBegin = args.hasOwnProperty('beforeBegin') ? args.beforeBegin : function(obj){ return obj; };
        let arg_onBegin = args.hasOwnProperty('onBegin') ? args.onBegin : function(obj){ return obj; };
        args.beforeBegin = (properties) => {
            args = arg_beforeBegin(args);

            let nodePos = this.gameui.getPos(args.node);
            let goToPos = (!ignoreGoToPositionChange && document.contains(args.goTo)) ? this.gameui.getPos(args.goTo) : initialGoToPos; // animate to initial position if goTo is not contained in DOM anymore

            let startScaleValues = {x: 1, y: 1};
            let nodeTranformMatrix = dojo.style(args.node, 'transform');
            const match = nodeTranformMatrix.match(/^matrix\(([^\)]+)\)$/);
            if (match && match.length >= 2) {
                const values = match[1].split(',').map(parseFloat);
                startScaleValues = {x: values[0], y: values[3]};
            }
            let endScaleValues = {x: startScaleValues.x * goToPos.w / nodePos.w, y: startScaleValues.y * goToPos.h / nodePos.h}

            let startW = dojo.style(args.node, 'width');
            let startH = dojo.style(args.node, 'height');

            let nodeTransformOrigin = dojo.style(args.node, 'transform-origin');
            let splitValues = nodeTransformOrigin.split(' ');
            nodeTransformOrigin = {x: parseFloat(splitValues[0]) / startW, y: parseFloat(splitValues[1]) / startH};

            if(!args.hasOwnProperty('fixX') || !args.fixX)
                dojoAnim.properties.left = {start: dojo.style(args.node, 'left'), end: dojo.style(args.node, 'left') + (goToPos.x - nodePos.x) + ((endScaleValues.x - startScaleValues.x) * nodeTransformOrigin.x * startW)};
            if(!args.hasOwnProperty('fixY') || !args.fixY)
                dojoAnim.properties.top = {start: dojo.style(args.node, 'top'), end: dojo.style(args.node, 'top') + (goToPos.y - nodePos.y) + ((endScaleValues.y - startScaleValues.y) * nodeTransformOrigin.y * startH)};

            if(JSON.stringify(startScaleValues) != JSON.stringify(endScaleValues))
                dojoAnim.properties.scale = endScaleValues.x + ' ' + endScaleValues.y;
        }

        args.onBegin = function(properties){
            args = arg_onBegin(args);
        }

        dojoAnim = this.animateProperty(args);
        
        return dojoAnim;
    }

    public fadeOutAndDestroy(node: HTMLDivElement, duration: number = 200) {
        this.animateProperty({
            node: node,
            properties: {opacity: 0},
            duration: duration,
            onEnd: () => {
                node.remove();
            }
        }).start();
    }

    public combine(dojoAnimArray: ReturnType<typeof dojo.animateProperty>[]) {
        let dojoAnim = dojo.fx.combine(dojoAnimArray);
        dojoAnim = this.bindWrapperFunctions(dojoAnim);
        return dojoAnim;
    }

    public chain(dojoAnimArray: ReturnType<typeof dojo.animateProperty>[]) {
        let dojoAnim = dojo.fx.chain(dojoAnimArray);
        dojoAnim = this.bindWrapperFunctions(dojoAnim);
        return dojoAnim;
    }

    private bindWrapperFunctions(dojoAnim: ReturnType<typeof dojo.animateProperty>) {
        dojoAnim.start = async () => { return this.gameui.bgaPlayDojoAnimation(dojoAnim); };
        dojoAnim.addDelay = (delay: number) => { 
            const delayAnim = this.animateProperty({
                node: document.createElement('div'),
                duration: delay,
            });

            return this.chain([delayAnim, dojoAnim]);
        }
        return dojoAnim;
    }

    private addEasing(args: Record<string, any>): ReturnType<typeof dojo.animateProperty>{
        if(!args.hasOwnProperty('easing'))
            return args;

        if(dojo.fx.easing.hasOwnProperty(args.easing))
            args.easing = dojo.fx.easing[args.easing]
        else delete args.easing;

        return args;
    }
}