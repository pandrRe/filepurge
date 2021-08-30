import {CHAR_HEIGHT, CHAR_WIDTH, Drawable, Positionable, SCALE} from "./globals";

export class Renderer {
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