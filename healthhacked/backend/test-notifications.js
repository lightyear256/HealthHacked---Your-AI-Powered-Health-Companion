

require('dotenv').config();
const NotificationService = require('./src/services/external/notificationService');

async function testNotifications() {
  console.log('🧪 Testing Notification System...\n');


  console.log('0️⃣ Initializing Notification Service...');
  await NotificationService.initialize();
  console.log('✅ Service initialized!\n');

  // Test 1: Check Redis Connection
  console.log('1️⃣ Testing Redis Connection...');
  if (NotificationService.redis) {
    try {
      await NotificationService.redis.ping();
      console.log('✅ Redis connected successfully!');
      
      // Test Redis operations
      await NotificationService.redis.set('test-key', 'test-value');
      const value = await NotificationService.redis.get('test-key');
      console.log(`✅ Redis test: ${value === 'test-value' ? 'PASSED' : 'FAILED'}`);
      await NotificationService.redis.del('test-key');
    } catch (error) {
      console.error('❌ Redis test failed:', error.message);
    }
  } else {
    console.log('⚠️ Redis is disabled or not configured');
  }

  // Test 2: Check Email Configuration
  console.log('\n2️⃣ Testing Email Configuration...');
  if (NotificationService.transporter) {
    console.log('✅ Email transporter created successfully!');
    
    // Send test email
    console.log('📧 Sending test email...');
    const testEmail = process.argv[2] || process.env.SMTP_USER;
    
    if (!testEmail) {
      console.log('⚠️ No email provided. Use: node test-notifications.js your-email@example.com');
      return;
    }

    const result = await NotificationService.sendTestEmail(testEmail);
    
    if (result.success) {
      console.log(`✅ Test email sent successfully to ${testEmail}!`);
      console.log(`📬 Message ID: ${result.messageId}`);
    } else {
      console.error(`❌ Failed to send test email: ${result.error}`);
    }
  } else {
    console.log('❌ Email transporter not configured');
  }

  // Test 3: Check Queue System
  console.log('\n3️⃣ Testing Queue System...');
  if (NotificationService.notificationQueue) {
    console.log('✅ Bull queue initialized successfully!');
    
    // Add a test job
    const job = await NotificationService.notificationQueue.add('test-job', {
      message: 'This is a test job'
    });
    
    console.log(`✅ Test job added to queue with ID: ${job.id}`);
    
    // Get queue stats
    const waiting = await NotificationService.notificationQueue.getWaitingCount();
    const active = await NotificationService.notificationQueue.getActiveCount();
    const completed = await NotificationService.notificationQueue.getCompletedCount();
    const failed = await NotificationService.notificationQueue.getFailedCount();
    
    console.log(`📊 Queue Stats:`);
    console.log(`   - Waiting: ${waiting}`);
    console.log(`   - Active: ${active}`);
    console.log(`   - Completed: ${completed}`);
    console.log(`   - Failed: ${failed}`);
  } else {
    console.log('⚠️ Queue system not available (Redis disabled)');
  }

  console.log('\n✅ All tests completed!');
  
  // Cleanup
  setTimeout(async () => {
    await NotificationService.cleanup();
    process.exit(0);
  }, 2000);
}

// Run tests
testNotifications().catch(console.error);