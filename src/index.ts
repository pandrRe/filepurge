import {loadCharset} from "./loadCharset";

const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 16;
const WORLD_WIDTH = 400;
const WORLD_HEIGHT = 300;
const SCALE = 2;

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
    constructor(private charsetCoordinates: [x: number, y: number]) {}

    public get coords() {
        return this.charsetCoordinates;
    }
}

type DrawingRect = [sx: number, sy: number, sWidth: number, sHeight: number,
    dx: number, dy: number, dWidth: number, dHeight: number];
interface Drawable {
    getDrawingRect: () => DrawingRect,
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

    constructor(x: number, y: number, char: Char) {
        this.x = x;
        this.y = y;
        this.char = char;
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

    public getDrawingRect(): DrawingRect {
        return [
            this.char.coords[0] * CHAR_WIDTH,
            this.char.coords[1] * CHAR_HEIGHT,
            CHAR_WIDTH,
            CHAR_HEIGHT,
            this.x * SCALE,
            this.y * SCALE,
            CHAR_WIDTH * SCALE,
            CHAR_HEIGHT * SCALE,
        ];
    }
}

class GameControl {
    private keyState = {
        up: false,
        down: false,
        left: false,
        right: false,
        x: false,
    };

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
        this.keyState.up && this.player.addY(-5);
        this.keyState.down && this.player.addY(5);
        this.keyState.left && this.player.addX(-5);
        this.keyState.right && this.player.addX(5);

        if (this.keyState.x) {
            receiver(new Bullet(...this.player.getPosition(), 0));
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
        this.actor = new Actor(x, y, new Char([7, 0]));
        this.direction = direction;
    }

    public travel() {
        const [x, y] = this.actor.getPosition();
        const [dx, dy] = [10 * Math.cos(this.direction), 10 * Math.sin(this.direction)];
        this.actor.setPosition(x + dx, y + dy);
    }
}

class Renderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private readonly charset: HTMLImageElement;

    constructor(charset: HTMLImageElement) {
        this.canvas = document.getElementById('c') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.context.imageSmoothingEnabled = false;

        this.charset = charset;
    }

    private paintBackground() {
        this.context.fillStyle = '#213048';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public render(...drawables: Drawable[]) {
        this.clear();
        this.paintBackground();

        for (const drawable of drawables) {
            this.context.drawImage(this.charset, ...drawable.getDrawingRect());
        }
    }

    public get dimensions() {
        return [this.canvas.width, this.canvas.height];
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
        this.player = new Actor(0, 0, new Char([0, 2]));
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
        const [w, h] = this.renderer!.dimensions;
        const y = randint(h - CHAR_HEIGHT);
        const x = w + CHAR_WIDTH;

        this.enemyList.add(new Actor(x, y, new Char([21, 0])));
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

        this.renderer!.render(this.player, ...this.enemyList, ...(Array.from(this.bulletList).map(bullet => bullet.actor)));
        requestAnimationFrame(() => this.gameLoop());
    }
}

new Game();