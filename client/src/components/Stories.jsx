const Stories = () => {
  const stories = [
    {
      category: "Economics",
      title: "The Pivot: Global Economy Shifts Toward Decentralization",
      description: "A 2-minute summary of market trends, supply chain re-routing, and the latest inflation data affecting the G7 nations.",
      readTime: "2 min read",
      sources: "12 sources",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCY4s0db2WLMJ8V4JbbUVz7vuG1vJOEkK326mgqBgGQ2txfo_v2hcnaEMn832P2RfQkJL6m8NLQnDrDWR2tIa4eN4thzlt42nncPc-5Kj9TkKNVHUfb1mzrsUIGRcEa200_JP1FSIgeLOV94xcnChPfurWcpBDiA4QI0d59GW5PArEMkld5Lyi6FNK__ba-WByGVBwuPFSl4pCmSjisf0ReyjLDWqNNzH0N6RdaB_rYsxvb8pm-6NrbYIZBmzWXw7VRSbcWIIV2UFk"
    },
    {
      category: "Environment",
      title: "The Future of Efficiency: Solar Breakthroughs",
      description: "Breaking down the latest research in perovskite solar cells and how they promise to double residential energy output.",
      readTime: "3 min read",
      sources: "8 sources",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmLsu-LEARa_Oa6fhzoyM5nLxy-jclW7Ymuql26cZlauOdz47prheVZcCLCECb4yhYFF9WhMm5tAgpDPBOlTZN7C4u2F-7VKT6bFODnDdHa9ga8xLBj2vx0yUHBMnN7KfGnEE6alE16w9pZB7Qe2Wyt9IRq9g1mUW1VAp1brMMyLuuoRscxpRa5RSamz6qwRoVP-K1Qz826jccAEdQfcod-ajX9mbeUoI19xfWIqehN_7WPjGu8Bo8sb0F7q0HpfuP-FVfVMnDuIo"
    },
    {
      category: "Technology",
      title: "Major Tech Policy: Your Privacy in 2024",
      description: "How new EU and California regulations are forcing social platforms to change their data harvesting models.",
      readTime: "2 min read",
      sources: "15 sources",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBTjtmM_9-OjgOLV0wva2FyrG9InY4otpLzxS5QEzSUQC4ZIDMsBzTGoSj3abABMvvksUIL5R-9z9F4q95ghVEI0Sr1mtyiGxZdovkOHAc00BlEIptzURGkX1pBfX4rz2KS_gZiRUNSlYhYZnWRC9bA1DabdHaVRQs8yxDOgq1QVnMM-nXbIidORyhVFlkayrVgbGBofSUHJbF-ROt3TQRDdCG9xgU94wHJpVKcOeieeD11-n3ygh7f4whYs_1A6ITux5N5BioAIg"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Today's Selected Stories</h2>
        <a className="text-primary font-bold flex items-center gap-1 hover:underline" href="#">
          View Full Digest
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="aspect-video w-full overflow-hidden rounded-xl mb-4">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={story.image} alt={story.title} />
            </div>
            <div className="space-y-2">
              <span className="text-primary text-xs font-bold uppercase">{story.category}</span>
              <h3 className="font-display text-2xl font-bold leading-tight group-hover:text-primary transition-colors">{story.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3">{story.description}</p>
              <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {story.readTime}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">source</span> {story.sources}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stories;
