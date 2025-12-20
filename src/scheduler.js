import cron from 'node-cron';

class Scheduler {
  constructor(telegramBot) {
    this.telegramBot = telegramBot;
    this.tasks = [];
    this.isRunning = false;
  }

  /**
   * Schedule a task to run every 10 minutes
   * @param {Function} taskFunction - Function to execute every 10 minutes
   * @param {String} taskName - Identifier for the task
   */
  scheduleEvery10Minutes(taskFunction, taskName = 'default-task') {
    const job = cron.schedule('*/10 * * * *', async () => {
      try {
        console.log(`\n[${new Date().toISOString()}] Running task: ${taskName}`);
        await taskFunction();
      } catch (error) {
        console.error(`✗ Task error (${taskName}):`, error.message);
        const errorMsg = `⚠️ <b>Task Error</b>\n\nTask: ${taskName}\nError: ${error.message}`;
        await this.telegramBot.sendMessage(errorMsg).catch(() => {});
      }
    }, {
      runOnInit: false,
      scheduled: true
    });

    this.tasks.push({ name: taskName, job });
    console.log(`✓ Task scheduled: ${taskName} (runs every 10 minutes)`);
    return job;
  }

  /**
   * Schedule a custom cron task
   * @param {String} cronExpression - Cron expression (e.g., '0 * * * *' for every hour)
   * @param {Function} taskFunction - Function to execute
   * @param {String} taskName - Identifier for the task
   */
  schedule(cronExpression, taskFunction, taskName = 'custom-task') {
    const job = cron.schedule(cronExpression, async () => {
      try {
        console.log(`\n[${new Date().toISOString()}] Running task: ${taskName}`);
        await taskFunction();
      } catch (error) {
        console.error(`✗ Task error (${taskName}):`, error.message);
        const errorMsg = `⚠️ <b>Task Error</b>\n\nTask: ${taskName}\nError: ${error.message}`;
        await this.telegramBot.sendMessage(errorMsg).catch(() => {});
      }
    }, {
      runOnInit: false,
      scheduled: true
    });

    this.tasks.push({ name: taskName, job });
    console.log(`✓ Task scheduled: ${taskName}`);
    return job;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      console.log('✓ Scheduler started');
    }
  }

  stop() {
    this.tasks.forEach(task => task.job.stop());
    this.isRunning = false;
    console.log('✓ Scheduler stopped');
  }

  getTasksList() {
    return this.tasks.map(t => t.name);
  }
}

export default Scheduler;
