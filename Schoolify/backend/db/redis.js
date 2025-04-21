import Redis from 'ioredis';

// Create a new Redis client (single instance)
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

// Error handling
redis.on('connect', () => {
  console.log('[Redis] Conectado con éxito');
});

redis.on('error', (err) => {
  console.error('[Redis] Error:', err);
});

redis.on('ready', () => {
  console.log('[Redis] Cliente listo');
});

redis.on('reconnecting', () => {
  console.log('[Redis] Cliente reconectando');
});

process.on('SIGINT', () => {
  redis.disconnect();
  process.exit(0);
});

export default redis; 
