export const TechDeveloper = ({ values, user }) => {
  return (
    <div className="font-mono bg-white text-slate-800 max-w-[210mm] mx-auto min-h-[297mm] p-10">
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">{user?.name || "Your Name"}</h1>
        <p className="text-sm font-bold text-slate-500 uppercase">&gt; {user?.industry || "Software Engineer"}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
          {values?.contactInfo?.email && <span>Email: {values.contactInfo.email}</span>}
          {values?.contactInfo?.github && <span>GitHub: {values.contactInfo.github}</span>}
          {values?.contactInfo?.linkedin && <span>LinkedIn: {values.contactInfo.linkedin}</span>}
        </div>
      </div>

      <div className="space-y-8">
        {values?.summary && (
          <div>
            <h2 className="text-sm font-black uppercase border-b border-slate-200 pb-1 mb-2 text-slate-400">/* Summary */</h2>
            <p className="text-sm leading-relaxed">{values.summary}</p>
          </div>
        )}

        {values?.skills && (
          <div>
            <h2 className="text-sm font-black uppercase border-b border-slate-200 pb-1 mb-2 text-slate-400">/* Tech Stack */</h2>
            <div className="flex flex-wrap gap-2">
              {values.skills.split(',').map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {values?.experience?.length > 0 && (
          <div>
            <h2 className="text-sm font-black uppercase border-b border-slate-200 pb-1 mb-4 text-slate-400">/* Experience */</h2>
            <div className="space-y-6">
              {values.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-base font-black">{exp.company} <span className="text-slate-400 font-normal">| {exp.title}</span></h3>
                    <span className="text-xs font-bold text-slate-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-200">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {values?.projects?.length > 0 && (
          <div>
            <h2 className="text-sm font-black uppercase border-b border-slate-200 pb-1 mb-4 text-slate-400">/* Open Source & Projects */</h2>
            <div className="grid grid-cols-2 gap-6">
              {values.projects.map((proj, i) => (
                <div key={i} className="border border-slate-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm">{proj.title}</h3>
                    {proj.link && <span className="text-[10px] text-blue-500 font-bold hover:underline">Link ↗</span>}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechDeveloper;
