import 'dotenv/config';
import { readyApp } from '../server/app.js';

let appPromise;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = readyApp();
  }
  const app = await appPromise;
  return app(req, res);
}
