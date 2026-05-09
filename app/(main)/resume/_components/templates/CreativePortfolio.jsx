export const CreativePortfolio = ({ values, user }) => {
  return (
    <div className="font-sans bg-[#fafafa] text-slate-800 max-w-[210mm] mx-auto min-h-[297mm] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-teal-500 p-12 text-white relative">
        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-tight mb-2">{user?.name || "Your Name"}</h1>
          <p className="text-xl font-medium opacity-90 mb-6">{user?.industry || "Creative Professional"}</p>
          <div className="flex gap-4 text-sm font-medium opacity-80">
            {values?.contactInfo?.email && <span className="bg-white/20 px-3 py-1 rounded-full">{values.contactInfo.email}</span>}
            {values?.contactInfo?.linkedin && <span className="bg-white/20 px-3 py-1 rounded-full">LinkedIn</span>}
            {values?.contactInfo?.github && <span className="bg-white/20 px-3 py-1 rounded-full">Portfolio</span>}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      <div className="p-10 grid grid-cols-3 gap-10">
        <div className="col-span-2 space-y-8">
          {values?.summary && (
            <div>
              <h2 className="text-2xl font-black text-purple-600 mb-4">About Me</h2>
              <p className="text-sm leading-relaxed text-slate-600">{values.summary}</p>
            </div>
          )}

          {values?.projects?.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-teal-600 mb-6">Featured Projects</h2>
              <div className="grid grid-cols-2 gap-4">
                {values.projects.map((proj, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500">
                    <h3 className="font-bold text-base mb-1">{proj.title}</h3>
                    <p className="text-xs text-purple-600 font-semibold mb-2">{proj.link}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {values?.experience?.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-purple-600 mb-6">Experience</h2>
              <div className="space-y-6">
                {values.experience.map((exp, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{exp.title}</h3>
                        <p className="text-teal-600 font-bold text-sm">{exp.company}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-8">
          {values?.skills && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-black text-teal-600 mb-4">Expertise</h2>
              <div className="space-y-3">
                {values.skills.split(',').map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{skill.trim()}</span>
                      <span className="text-purple-500">{90 - (i * 5)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-teal-400" style={{ width: `${Math.max(40, 90 - (i * 5))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativePortfolio;
