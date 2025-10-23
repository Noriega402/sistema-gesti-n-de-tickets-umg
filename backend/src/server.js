import app from './app.js';
import { env } from './utils/env.js';

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
