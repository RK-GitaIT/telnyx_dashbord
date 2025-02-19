import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../config';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const clonedReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${environment.authToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  return next(clonedReq);
};
