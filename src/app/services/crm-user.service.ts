import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrmUserService {

  private readonly _http=inject(HttpClient);
  private readonly _baseUrl= 'http://localhost:3000';

  getAll():Observable<any>{
    return this._http.get<any>(`${this._baseUrl}/users`)
  }


}
