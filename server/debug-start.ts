import 'dotenv/config';

console.log('1. dotenv loaded, SQUARE_ENV =', process.env.SQUARE_ENV);

async function main() {
  console.log('2. importing square...');
  const { Client, Environment } = await import('square');
  console.log('3. square imported');

  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN!,
    environment: Environment.Sandbox,
  });
  console.log('4. square client created');

  console.log('5. importing express...');
  const { default: express } = await import('express');
  console.log('6. express imported');

  const app = express();
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.listen(3001, () => {
    console.log('7. ✅ Server listening on http://localhost:3001');
  });
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
