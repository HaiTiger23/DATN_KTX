import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

async function run() {
  try {
    const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_123';
    
    await mongoose.connect('mongodb+srv://haitigerytb2_db_user:wRGtpnMZuw8Z0aXW@kitucxacluiser.ijxacdr.mongodb.net/?appName=kitucxacluiser');
    
    const User = mongoose.model('User', new mongoose.Schema({ role: String }));
    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) throw new Error('No admin found');
    
    const realToken = jwt.sign({ id: admin._id }, secret, { expiresIn: '1h' });
    
    const headers = { 'Authorization': `Bearer ${realToken}` };
    const baseUrl = 'http://localhost:5556/api';

    console.log('--- TEST 1: filter requests by status=Pending ---');
    let res = await fetch(`${baseUrl}/admin/requests?status=Pending`, { headers });
    let data = await res.json();
    console.log(`Expected status 200, got ${res.status}. Returned ${data.data?.length || 0} items.`);

    console.log('\n--- TEST 2: filter requests by empty status (all) ---');
    res = await fetch(`${baseUrl}/admin/requests`, { headers });
    data = await res.json();
    console.log(`Expected status 200, got ${res.status}. Returned ${data.data?.length || 0} items.`);

    console.log('\n--- TEST 3: filter requests by search ---');
    res = await fetch(`${baseUrl}/admin/requests?search=NonExistent123`, { headers });
    data = await res.json();
    console.log(`Expected status 200, got ${res.status}. Returned ${data.data?.length || 0} items.`);

    console.log('\n--- TEST 4: filter contracts by room_id ---');
    res = await fetch(`${baseUrl}/admin/contracts?room_id=60d5ecb8b392d700153ee000`, { headers });
    data = await res.json();
    console.log(`Expected status 200, got ${res.status}. Returned ${data.data?.length || 0} items.`);
    
    console.log('\n--- TEST 5: getStudentInvoices with sort ---');
    const student = await User.findOne({ role: 'Student' });
    if (student) {
        const studentToken = jwt.sign({ id: student._id }, secret, { expiresIn: '1h' });
        res = await fetch(`${baseUrl}/student/invoices?sort=amount_desc`, { headers: { 'Authorization': `Bearer ${studentToken}` } });
        data = await res.json();
        console.log(`Expected status 200, got ${res.status}. Returned ${data.data?.length || 0} items.`);
    }

    mongoose.disconnect();
    console.log('\nAll tests completed.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

run();
