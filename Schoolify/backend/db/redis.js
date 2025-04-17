import Redis from 'ioredis';

// Create a new Redis Cluster client
const redisCluster = new Redis.Cluster([
  {
    host: 'localhost',
    port: 6379         // puerto del primer nodo
  },
  {
    host: 'localhost',
    port: 6380         // puerto del segundo nodo
  }
], {
  redisOptions: {
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  },
  clusterRetryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Error handling
redisCluster.on('error', (err) => {
  console.error('Redis Cluster Error:', err);
});

redisCluster.on('connect', () => {
  console.log('Connected to Redis Cluster');
});

export default redisCluster; 