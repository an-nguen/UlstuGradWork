import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  
  public isSignedIn = computed<boolean>(() => this._signedIn());

  private _signedIn = signal(false);
  private _accessToken = signal<string | null>(null);

  public get accessToken(): string | null {
    return this._accessToken();
  }

  public set accessToken(value: string | null) {
    this._accessToken.set(value);
    this._signedIn.set(!!value);
  }
  
}
