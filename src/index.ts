import {loadCharset} from "./loadCharset";

const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 16;
const WORLD_WIDTH = 400;
const WORLD_HEIGHT = 300;
const SCALE = 2;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ANGULAR_SPEED = Math.PI / 16;

function randint(max: number) {
    return Math.floor(Math.random() * max);
}

type Rect = [
    x: number,
    y: number,
    width: number,
    height: number,
];
function isColliding(r1: Rect, r2: Rect) {
    return (
        r1[0] < r2[0] + r2[2] &&
        r1[0] + r1[2] > r2[0] &&
        r1[1] < r2[1] + r2[3] &&
        r1[1] + r1[3] > r2[1]
    );
}

class Char {
    constructor(private charsetCoordinates: [x: number, y: number], private color: string) {}

    public get paintColor() {
        return this.color;
    }

    public get coords() {
        return this.charsetCoordinates;
    }
}

interface Drawable {
    getChar: () => Char,
}

interface Positionable {
    setPosition: (x: number, y: number) => void,
    getPosition: () => [x: number, y: number],
    addX: (value: number) => void,
    addY: (value: number) => void,
}

class Actor implements Drawable, Positionable {
    private char: Char;
    private x: number;
    private y: number;
    public direction: number = 0;

    constructor(x: number, y: number, char: Char) {
        this.x = x;
        this.y = y;
        this.char = char;
    }

    public getChar(): Char {
        return this.char;
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getPosition(): [x: number, y: number] {
        return [this.x, this.y];
    }

    public addX(value: number) {
        this.x += value;
    }

    public addY(value: number) {
        this.y += value;
    }
}

class GameControl {
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
            receiver(new Bullet(...this.player.getPosition(), this.player.direction));
            this.shootLock = true;
            setTimeout(() => this.shootLock = false, 200);
        }
        else {
            receiver(null);
        }
    }

}

class Bullet {
    public actor: Actor;
    private direction: number;

    constructor(x: number, y: number, direction: number) {
        this.actor = new Actor(x, y, new Char([7, 0], '#eded04'));
        this.direction = direction;
    }

    public travel() {
        const [x, y] = this.actor.getPosition();
        const [dx, dy] = [BULLET_SPEED * Math.cos(this.direction), BULLET_SPEED * Math.sin(this.direction)];
        this.actor.setPosition(x + dx, y - dy);
    }
}

class Renderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private buffer: HTMLCanvasElement;
    private bufferContext: CanvasRenderingContext2D;
    private readonly charset: HTMLImageElement;

    constructor(charset: HTMLImageElement) {
        this.canvas = document.getElementById('c') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.context.imageSmoothingEnabled = false;

        this.buffer = document.getElementById('buffer') as HTMLCanvasElement;
        this.bufferContext = this.buffer.getContext('2d')!;

        this.charset = charset;
    }

    private paintBackground() {
        this.context.fillStyle = '#363636';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private setCharColor(color: string) {
        this.bufferContext.save();
        this.bufferContext.clearRect(0, 0 , this.buffer.width, this.buffer.height);
        this.bufferContext.drawImage(this.charset, 0, 0);
        this.bufferContext.fillStyle = color;
        this.bufferContext.globalCompositeOperation = "source-in";
        this.bufferContext.fillRect(0, 0, this.buffer.width, this.buffer.width);
        this.bufferContext.restore();
    }

    private clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public render(...objects: Array<Drawable & Positionable>) {
        this.clear();
        this.paintBackground();

        for (const object of objects) {
            const [x, y] = object.getPosition();

            this.setCharColor(object.getChar().paintColor);

            this.context.drawImage(
                this.buffer,
                object.getChar().coords[0] * CHAR_WIDTH,
                object.getChar().coords[1] * CHAR_HEIGHT,
                CHAR_WIDTH,
                CHAR_HEIGHT,
                x * SCALE,
                y * SCALE,
                CHAR_WIDTH * SCALE,
                CHAR_HEIGHT * SCALE,
            );
        }
    }
}

class Game {
    private player: Actor;
    private control: GameControl;
    private renderer?: Renderer;
    private enemyList: Set<Actor> = new Set();
    private bulletList: Set<Bullet> = new Set();

    private shouldGenerateEnemies = false;

    constructor() {
        this.player = new Actor(0, 0, new Char([0, 2], '#dcdcdc'));
        this.control = new GameControl(this.player);

        setInterval(() => {
            this.shouldGenerateEnemies = true;
        }, 1000)

        loadCharset().then(charset => {
            this.renderer = new Renderer(charset);
            this.gameLoop();
        });
    }

    private generateRandomEnemy() {
        const y = randint(WORLD_HEIGHT - CHAR_HEIGHT);
        const x = WORLD_WIDTH + CHAR_WIDTH;

        this.enemyList.add(new Actor(x, y, new Char([21, 0], '#dc0000')));
        this.shouldGenerateEnemies = false;
    }

    private updateEnemies() {
        for (const enemy of this.enemyList) {
            enemy.addX(-3);
            if (enemy.getPosition()[0] < 0 - CHAR_WIDTH) {
                this.enemyList.delete(enemy);
            }
        }
    }

    private updateBullets() {
        for (const bullet of this.bulletList) {
            const [x, y] = bullet.actor.getPosition();
            bullet.travel();

            if (bullet.actor.getPosition()[0] > WORLD_WIDTH) {
                this.bulletList.delete(bullet);
            }
            else {
                for (const enemy of this.enemyList) {
                    const [ex, ey] = enemy.getPosition();
                    if (isColliding(
                        [x, y, CHAR_WIDTH, CHAR_HEIGHT],
                        [ex, ey, CHAR_WIDTH, CHAR_HEIGHT]
                    )) {
                        this.enemyList.delete(enemy);
                        this.bulletList.delete(bullet);
                    }
                }
            }
        }
    }

    private gameLoop() {
        if (this.shouldGenerateEnemies) {
            this.generateRandomEnemy();
        }

        this.control.handle((bullet) => {
            bullet && this.bulletList.add(bullet);
        });
        this.updateEnemies();
        this.updateBullets();

        this.renderer!.render(
            this.player,
            ...this.enemyList,
            ...(Array.from(this.bulletList).map(bullet => bullet.actor))
        );
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();