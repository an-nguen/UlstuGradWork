import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CONSTANTS } from '@core/constants';
import { AuthenticationResponseDto, AuthenticationStatus } from '@core/dtos/BookManager.Application.Common.DTOs';
import { AUTH_HTTP_CLIENT } from '@core/providers/auth-http-client';
import { AuthState } from '@core/stores/auth.state';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly URL =
    environment.BASE_URL + '/' + CONSTANTS.SERVER_URL.AUTH.PATH;

  public isSignedIn$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly _state: AuthState,
    private readonly _httpClient: HttpClient,
    @Inject(AUTH_HTTP_CLIENT) private readonly _authHttpClient: HttpClient
  ) {
  }

  public signIn(name: string, pinCode: string): Observable<void> {
    return this._authHttpClient
      .post<AuthenticationResponseDto>(
        AuthService.URL + '/' + CONSTANTS.SERVER_URL.AUTH.SIGN_IN,
        {
          name,
          pinCode,
        },
        { withCredentials: true }
      )
      .pipe(
        map((token) => {
          if (token.accessToken) {
            this._state.accessToken = token.accessToken;
          }
        })
      );
  }

  public refreshToken(): Observable<boolean> {
    return this._authHttpClient
      .post<AuthenticationResponseDto>(
        AuthService.URL + '/' + CONSTANTS.SERVER_URL.AUTH.REFRESH_TOKEN,
        undefined,
        {
          // A refreshToken is stored in http only cookie
          withCredentials: true,
        }
      )
      .pipe(
        map((response) => {
          if (response.status === AuthenticationStatus.Success && response.accessToken) {
            this._state.accessToken = response.accessToken;
          }
          return response.status === AuthenticationStatus.Success;
        }),
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            console.log(err.message);
          }
          return of(false);
        })
      );
  }

  public signOut(): Observable<void> {
    return this._httpClient.post<void>(
      AuthService.URL + '/' + CONSTANTS.SERVER_URL.AUTH.SIGN_OUT,
      undefined,
      {
        withCredentials: true,
      }
    );
  }

  public clearAccessToken(): void {
    this._state.accessToken = null;
  }
}
