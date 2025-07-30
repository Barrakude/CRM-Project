import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '../core/constant-system/prefix-http';


@Injectable({
  providedIn: 'root'
})
export class CrmUserService {

  private readonly _http = inject(HttpClient);

  getAll():Observable<any>{  
    return this._http.get<any>(`${BASE_URL}/users`)
  }


}
