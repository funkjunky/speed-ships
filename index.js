import { createStore, applyMiddleware } from 'redux';
import { createYieldEffectMiddleware } from 'redux-yield-effect';
import { put } from 'redux-yield-effect/lib/effects';
import { addTick } from 'effect-tick';
import { tickMiddleware, resumeTicks, pauseTicks } from 'effect-tick';
import { createEntity, removeEntity } from './entities/index';
import reducer from './reducer';
import metaSelector from 'redux-meta-selector';
import graphics from './graphics';
import createPlayer from './createPlayer';
import createAsteroid from './createAsteroid';
import createStar from './createStar';
import controls from './controls';
import 'end-polyFills';

window.mobileAndTabletcheck = function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game');
    if (mobileAndTabletcheck()) {
        const onTouchEnd = () => {
            //TODO disable on not mobile
            canvas.webkitRequestFullscreen();
            window.screen.orientation.lock('landscape');
            canvas.removeEventListener('touchend', onTouchEnd);
        };
        canvas.addEventListener('touchend', onTouchEnd);
    }

    const store = createStore(
        reducer,
        applyMiddleware(
            createYieldEffectMiddleware(),
            tickMiddleware,
            metaSelector
        ),
    );
    store.dispatch(resumeTicks());

    let ctx = canvas.getContext('2d');
    const step = dt => {
        graphics(ctx, store.getState(), dt);
        window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);

    const player = store.dispatch(createEntity(createPlayer()));

    // This updates the physics
    store.dispatch(addTick(function* _update_physics(dt) {
        yield put({
            meta: { tick: true },
            type: 'UPDATE_PHYSICS',
            dt
        });

        // Never done?
        return false;
    }));

    // handle collision of asteroid with ship.
    store.dispatch(addTick(function* _asteroidShip(dt) {
        const player = store.getState().entities[0];
        if (player.invuln) return;
        const asteroid = Object.values(store.getState().entities)
            .filter(e => e.entityType === 'asteroid')
            .find(a => Math.abs(a.x - player.x) < 20 && Math.abs(a.y - player.y) < 20);
        if (asteroid) {
            yield put(removeEntity(() => asteroid));
            yield put({ type: 'DEATH_INC' });
            yield put({ type: 'STATUS', id: 0, invuln: true });
            let cooldown = 2000;
            yield put(addTick(function* _respawning(dt) {
                return (cooldown -= dt) < 0;
            }));
            yield put({ type: 'STATUS', id: 0, invuln: false });
        }
    }));

    // This spawns asteroids, until there are 10 of them.
    {
        const MAX_ASTEROIDS = 20;
        const ASTEROID_CD = 1000;
        let tillSpawn = ASTEROID_CD;
        store.dispatch(addTick(function* _spawn_asteroids(dt) {
            if (Object.values(store.getState().entities).filter(v => v.entityType === 'asteroid').length >= MAX_ASTEROIDS) return false;
            tillSpawn -= dt;
            if (tillSpawn < 0) {
                yield put(createEntity(createAsteroid()));
                tillSpawn += ASTEROID_CD;
            }

            return false;
        }));
    }

    // Add stars
    {
        // not sure how the math adds up, but I think it's correct this time.
        const generateStars = (minSpace, maxSpace, depth) => {
            const getSpace = () => minSpace + Math.floor(Math.random() * (maxSpace - minSpace));
            for (let y = 0; y < (1.25 * 960) / (depth / 2); y += maxSpace) {
                for (let x = getSpace(); x < (1.25 * 1280) / (depth / 2); x += getSpace()) {
                    if (Math.random() < 0.5) continue;
                    const rColour = () => Math.floor(Math.random() * 105) + 150;
                    const rgb = () => Math.random() < 0.5
                        ? { r: 255, g: 255, b: 255 }
                        : { r: rColour(), g: rColour(), b: rColour() };

                    store.dispatch(createStar({
                        x,
                        y: y + getSpace(),
                        depth,
                        ...rgb()
                    }));
                }
            }
        };
        // further stars - There should be more stars in the distance, then close.
        generateStars(20, 40, 4);
        // closer stars
        generateStars(50, 300, 2);
    }

    // twinkle random stars
    {
        let timeSinceTwinkle = 0;
        store.dispatch(addTick(function* _update_physics(dt) {
            if ((timeSinceTwinkle += dt) > 50) {
                yield put({
                    type: 'START_TWINKLE',
                    index: Math.floor(Math.random() * store.getState().stars.length),
                });
                timeSinceTwinkle -= 100;
            }
            yield put({
                type: 'STEP_TWINKLE',
                dt
            });

            // Never done?
            return false;
        }));
    }

    controls(store);
});
