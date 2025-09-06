// src/types/pngjs.d.ts
declare module 'pngjs' {
  export interface PNGOptions {
    width?: number;
    height?: number;
    fill?: boolean;
    checkCRC?: boolean;
    deflateChunkSize?: number;
    deflateLevel?: number;
    deflateStrategy?: number;
    deflateFactory?: any;
    filterType?: number | number[];
    colorType?: number;
    inputColorType?: number;
    bitDepth?: number;
    inputHasAlpha?: boolean;
  }

  export class PNG {
    static sync: any;
    constructor(options?: PNGOptions);
    width: number;
    height: number;
    data: Buffer;
    gamma: number;
    
    on(event: 'parsed', callback: () => void): this;
    on(event: 'error', callback: (error: Error) => void): this;
    on(event: 'metadata', callback: (metadata: any) => void): this;
    on(event: string, callback: (...args: any[]) => void): this;
    
    parse(data: Buffer, callback?: (error: Error, data: PNG) => void): this;
    pack(): this;
    pipe(destination: any): this;
  }
}