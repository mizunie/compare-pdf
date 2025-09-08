# mizunie-compare-pdf 📄🔍

Una librería para comparar archivos PDF y generar diferencias visuales con reportes detallados. Desarrollado por [Mizunie](https://github.com/mizunie).

## Características

- ✅ Comparación página por página
- ✅ Generación de imágenes con diferencias resaltadas
- ✅ Reportes detallados en consola
- ✅ Soporte para TypeScript
- ✅ Alto rendimiento con procesamiento optimizado

## Requisitos del sistema

- **Node.js 22.15.0 o superior**
- **npm 8.0.0 o superior**

### ¿Por qué Node.js 22.15+?
Utilizamos las últimas características de ES2022 y módulos de Node.js para garantizar máximo rendimiento y estabilidad. Versiones inferiores pueden presentar problemas de compatibilidad.

## Instalación

```bash
npm i mizunie-compare-pdf
```

## Uso básico

```typescript
import { PDFComparator } from 'mizunie-compare-pdf';

async function main() {
  const comparator = new PDFComparator();
  
  try {
    const result = await comparator.comparePDFs(
      './src/test-pdfs/File3.pdf',
      './src/test-pdfs/File4.pdf',
      {
        highlightColor: { r: 255, g: 0, b: 0 },
        debug: true
      }
    );
    
    console.log('\nResultados:');
    console.log('¿Son iguales?', result.areEqual);
    console.log('Diferencias totales:', result.totalDifferences);
    console.log('Resumen:', result.summary);
    
    comparator.generateDetailedReport(result);
    console.log(result.pageResults);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
```

## Resultado

La comparación devuelve un objeto con:

```bash
Loading PDFs...
- 1: File3.pdf
- 2: File4.pdf
- comparing: pdf1_page-1.png and pdf2_page-1.png
- comparing: pdf1_page-2.png and pdf2_page-2.png
 - Diffs: 2528 pixels (0.04%)

📊 Resultados:
¿Son iguales? false
Diferencias totales: 1
Resumen: x 1 pages with diffs (0.04% max)

Details
==================================
General: Have diffs
Pages diffs: 1

Details per page:
   Page 1: Yes 0.00% dif
   Page 2: No 0.04% dif
        Diff image: diff_page_2.png

[
  {
    pageNumber: 1,
    areEqual: true,
    diffPercentage: 0,
    diffPixels: 0,
    totalPixels: 5843750,
    diffImagePath: undefined
  },
  {
    pageNumber: 2,
    areEqual: false,
    diffPercentage: 0.04325989304812834,
    diffPixels: 2528,
    totalPixels: 5843750,
    diffImagePath: 'src\\temp\\diffs\\diff_page_2.png'
  }
]
```

## Soporte de la comunidad

¿Te gusta esta librería? [¡Considera apoyar su desarrollo!](https://ko-fi.com/bananin)

Tu apoyo ayuda a mantener y mejorar esta librería. ¡Gracias! 💖