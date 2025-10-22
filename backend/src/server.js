import app from './app.js';
import { env } from './utils/env.js';
import './workers/index.js'; // start workers when API boots (optional)

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
 // console.log(`Bull-board on http://localhost:${env.PORT}/queues`);
});
