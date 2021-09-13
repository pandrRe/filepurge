export class Char {
    constructor(private charsetCoordinates: [x: number, y: number], public readonly color: string, public readonly backgroundColor?: string) {}

    public get coords() {
        return this.charsetCoordinates;
    }
}