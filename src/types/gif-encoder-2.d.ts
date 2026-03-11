declare module 'gif-encoder-2' {
  class GIFEncoder {
    constructor(width: number, height: number, algorithm?: string, useOptimizer?: boolean);
    start(): void;
    finish(): void;
    setDelay(delay: number): void;
    setQuality(quality: number): void;
    setRepeat(repeat: number): void;
    addFrame(ctx: CanvasRenderingContext2D): void;
    out: {
      getData(): Uint8Array;
    };
  }
  export default GIFEncoder;
}
