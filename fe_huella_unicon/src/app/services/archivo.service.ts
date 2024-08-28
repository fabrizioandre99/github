import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {

  optionsFile = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'blob' as 'json'
  }

  urlDescargarArchivo = environment.baseUrl + '/rest/archivo/descargar';

  constructor(private http: HttpClient) { }

  descargarArchivo(nombreOriginal: string): Observable<any> {
    const filtro = {
      sNombreOriginal: nombreOriginal
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post(this.urlDescargarArchivo, JSON.stringify(filtro), {
      headers: headers,
      responseType: 'blob'
    })
  }
}
