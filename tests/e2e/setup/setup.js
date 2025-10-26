const { setupTestDatabase, cleanupTestDatabase } = require('../../setup/database.setup');
const app = require('../../setup/app.setup');

let server;
let baseURL;

beforeAll(async () => {
  // start the server
  const PORT = process.env.TEST_PORT || 3001;
  server = app.listen(PORT);
  baseURL = `http://localhost:${PORT}`;

  // setup test database
  await setupTestDatabase();

  // global variables
  global.baseURL = baseURL;
  global.server = server;

  console.log(`E2E Test Server running on ${baseURL}`);
}, 30000);

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await cleanupTestDatabase();

  console.log('E2E Test Server stopped');
}, 30000);
