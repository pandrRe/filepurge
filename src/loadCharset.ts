export function loadCharset(): Promise<HTMLImageElement> {
    return new Promise((resolve, _reject) => {
        const img = new Image();
        img.src = './assets/cp437_8x16.png';
        img.addEventListener('load', () => {
            resolve(img)
        }, false);
    })
}
