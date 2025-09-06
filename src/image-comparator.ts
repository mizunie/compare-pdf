import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import path from 'path';

export interface ComparisonResult {
  areEqual: boolean;
  diffPercentage: number;
  diffPixels: number;
  totalPixels: number;
  diffImagePath?: string;
}

export class ImageComparator {
  private outputDir: string;

  constructor(outputDir: string = './src/temp/diffs') {
    this.outputDir = outputDir;
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async compareImages(
    imagePath1: string,
    imagePath2: string,
    diffImageName?: string,
    debug: boolean = false
  ): Promise<ComparisonResult> {
    try {
      if (debug) {
        console.log('- comparing: ' + path.basename(imagePath1) + ' and ' + path.basename(imagePath2));
      }

      const img1 = PNG.sync.read(fs.readFileSync(imagePath1));
      const img2 = PNG.sync.read(fs.readFileSync(imagePath2));

      // have diff dimensions?
      if (img1.width !== img2.width || img1.height !== img2.height) {
        return {
          areEqual: false,
          diffPercentage: 100,
          diffPixels: Math.max(img1.width * img1.height, img2.width * img2.height),
          totalPixels: Math.max(img1.width * img1.height, img2.width * img2.height)
        };
      }

      const { width, height } = img1;
      const totalPixels = width * height;

      // new diff image
      const diff = new PNG({ width, height });

      const numDiffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        width, height,
        { threshold: 0.1, includeAA: false }
      );

      const diffPercentage = (numDiffPixels / totalPixels) * 100;
      const areEqual = numDiffPixels === 0;

      let diffImagePath: string | undefined;

      // save img if its diff
      if (!areEqual && diffImageName) {
        diffImagePath = path.join(this.outputDir, `diff_${diffImageName}`);
        fs.writeFileSync(diffImagePath, PNG.sync.write(diff));

        if (debug) {
          console.log(' - Diffs: ' + numDiffPixels + ' pixels (' + diffPercentage.toFixed(2) + '%)');
        }
      }

      return {
        areEqual,
        diffPercentage,
        diffPixels: numDiffPixels,
        totalPixels,
        diffImagePath
      };

    } catch (error) {
      if (debug) {
        console.error('Error comparing images:', error);
      }
      throw error;
    }
  }
}