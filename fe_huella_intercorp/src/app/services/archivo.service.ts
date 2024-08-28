import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {

  options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  urlDescargarArchivo = environment.baseUrl + '/rest/archivo/download';

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  descargarArchivo(contenedor: string, nombreOriginal: string, esFormato: Boolean): Observable<any> {
    const filtro = {
      sContenedor: contenedor,
      sNombre: nombreOriginal,
      boEsFormato: esFormato
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.urlDescargarArchivo, JSON.stringify(filtro), {
      headers: headers,
      responseType: 'blob'
    })
  }

  descargarReporte(idDiv: string, numberPdf: Number) {
    const element = document.getElementById(idDiv)!;
    const dpi = 240; // Ajusta la resolución deseada en dpi
    const scaleFactor = dpi / 96; // Factor de escala según la resolución deseada

    htmlToImage.toJpeg(element, { pixelRatio: scaleFactor, backgroundColor: 'white' })
      .then((dataUrl) => {
        // Obtener el ancho y alto del contenido del div
        const contentWidth = element.offsetWidth;
        const contentHeight = element.offsetHeight;

        // Ajustar el ancho y alto proporcionales a una hoja A4 (210mm x 297mm) con márgenes izquierdo y derecho de 10mm
        const pdfWidth = 210; // (210mm - 2 * 10mm)
        const pdfHeight = (contentHeight / contentWidth) * pdfWidth;

        const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);

        let titlePdf: string = '';

        if (numberPdf == 1) {
          titlePdf = 'Reporte_Emisiones_GEI.pdf'
        } else if (numberPdf == 2) {
          titlePdf = 'Reporte_Evolución_Anual.pdf'
        } else if (numberPdf == 3) {
          titlePdf = 'Reporte_Indicadores_GEI.pdf'
        } else if (numberPdf == 4) {
          titlePdf = 'Reporte_Panel_Comparativo.pdf'
        } else {
          titlePdf = 'Reporte.pdf'
        }
        pdf.save(titlePdf);
      })
      .catch((error) => {
        this.toastr.error('Existen problemas al generar el pdf.', 'Error');
      });
  }
}
