import 'dotenv/config';
import axios from 'axios';

async function main() {
  const urlArg = process.argv[2];
  const webhook = urlArg || process.env.GHL_WEBHOOK_URL || process.env.VITE_GHL_WEBHOOK_URL;
  if (!webhook) {
    console.error('Missing webhook URL. Pass as arg or set GHL_WEBHOOK_URL or VITE_GHL_WEBHOOK_URL.');
    process.exit(1);
  }
  const payload = {
    type: 'contact',
    source: 'test-script',
    propertyId: null,
    data: {
      firstName: 'Test',
      lastName: 'Lead',
      email: 'test@example.com',
      phone: '+1 555-555-5555',
      message: 'This is a test lead sent by send-test-lead.ts',
      agreeTerms: true,
      agreeConsent: true,
    },
    meta: {
      userAgent: 'test-script',
      referrer: 'local',
      location: 'local',
      timestamp: new Date().toISOString(),
    },
  };
  const res = await axios.post(webhook, payload);
  console.log('Webhook response:', res.status, res.statusText);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
