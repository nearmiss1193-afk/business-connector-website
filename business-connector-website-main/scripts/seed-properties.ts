import { insertSampleProperties } from '../server/db-properties';

async function main() {
  console.log('🌱 Seeding sample properties...');
  await insertSampleProperties();
  console.log('✅ Done!');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
