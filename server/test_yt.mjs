import ytdl from '@distube/ytdl-core';
import axios from 'axios';

const videoUrl = 'https://www.youtube.com/watch?v=1L420xXpDTg';

async function test() {
  try {
    const info = await ytdl.getInfo(videoUrl);
    const tracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (tracks && tracks.length > 0) {
      console.log('Tracks found:', tracks.length);
      console.log('First track URL:', tracks[0].baseUrl);

      const { data } = await axios.get(tracks[0].baseUrl);
      console.log('XML response size:', data.length);
      console.log('XML snippet:', data.substring(0, 100));
    } else {
      console.log('No tracks found in ytdl-core info.');
    }
  } catch (e) {
    console.error('Error with ytdl-core:', e.message);
  }
}

test();
