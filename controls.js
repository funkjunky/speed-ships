import { put } from 'redux-yield-effect/lib/effects';
import { addTick } from 'effect-tick';

import { createEntity, removeEntity } from './entities';
//TODO: randomInt in createAsteroid
const randomInt = max => Math.floor(Math.random() * max);

const getBulletShape = () => [
    [ randomInt(4) - 6, randomInt(4) - 6 ],
    [ randomInt(4) + 6, randomInt(4) - 6 ],
    [ randomInt(4) + 6, randomInt(4) + 6 ],
    [ randomInt(4) - 6, randomInt(4) + 6 ],
];

const createBullet = (x, y, velx, vely, rotation) => ({
    entityType: 'bullet',
    shape: getBulletShape(),
    x, y,
    velx: Math.cos(rotation - Math.PI / 2) * 300 + velx,
    vely: Math.sin(rotation - Math.PI / 2) * 300 + vely,
    scale: 0.5,
    rotationVel: 0.005,
});

//TODO: create collision test based on shape
const getRadiansFromVector = (x, y) => 0.5 * Math.PI + Math.atan2(y || 0.1, x || 0.1);
export default store => {

    const fireBullet = () => {
        const player = store.getState().entities[0];
        if (player.invuln) return;
        store.dispatch(function* _fire() {
            const asteroids = () => Object.values(store.getState().entities).filter(e => e.entityType === 'asteroid');
            let bullet = yield put(createEntity(createBullet(player.x, player.y, player.velx, player.vely, player.rotation)));
            let lifeSpan = 2000;
            yield put(addTick(function* (dt) {
                const asteroid = asteroids().find(a => Math.abs(a.x - bullet().x) < 20 && Math.abs(a.y - bullet().y) < 20);
                if (asteroid) {
                    yield put(removeEntity(() => asteroid));
                    yield put({ type: 'KILL_INC' });
                }
                return (lifeSpan -= dt) < 0 || asteroid;
            }));
            yield put(removeEntity(bullet));
        }());
    };

    if (!mobileAndTabletcheck()) {
        document.addEventListener('mouseup', fireBullet);

        document.addEventListener('mousemove', e => {
            if (!store.getState().entities[0]) return;
            const x = e.clientX - store.getState().entities[0].x;
            const y = e.clientY - store.getState().entities[0].y;
            const rotation = getRadiansFromVector(x, y);

            store.dispatch({
                type: 'FACE',
                id: 0,
                rotation,
            });
        });

        let keysPressed = {};
        let dispatchAddAcc = () => {
            let accx = 0.001;
            let accy = 0.001;
            if (keysPressed[37] && !keysPressed[39]) accx = -700;
            else if (!keysPressed[37] && keysPressed[39]) accx = 700;

            if (keysPressed[38] && !keysPressed[40]) accy = -700;
            else if (!keysPressed[38] && keysPressed[40]) accy = 700;

            store.dispatch({ type: 'ADD_ACC', id: 0, accx, accy });
        };
        // First store the key change, then update ADD_ACC accordingly.
        document.addEventListener('keydown', e => dispatchAddAcc(keysPressed[e.keyCode] = true));
        document.addEventListener('keyup', e => dispatchAddAcc(keysPressed[e.keyCode] = false));

    } else {
        const ratioX = window.screen.availWidth / 640;  //TODO: replace 640 and 480 with canvas.width height
        const ratioY = window.screen.availHeight / 480;  //TODO: replace 640 and 480 with canvas.width height
        let dirTouch;
        document.addEventListener('touchstart', e => {
            if (dirTouch) return;
            // The first touch we find with the left half of the screen.
            // Well be our control.
            const foundTouch = Array.prototype.find.call(e.changedTouches, t => {
                // TODO: wtf find? return true doesnt work. Returns empty obj
                if(t.screenX / ratioX < 320) {
                    dirTouch = {
                        identifier: t.identifier,
                        screenX: t.screenX,
                        screenY: t.screenY,
                    };
                }
            })
        });
        document.addEventListener('touchmove', e => {
            if (dirTouch) {
                let newDirTouch;
                Array.prototype.find.call(e.changedTouches, t => {
                   if(t.identifier === dirTouch.identifier) {
                       newDirTouch = t;
                   }
                });

                if (newDirTouch) {
                    dirTouch = {
                        ...dirTouch,
                        _newX: newDirTouch.screenX,
                        _newY: newDirTouch.screenY,
                    };
                    const deltaX = newDirTouch.screenX - dirTouch.screenX;
                    const scaledDeltaX = deltaX / ratioX;
                    const scaledDeltaXScreenRatio = scaledDeltaX / 640;
                    const deltaY = newDirTouch.screenY - dirTouch.screenY;
                    const scaledDeltaY = deltaY / ratioY;
                    const scaledDeltaYScreenRatio = scaledDeltaY / 480;
                    store.dispatch({
                        type: 'DEBUG',
                        line: scaledDeltaXScreenRatio + ' , ' + scaledDeltaYScreenRatio,
                    });
                    store.dispatch({
                        type: 'ADD_ACC',
                        id: 0,
                        accx: scaledDeltaXScreenRatio * 1600,
                        accy: scaledDeltaYScreenRatio * 1600,
                    });
                }
            }
        });

        const handleEnd = e => {
            let dirTouchRemoved;
            if (dirTouch) {
                Array.prototype.find.call(e.changedTouches, t => {
                    if(t.identifier === dirTouch.identifier) {
                        dirTouchRemoved = t;
                    }
                });
                if (dirTouchRemoved) {
                    dirTouch = null;

                    store.dispatch({
                        type: 'ADD_ACC',
                        id: 0,
                        accx: 0.0001,
                        accy: 0.0001,
                    });
                }
            }
            if (!dirTouchRemoved) {
                const scaledX = e.changedTouches[0].screenX / ratioX;
                const scaledY = e.changedTouches[0].screenY / ratioY;
                const rotation = getRadiansFromVector(scaledX - 360, scaledY - 240);

                store.dispatch({
                    type: 'FACE',
                    id: 0,
                    rotation,
                });
                fireBullet();
            }
        };
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('touchcancel', handleEnd);
    }
};
