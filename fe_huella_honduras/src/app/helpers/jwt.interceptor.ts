import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { SeguridadService } from "../services/seguridad.service";

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const seguridadService = inject(SeguridadService);
  const currentToken = seguridadService.obtenerToken;

  //console.log('currentToken', currentToken);

  if (currentToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `${currentToken}`
      }
    });
  }

  return next(req);
};
