function RGBToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "0x" + r + g + b;
}

let strokeColor = '0xfcba03';

window.onload = function () {

    const img = document.getElementById('goethe');
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    document.getElementById('selector').addEventListener('click', event => {
        const pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;
        strokeColor = RGBToHex(pixelData[0], pixelData[1], pixelData[2]);
    });

    ////////////////////////////////////

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        view: document.getElementById('view'),
        backgroundColor: '0xFFFFFF'
    });

    document.body.appendChild(app.view);
    const { stage } = app;

    // prepare circle texture, that will be our brush
    const brush = new PIXI.Graphics();
    brush.beginFill(0xffffff);
    brush.drawCircle(0, 0, 50);
    brush.endFill();

    app.loader.add('t1', 'turner5.jpg');
    app.loader.add('t2', 'turner1.jpg');
    app.loader.load(setup);

    function setup(loader, resources) {
        const background = new PIXI.Sprite(resources.t1.texture);
        //stage.addChild(background);
        background.width = app.screen.width;
        background.height = app.screen.height;

        const imageToReveal = new PIXI.Sprite(resources.t2.texture);
        //stage.addChild(imageToReveal);
        imageToReveal.width = app.screen.width;
        imageToReveal.height = app.screen.height;

        //const renderTexture = PIXI.RenderTexture.create(app.screen.width, app.screen.height);

        //const renderTextureSprite = new PIXI.Sprite(renderTexture);
        //stage.addChild(renderTextureSprite);
        //imageToReveal.mask = renderTextureSprite;

        app.stage.interactive = true;
        app.stage.on('pointerdown', pointerDown);
        app.stage.on('pointerup', pointerUp);
        app.stage.on('pointermove', pointerMove);

        const generateCircleTexture = (renderer, radius, color) => {
            const gfx = new PIXI.Graphics();
            const tileSize = radius * 3;
            const texture = PIXI.RenderTexture.create(tileSize, tileSize);

            gfx.beginFill(color, 0.3);
            gfx.drawCircle(tileSize / 2, tileSize / 2, radius);
            gfx.endFill();

            renderer.render(gfx, texture);

            return texture;
        }

        const circleTexture1 = generateCircleTexture(app.renderer, 10, '0xfcba03');
        //const circleTexture2 = generateCircleTexture(app.renderer, 10, '0x65c4f0');
        let circleTexture = circleTexture1;

        let dragging = false;
        let strokeSize = 2;

        const points = [];
        const graphics = new PIXI.Graphics();
        const container = new PIXI.Container();
        const strokeContainer = new PIXI.Container();
        const blurFilter = new PIXI.filters.BlurFilter();
        blurFilter.blur = 1;
        //strokeContainer.filters = [blurFilter];
        //strokeContainer.addChild(graphics);
        //strokeContainer.filters = [blurFilter];
        strokeContainer.width = app.screen.width;
        strokeContainer.height = app.screen.height;

        const background2 = new PIXI.Sprite(resources.t1.texture);
        background2.width = app.screen.width;
        background2.height = app.screen.height;
        background2.blendMode = PIXI.BLEND_MODES.SCREEN;

        const background3 = new PIXI.Sprite(resources.t2.texture);
        background3.width = app.screen.width;
        background3.height = app.screen.height;
        background3.blendMode = PIXI.BLEND_MODES.SCREEN;

        container.addChild(strokeContainer);
        container.addChild(background2);
        //container.addChild(background3);
        

        app.stage.addChild(container);

        function pointerMove(event) {
            if (dragging) {
                //brush.position.copyFrom(event.data.global);
                //app.renderer.render(brush, renderTexture, false, null, false);
                /*const newPosition = app.renderer.plugins.interaction.mouse.global;
                const thing = new PIXI.Graphics();
                points.push(thing);
                thing.lineStyle(0);
                thing.beginFill(0xFFFF0B, 1);
                //points.push(graphics.drawCircle(newPosition.x, newPosition.y, 1));
                thing.drawCircle(newPosition.x, newPosition.y, 1);
                thing.endFill();*/
                const circleSprite = new PIXI.Sprite(circleTexture);
                //circleSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
                circleSprite.x = app.renderer.plugins.interaction.eventData.data.global.x;
                circleSprite.y = app.renderer.plugins.interaction.eventData.data.global.y;
                circleSprite.anchor.set(0.5);
                strokeContainer.addChild(circleSprite);
                points.push({
                    sprite: circleSprite,
                    scale_max: strokeSize
                });
            }
        }

        let color = 1;

        function pointerDown(event) {
            dragging = true;
            strokeSize = Math.random() * 2 + 1;
            circleTexture = generateCircleTexture(app.renderer, 10, strokeColor);
            /*if (color == 1) {
                circleTexture = circleTexture2;
                color = 2;
            } else {
                circleTexture = circleTexture1;
                color = 1;
            }*/
            pointerMove(event);
        }

        function pointerUp(event) {
            dragging = false;
        }

        app.ticker.add((delta) => {
            for (let i = 0; i < points.length; i++) {
                points[i].sprite.scale.x = points[i].sprite.scale.x + ((3 * points[i].scale_max - points[i].sprite.scale.x) / 20 / points[i].scale_max);
                points[i].sprite.scale.y = points[i].sprite.scale.y + ((4.5 * points[i].scale_max - points[i].sprite.scale.y) / 50 / points[i].scale_max);
                //points[i].sprite.anchor.set(0.5, points[i].sprite.anchor._x + ((0 - points[i].sprite.anchor._x) / 10));
            }
        });
    }

}