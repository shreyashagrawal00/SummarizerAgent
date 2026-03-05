import fs from 'fs';

const html = fs.readFileSync('youtube_page.html', 'utf8');
const playerResponseRegex = /ytInitialPlayerResponse\s*=\s*({.*?});/;
const match = html.match(playerResponseRegex);

if (match) {
  try {
    const playerResponse = JSON.parse(match[1]);
    const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    console.log("Captions found:", !!captions);
    if (captions) {
      console.log(JSON.stringify(captions, null, 2));
    } else {
      console.log("No caption tracks found in playerResponse.");
      // Check for playability status
      console.log("Playability Status:", playerResponse?.playabilityStatus?.status);
    }
  } catch (e) {
    console.error("Error parsing JSON:", e.message);
  }
} else {
  console.log("Could not find ytInitialPlayerResponse in HTML.");
}
