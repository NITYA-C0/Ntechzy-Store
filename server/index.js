import 'dotenv/config';
import { readyApp } from './app.js';

const PORT = process.env.PORT || 5001;

const app = await readyApp();

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Ntechzy Store API running on http://127.0.0.1:${PORT}`);
});
