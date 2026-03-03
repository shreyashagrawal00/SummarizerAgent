// Simplified test of the deduplication logic itself
const testFilteringLogic = () => {
  const results = [
    { title: "duplicate story", description: "desc 1", source_id: "source 1" },
    { title: "Duplicate Story", description: "desc 2", source_id: "source 2" }, // Case variation
    { title: " unique story ", description: "desc 3", source_id: "source 3" }, // Whitespace variation
    { title: "another unique story", description: "desc 4", source_id: "source 4" },
    { title: "DUPLICATE STORY", description: "desc 5", source_id: "source 5" },
  ];

  const seenTitles = new Set();
  const uniqueArticles = results.filter(article => {
    if (!article.title) return false;
    const normalizedTitle = article.title.trim().toLowerCase();
    if (seenTitles.has(normalizedTitle)) {
      return false;
    }
    seenTitles.add(normalizedTitle);
    return true;
  });

  console.log("Original Articles Count:", results.length);
  console.log("Unique Articles Count:", uniqueArticles.length);

  uniqueArticles.forEach(a => console.log(`- "${a.title}"`));

  if (uniqueArticles.length === 3) {
    console.log("✅ Logic Verification Passed: 3 unique stories identified out of 5.");
  } else {
    console.error("❌ Logic Verification Failed.");
    process.exit(1);
  }
};

testFilteringLogic();
