import path from 'path';
import fs from 'fs';
import { convertDocumentToImage } from '@daranix/pdf-to-image-test';
import { ImageComparator } from './image-comparator';

export interface PDFComparisonResult {
  areEqual: boolean;
  totalDifferences: number;
  pageResults: PageComparisonResult[];
  summary: string;
}

export interface PageComparisonResult {
  pageNumber: number;
  areEqual: boolean;
  diffPercentage: number;
  diffPixels: number;
  totalPixels: number;
  diffImagePath?: string;
}

export class PDFComparator {
  private outputDir: string;
  private imageComparator: ImageComparator;

  constructor(outputDir: string = './src/temp/images') {
    this.outputDir = outputDir;
    this.imageComparator = new ImageComparator();
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async convertPDFToImages(pdfPath: string, prefix?: string): Promise<string[]> {
    const pdfFile = fs.readFileSync(pdfPath);
    const images = await convertDocumentToImage(pdfFile, 'PNG');

    if (!prefix) {
      const pdfName = path.basename(pdfPath, '.pdf');
      prefix = 'pdf_' + pdfName;
    }

    const imagePaths: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const imagePath = path.join(this.outputDir, prefix + '_page-' + (i + 1) + '.png');
      fs.writeFileSync(imagePath, images[i]);
      imagePaths.push(imagePath);
    }

    return imagePaths;
  }

  /**
   * 
   * @param pdfPath1 Path of first file
   * @param pdfPath2 Path of second file
   * @param options 
   * @returns 
   */
  async comparePDFs(
    pdfPath1: string,
    pdfPath2: string,
    options: {
      highlightColor?: { r: number; g: number; b: number };
      debug?: boolean;
    } = { debug: false }
  ): Promise<PDFComparisonResult> {
    if (options.debug) {
      console.log('Loading PDFs...');
      console.log('- 1: ' + path.basename(pdfPath1));
      console.log('- 2: ' + path.basename(pdfPath2));
    }

    // pdfs to images
    const images1 = await this.convertPDFToImages(pdfPath1, 'pdf1');
    const images2 = await this.convertPDFToImages(pdfPath2, 'pdf2');

    const pageResults: PageComparisonResult[] = [];
    let totalDifferences = 0;
    let allEqual = true;

    const maxPages = Math.max(images1.length, images2.length);

    // compare each image
    for (let i = 0; i < maxPages; i++) {
      const pageNumber = i + 1;

      // diff numbers of pages
      if (i >= images1.length || i >= images2.length) {
        pageResults.push({
          pageNumber,
          areEqual: false,
          diffPercentage: 100,
          diffPixels: 0,
          totalPixels: 0
        });
        totalDifferences++;
        allEqual = false;
        continue;
      }

      const result = await this.imageComparator.compareImages(
        images1[i],
        images2[i],
        `page_${pageNumber}.png`,
        options.debug
      );

      pageResults.push({
        pageNumber,
        areEqual: result.areEqual,
        diffPercentage: result.diffPercentage,
        diffPixels: result.diffPixels,
        totalPixels: result.totalPixels,
        diffImagePath: result.diffImagePath
      });

      if (!result.areEqual) {
        totalDifferences++;
        allEqual = false;
      }
    }

    const summary = this.generateSummary(pageResults, allEqual);

    return {
      areEqual: allEqual,
      totalDifferences,
      pageResults,
      summary
    };
  }

  private generateSummary(pageResults: PageComparisonResult[], allEqual: boolean): string {
    if (allEqual) {
      return 'o All images are equals';
    }

    const differentPages = pageResults.filter(page => !page.areEqual);
    const diffPercentages = differentPages.map(page => page.diffPercentage);

    return 'x ' + differentPages.length + ' pages with diffs (' + Math.max(...diffPercentages).toFixed(2) + '% max)';
  }

  generateDetailedReport(result: PDFComparisonResult): void {
    console.log('\nDetails');
    console.log('==================================');
    console.log('General: ' + (result.areEqual ? 'Are equals' : 'Have diffs'));
    console.log('Pages diffs: ' + result.totalDifferences);
    console.log('\nDetails per page:');

    for (let i = 0; i < result.pageResults.length; i++) {
      const pr = result.pageResults[i];
      const status = pr.areEqual ? 'Yes' : 'No';
      console.log('   Page ' + pr.pageNumber + ': ' + status + ' ' + pr.diffPercentage.toFixed(2) + '% dif');
      if (!pr.areEqual && pr.diffImagePath) {
        if (pr.diffImagePath) {
          console.log('        Diff image: ' + path.basename(pr.diffImagePath));
        }
      }
    }
  }
}