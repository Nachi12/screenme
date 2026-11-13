import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
    env: {
      NODE_ENV: 'test',
      MONGOMS_SYSTEM_BINARY: '/usr/local/bin/mongod',
    },
  },
});

