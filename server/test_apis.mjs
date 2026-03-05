import axios from 'axios';

async function runTests() {
  console.log('Testing News API...');
  try {
    const res = await axios.get('http://localhost:5001/api/news/top-public');
    console.log('News API Success:', res.data ? 'Data received' : 'No data');
  } catch (err) {
    console.error('News API Error:', err.message, err.response?.data);
  }

  console.log('\nTesting Youtube API...');
  try {
    const res = await axios.post('http://localhost:5001/api/youtube/summarize', {
      url: 'https://www.youtube.com/watch?v=OB5eiE_1vpU&t=837s',
      language: 'en'
    }, {
      // simulate auth token? wait, the youtube endpoint requires authMiddleware
      headers: {
        Authorization: 'Bearer test'
      }
    });
    console.log('Youtube API Success:', res.data);
  } catch (err) {
    console.error('Youtube API Error:', err.message, err.response?.data);
  }
}

runTests();
