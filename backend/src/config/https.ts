/* eslint-disable prettier/prettier */
import * as fs from 'fs';

export function configureDevCert() {
  return {
     key: fs.readFileSync('dev/local-dev-key.pem'),
    cert: fs.readFileSync('dev/local-dev.pem'),
  };
}
