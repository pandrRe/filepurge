import {ANGULAR_SPEED, CHAR_HEIGHT, CHAR_WIDTH, PLAYER_SPEED, WORLD_HEIGHT, WORLD_WIDTH} from "./globals";
import {Bullet} from "./Bullet";
import {Actor} from "./Actor";

export class GameControl {
    private keyState = {
        up: false,
        down: false,
        left: false,
        right: false,
        x: false,
        z: false,
        c: false,
    };

    private shootLock = false;
    private angleLock = false;

    private toggleFunction(value: boolean) {
        return (e: KeyboardEvent) => {
            switch(e.key) {
                case "ArrowUp":
                    this.keyState.up = value;
                    break;
                case "ArrowDown":
                    this.keyState.down = value;
                    break;
                case "ArrowLeft":
                    this.keyState.left = value;
                    break;
                case "ArrowRight":
                    this.keyState.right = value;
                    break;
                case "x":
                    this.keyState.x = value;
                    break;
                case "z":
                    this.keyState.z = value;
                    break;
                case "c":
                    this.keyState.c = value;
                    break;
            }
        }
    }

    constructor(private player: Actor) {
        window.addEventListener('keydown', (e) => {
            this.toggleFunction(true)(e);
        });

        window.addEventListener('keyup', (e) => {
            this.toggleFunction(false)(e);
        });
    }

    handle(receiver: (bullet: Bullet | null) => void) {
        const [x, y] = this.player.getPosition();

        this.keyState.up && !(y - PLAYER_SPEED < 0) && this.player.addY(-PLAYER_SPEED);
        this.keyState.down && !(y + PLAYER_SPEED > WORLD_HEIGHT - CHAR_HEIGHT + 4) && this.player.addY(PLAYER_SPEED);
        this.keyState.left && !(x - PLAYER_SPEED < 0) && this.player.addX(-PLAYER_SPEED);
        this.keyState.right && !(x + PLAYER_SPEED > WORLD_WIDTH - CHAR_WIDTH) && this.player.addX(PLAYER_SPEED);

        if (!this.angleLock && (this.keyState.z || this.keyState.c)) {
            if (this.keyState.z) {
                this.player.direction += ANGULAR_SPEED;
                if (this.player.direction >= 2 * Math.PI) {
                    this.player.direction -= 2 * Math.PI;
                }
            }
            if (this.keyState.c) {
                this.player.direction -= ANGULAR_SPEED;
                if (this.player.direction < 0) {
                    this.player.direction += 2 * Math.PI;
                }
            }

            this.angleLock = true;
            setTimeout(() => this.angleLock = false, 50);
        }

        if (this.keyState.x && !this.shootLock) {
            receiver(new Bullet(...this.player.getAngledPosition(10), this.player.direction));
            this.shootLock = true;
            setTimeout(() => this.shootLock = false, 200);
        }
        else {
            receiver(null);
        }
    }

}