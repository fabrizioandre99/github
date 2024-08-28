import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SeguridadService } from "../services/seguridad.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private seguridadService: SeguridadService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let currentToken = this.seguridadService.obtenerToken;
    //console.log('currentToken', currentToken);

    if (currentToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `${currentToken}`
        }
      })
    }

    return next.handle(req);
  }

}
