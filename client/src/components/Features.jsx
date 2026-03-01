const Features = () => {
  return (
    <section className="bg-slate-900 text-white py-24 overflow-hidden relative">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <span className="material-symbols-outlined text-primary text-5xl mb-8">format_quote</span>
        <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight italic mb-8">
          "In an era of information overload, Briefly is the filter I didn't know I needed. It saves me an hour every single morning."
        </h2>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden mb-3">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoNtsvgrel1fjcVFtNT9Y_zMhpGPhpUYv0iSG61xn57q7X8yMsGXVP03zAkjELVICDQzOAaELg0cja6-MPDYPXOqqRnOJ6NwmKubZ7loXVGzKsBEkOAGkAnMlK_rVTTMtJf9udP1MwREObWjvrhN-hMazkeNalo8IhvxTKfezYd_ZU-MEzPb8RynOLIF-xuPDBxxghFbW3UVNxL3WxSD17f4sEC0bMe4Tey23G4NwNXSkVvQcfdrhaVyPxlxmgsiQ1Nl21n5zswVk" alt="Julian Vance" />
          </div>
          <p className="font-bold text-lg">Julian Vance</p>
          <p className="text-slate-400 text-sm">Chief Content Officer at GlobalNews</p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
    </section>
  );
};

export default Features;
