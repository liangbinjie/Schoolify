import Redis from 'ioredis';

// Create a new Redis client (single instance)
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Error handling
redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export default redis; 
