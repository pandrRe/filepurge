export class Char {
    constructor(private charsetCoordinates: [x: number, y: number], private color: string) {}

    public get paintColor() {
        return this.color;
    }

    public get coords() {
        return this.charsetCoordinates;
    }
}