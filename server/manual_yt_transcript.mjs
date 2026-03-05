import axios from 'axios';

async function getTranscript(url) {
  try {
    const videoId = url.split("v=")[1]?.split("&")[0] || url;
    console.log(`Extracting transcript for ID: ${videoId}`);

    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = response.data;
    const regex = /"captionTracks":\[(.*?)]/;
    const match = html.match(regex);

    if (!match) {
      console.log("No caption tracks found in HTML.");
      // Check for 'ytInitialPlayerResponse'
      const playerResponseRegex = /ytInitialPlayerResponse\s*=\s*({.*?});/;
      const playerMatch = html.match(playerResponseRegex);
      if (playerMatch) {
        const playerResponse = JSON.parse(playerMatch[1]);
        const captions = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (captions && captions.length > 0) {
          console.log("Found captions in ytInitialPlayerResponse!");
          return await fetchAndParseTranscript(captions[0].baseUrl);
        }
      }
      throw new Error("Could not find any caption tracks.");
    }

    const captionTracks = JSON.parse(`[${match[1]}]`);
    console.log(`Found ${captionTracks.length} caption tracks.`);
    const englishTrack = captionTracks.find(t => t.languageCode === 'en') || captionTracks[0];

    return await fetchAndParseTranscript(englishTrack.baseUrl);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function fetchAndParseTranscript(baseUrl) {
  console.log(`Fetching transcript from: ${baseUrl.substring(0, 50)}...`);
  const response = await axios.get(baseUrl + "&fmt=json3");
  const data = response.data;

  if (!data.events) {
    throw new Error("No events found in transcript JSON.");
  }

  const transcript = data.events
    .filter(e => e.segs)
    .map(e => e.segs.map(s => s.utf8).join(""))
    .join(" ")
    .replace(/\n/g, " ");

  console.log("Transcript extracted successfully!");
  console.log("Length:", transcript.length);
  return transcript;
}

const url = "https://www.youtube.com/watch?v=bxuYDT-BWal";
getTranscript(url).then(t => {
  if (t) console.log("Snippet:", t.substring(0, 100) + "...");
});
