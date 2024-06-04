import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  UserAddRequest,
  UserDeleteRequest,
  UserDto,
  UserUpdateRequest,
} from '@core/dtos/BookManager.Application.Common.DTOs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  
  private readonly _url: string = `${environment.BASE_URL}/users`;

  constructor(private readonly _httpClient: HttpClient) {}

  public getUsers(): Observable<UserDto[]> {
    return this._httpClient.get<UserDto[]>(this._url);
  }

  public addUser(request: UserAddRequest): Observable<UserDto> {
    return this._httpClient.post<UserDto>(this._url, request);
  }

  public updateUser(id: string, request: UserUpdateRequest): Observable<UserDto> {
    return this._httpClient.put<UserDto>(`${this._url}/${id}`, request);
  }

  public deleteUser(id: string, request: UserDeleteRequest): Observable<void> {
    return this._httpClient.delete<void>(`${this._url}/${id}`, { body: request });
  }
  
}
