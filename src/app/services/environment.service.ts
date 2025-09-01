import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AppEnvironment } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly env: AppEnvironment = environment;

  get production(): boolean {
    return this.env.production;
  }

  get apiUrl(): string {
    return this.env.apiUrl;
  }
}
