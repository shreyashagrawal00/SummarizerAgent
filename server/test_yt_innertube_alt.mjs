import { Innertube } from 'youtubei.js';

const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

async function test() {
  console.log(`Testing youtubei.js for: ${url}`);
  try {
    const yt = await Innertube.create();
    const videoId = "dQw4w9WgXcQ";
    const info = await yt.getInfo(videoId);

    console.log("Video info fetched successfully!");
    console.log("Title:", info.basic_info.title);

    try {
      const transcript = await info.getTranscript();
      if (!transcript || !transcript.transcript || !transcript.transcript.content || !transcript.transcript.content.body) {
        console.log("No transcript found in response.");
      } else {
        const segments = transcript.transcript.content.body.initial_segments;
        console.log("Transcript fetched successfully!");
        console.log("Transcript segment count:", segments.length);
      }
    } catch (trError) {
      console.error("Error getting transcript from info:", trError.message);
    }
  } catch (error) {
    console.error("Error creating Innertube or getting info:", error.message);
  }
}

test();
