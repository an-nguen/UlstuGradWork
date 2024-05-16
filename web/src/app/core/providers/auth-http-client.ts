import { HttpBackend, HttpClient } from '@angular/common/http';
import { InjectionToken, Provider } from '@angular/core';

export const AUTH_HTTP_CLIENT = new InjectionToken<HttpClient>(
  'A http client without interceptors'
);

export function provideAuthHttpClient(): Provider {
  return {
    provide: AUTH_HTTP_CLIENT,
    deps: [HttpBackend],
    useFactory: (httpBackend: HttpBackend) => new HttpClient(httpBackend),
  };
}
