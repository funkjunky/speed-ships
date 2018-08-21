const c = {
    purple:     '#b35ce5',
    darkGreen:  '#2dab9a',
    blue:       '#65ecda',
    green:      '#17ff70',
    red:        '#ff3f3f',
    orange:     '#ffaf3f'
};

export default (ctx, state, dt) => {
    const drawEntity = entity => {
        ctx.translate(entity.x, entity.y);

        ctx.strokeStyle = c.blue;
        ctx.fillStyle = c.blue;
        ctx.textAlign = 'center';
        if (entity.name) {
            ctx.fillText(entity.name, 0, entity.scale * 10);   //6 is the bounds of a shape. TODO: make 6 const
        }

        if (entity.id === 0) {
            ctx.rotate(entity.rotation - state.entities[0].rotation);
            ctx.strokeStyle = c.red;
            ctx.fillStyle = c.red;
            if (state.game.deathCount) {
                ctx.fillText('☠' + state.game.deathCount, -10, 10);
            }
            if (state.game.killCount) {
                ctx.fillText('👾'+ state.game.killCount, 10, 10);
            }
        }

        ctx.strokeStyle = entity.invuln ? c.orange : c.purple;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const getX = x => x * entity.scale;
        const getY = y => y * entity.scale;
        ctx.moveTo(
            getX(entity.shape[0][0]),
            getY(entity.shape[0][1]),
        );
        entity.shape.forEach(([x, y]) => ctx.lineTo(getX(x), getY(y)));
        ctx.closePath();
        ctx.stroke();
    };

    ctx.save();
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    // ctx.scale(0.5, 0.5);

    //BEGIN ACTUAL GRAPHICS
    ctx.clearRect(0, 0, 640, 480);
    const camera = { x: 320, y: 360 };

    // draw stars
    state.stars.forEach(star => {
        ctx.save();
        const { x, y, depth } = star;
        // TODO: these three lines handle camera for everything??
        ctx.translate(camera.x, camera.y);
        ctx.rotate(-state.entities[0].rotation);
        ctx.translate(-camera.x, -camera.y);
        ctx.translate((camera.x - state.entities[0].x) / star.depth, (camera.y - state.entities[0].y) / star.depth);
        const radius = 1;
        // need to add more halo for close ones...
        let gradient = ctx.createRadialGradient(x, y, radius, x, y, 8 * (star.bloom || star.downBloom || 1) / star.depth);
        const getRgba = ({ r, g, b }, a = 1) => `rgba(${ r }, ${ g }, ${ b }, ${ a })`;
        gradient.addColorStop(0, getRgba(star));
        gradient.addColorStop(0.2, getRgba(star, 0.9));
        gradient.addColorStop(0.21, getRgba(star, 0.5));
        gradient.addColorStop(1, getRgba(star, 0));
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius*4, y - radius*4, radius * 8, radius * 8);
        ctx.restore();
    });

    ctx.save();
    // centre translate on ship location and half of screen
    ctx.translate(camera.x - state.entities[0].x, camera.y - state.entities[0].y);
    // draw entities
    Object.values(state.entities).reverse().forEach(entity => {
        ctx.save();
        const distanceFromPlayer = {
            x: Math.abs(state.entities[0].x - entity.x) - entity.scale * 6,
            y: Math.abs(state.entities[0].y - entity.y) - entity.scale * 6,
        };
        //Only draw things on the screen.
        if (distanceFromPlayer.x < camera.x && distanceFromPlayer.y < camera.y) {
            drawEntity(entity);
        }
        ctx.restore();
    });
    ctx.restore();

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.rotate(-state.entities[0].rotation);
    ctx.translate(-state.entities[0].x, -state.entities[0].y);
    //Draw strips to hide outside bounded items
    ctx.lineWidth = 240;
    ctx.strokeStyle = "black";
    ctx.strokeRect(-122, -122, 1523, 1203);
    ctx.restore();

    // draw bounds
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.rotate(-state.entities[0].rotation);
    ctx.translate(-state.entities[0].x, -state.entities[0].y);
    ctx.strokeStyle = c.darkGreen;
    ctx.lineWidth = 5;
    // TODO: max_height, max_width (in entities/entity.js)
    ctx.strokeRect(0, 0, 1280, 960);
    ctx.restore();

    // TODO: note rotated with camera.
    ctx.save();
    ctx.translate(640, 10);
    //ctx.fillStyle = c.orange;
    //ctx.drawRect(-80, 0, 80, 10);
    ctx.fillStyle = c.green;
    ctx.textAlign = 'center';
    state.debug.forEach((line, i) => {
        ctx.fillText(line, -40, 10 * i);
    });

    ctx.restore();
};
