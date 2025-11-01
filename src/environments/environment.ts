// export const environment = {
//     production: true,
//     APIUrl: 'http://localhost:3000/product',
//     BankingAPIUrl: 'https://localhost:7143', // Your .NET 8 API URL
//     displayname: 'Angular 18 Banking App - Production'
// };

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  APIUrl: 'http://localhost:3000/product',
  BankingAPIUrl: 'https://api.yourbank.com', // Production .NET API
  displayname: 'Angular 18 Banking App - Production'
};