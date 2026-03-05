import { YoutubeTranscript } from "youtube-transcript";

const url = "https://www.youtube.com/watch?v=bxuYDT-BWal";

async function test() {
  console.log(`Testing transcript for: ${url}`);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    console.log("Transcript fetched successfully!");
    console.log("Transcript count:", transcript.length);
    console.log("Snippet:", transcript.slice(0, 2).map(t => t.text).join(" "));
  } catch (error) {
    console.error("Error fetching transcript:", error);
    console.error("Error message:", error.message);
  }
}

test();
