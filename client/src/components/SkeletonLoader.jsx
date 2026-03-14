const SkeletonLoader = ({ lines = 5 }) => {
  return (
    <div className="w-full animate-pulse space-y-4 py-4">
      {[...Array(lines)].map((_, i) => (
        <div 
           key={i} 
           className={`h-4 bg-slate-200 dark:bg-slate-700 rounded-md ${
             i === lines - 1 ? 'w-2/3' : 'w-full'
           }`}
        ></div>
      ))}
      <div className="pt-4 space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-11/12"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-4/5"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
