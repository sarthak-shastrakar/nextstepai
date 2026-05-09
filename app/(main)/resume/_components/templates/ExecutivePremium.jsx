export const ExecutivePremium = ({ values, user }) => {
  return (
    <div className="font-serif bg-white text-slate-900 max-w-[210mm] mx-auto min-h-[297mm]">
      {/* Header */}
      <div className="bg-slate-900 text-white p-10 text-center">
        <h1 className="text-4xl font-bold tracking-wider mb-2 text-[#b8860b]">{user?.name || "Your Name"}</h1>
        <p className="text-sm tracking-widest uppercase opacity-80 mb-4">{user?.industry || "Executive"}</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs opacity-75">
          {values?.contactInfo?.email && <span>{values.contactInfo.email}</span>}
          {values?.contactInfo?.mobile && <span>{values.contactInfo.mobile}</span>}
          {values?.contactInfo?.linkedin && <span>{values.contactInfo.linkedin}</span>}
        </div>
      </div>

      <div className="p-10 space-y-8">
        {values?.summary && (
          <div className="text-center px-10">
            <p className="text-sm leading-relaxed text-slate-700 italic">{values.summary}</p>
          </div>
        )}

        {values?.experience?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-center uppercase tracking-widest text-[#b8860b] mb-6 flex items-center justify-center gap-4">
              <span className="h-px bg-slate-200 w-16" /> Experience <span className="h-px bg-slate-200 w-16" />
            </h2>
            <div className="space-y-6">
              {values.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end border-b border-slate-100 pb-2 mb-2">
                    <div>
                      <h3 className="font-bold text-base">{exp.title}</h3>
                      <p className="text-sm font-semibold text-[#b8860b]">{exp.company}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</p>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {values?.skills && (
          <div>
            <h2 className="text-lg font-bold text-center uppercase tracking-widest text-[#b8860b] mb-6 flex items-center justify-center gap-4">
              <span className="h-px bg-slate-200 w-16" /> Expertise <span className="h-px bg-slate-200 w-16" />
            </h2>
            <p className="text-sm text-center text-slate-700 leading-relaxed max-w-2xl mx-auto">{values.skills.split(',').join(' • ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutivePremium;
