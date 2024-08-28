import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AutenticacionService } from './autenticacion.service';
import { IDataResponse } from '../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { IAutenticacion } from '../models/autenticacion';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  ip_huella: string | undefined;
  oSesion: any = {};
  sesion: any;

  constructor(private http: HttpClient, private location: Location, private autenticacionService: AutenticacionService) {
  }

  async guardarSesion() {
    const sesion = localStorage.getItem('sesion');

    // Si ya existe una sesión, imprimir y retornar esta sesión
    if (sesion) {
      console.log('Los detalles ya existen en localStorage:', JSON.parse(sesion));
      return JSON.parse(sesion);
    }

    try {
      // Realizar la solicitud HTTP y esperar la respuesta
      const respuesta: any = await this.http.get<{ ip: string }>('https://jsonip.com').toPromise();

      this.ip_huella = respuesta.ip;

      const detalles: IAutenticacion = {
        sDireccionIp: this.ip_huella || null,
        sServidorApp: this.detectarNavegador(),
        sSistemaOperativo: navigator.platform,
        sUrlApp: this.location.path(),
      };

      console.log('Detalles:', detalles);

      // Enviar al servicio de registro de sesión y guardar en localStorage
      await this.fnEnviarSesion(detalles);  // Asegúrate de que esta función retorne una promesa

    } catch (error) {
      console.error('Error al obtener la dirección IP:', error);
    }
  }

  getSesion() {
    return localStorage.getItem('sesion') || null;
  }

  async fnEnviarSesion(detalle: any) {
    try {
      let data: IDataResponse = await lastValueFrom(this.autenticacionService.registrarSesion(detalle));

      if (data.boExito) {
        this.sesion = data.oDatoAdicional;
        localStorage.setItem('sesion', JSON.stringify(this.sesion));
        console.log('Primera sesión guardada en el Servicio', this.sesion);
      }
    } catch (error) {
      console.error('Error al enviar la sesión:', error);
    }
  }

  detectarNavegador(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Chrome") && !userAgent.includes("Edg") && !userAgent.includes("OPR")) {
      return "Google Chrome";
    } else if (userAgent.includes("Firefox")) {
      return "Mozilla Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      return "Apple Safari";
    } else if (userAgent.includes("Edg")) {
      return "Microsoft Edge";
    } else if (userAgent.includes("OPR") || userAgent.includes("Opera")) {
      return "Opera";
    } else {
      return "Other";
    }
  }
}
