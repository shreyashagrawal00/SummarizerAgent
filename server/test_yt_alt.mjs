import { YoutubeTranscript } from "youtube-transcript";

const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Never Gonna Give You Up

async function test() {
  console.log(`Testing transcript for a different video: ${url}`);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    console.log("Transcript fetched successfully for the alternative video!");
    console.log("Transcript count:", transcript.length);
  } catch (error) {
    console.error("Error fetching transcript for alternative video:", error.message);
  }
}

test();
