import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  APIUrl: 'http://localhost:3000/product',
  BankingAPIUrl: 'https://localhost:7143', // Local .NET API
  displayname: 'Angular 18 App in Development'
};