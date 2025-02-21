export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        const payload = req.body;
  
        console.log('📩 Webhook Received:', JSON.stringify(payload, null, 2));
  
        // ✅ Handle different Telnyx webhook events here
        if (payload && payload.data && payload.data.event_type) {
          const eventType = payload.data.event_type;
          console.log(`⚡ Event Type: ${eventType}`);
  
          switch (eventType) {
            case 'call.initiated':
              console.log('📞 Call initiated event received.');
              // 👉 Handle call initiation logic here
              break;
  
            case 'call.answered':
              console.log('✅ Call answered by recipient.');
              // 👉 Handle call answered logic here
              break;
  
            case 'call.hangup':
              console.log('📴 Call has been hung up.');
              // 👉 Handle call hangup logic here
              break;
  
            default:
              console.log(`ℹ️ Unhandled event type: ${eventType}`);
              break;
          }
        }
  
        res.status(200).json({ received: true });
      } catch (error) {
        console.error('❌ Error handling webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  }
  