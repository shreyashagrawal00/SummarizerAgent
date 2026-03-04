import axios from 'axios';

const testRoute = async () => {
  try {
    console.log("Testing POST http://localhost:5001/api/pdf/summarize...");
    const response = await axios.post('http://localhost:5001/api/pdf/summarize', {}, {
      validateStatus: () => true
    });
    console.log(`Status: ${response.status}`);
    console.log('Data:', response.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testRoute();
