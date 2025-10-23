export class MailQueue {
  constructor({ concurrency = 1, maxRetries = 3, baseDelayMs = 800 } = {}) {
    this.concurrency = concurrency;
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
    this.running = 0;
    this.q = [];
  }

  add(taskFn, meta = {}) {
    this.q.push({ taskFn, meta, tries: 0 });
    this._drain();
  }

  _drain() {
    while (this.running < this.concurrency && this.q.length > 0) {
      const job = this.q.shift();
      this.running++;
      this._run(job);
    }
  }

  _run(job) {
    Promise.resolve()
      .then(job.taskFn)
      .then(() => {
        this.running--;
        this._drain();
      })
      .catch((err) => {
        job.tries++;
        if (job.tries <= this.maxRetries) {
          const delay = this.baseDelayMs * Math.pow(2, job.tries - 1); // backoff
          console.warn(`[MailQueue] fallo (try ${job.tries}), reintenta en ${delay}ms.`, job.meta, err?.message);
          setTimeout(() => {
            this.q.unshift(job);
            this.running--;
            this._drain();
          }, delay);
        } else {
          console.error('[MailQueue] agotados reintentos', job.meta, err);
          this.running--;
          this._drain();
        }
      });
  }
}

export default new MailQueue();