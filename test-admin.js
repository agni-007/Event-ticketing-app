import { handler } from './netlify/functions/adminLogin.js';

const mockEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
};

handler(mockEvent, {})
  .then(res => console.log('Response:', res))
  .catch(err => console.error('Error:', err));
