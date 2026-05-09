export const ModernProfessional = ({ values, user }) => {
  return (
    <div className="p-8 font-sans bg-white text-slate-800 max-w-[210mm] mx-auto min-h-[297mm] flex gap-6">
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-indigo-600 leading-tight mb-2">{user?.name || "Your Name"}</h1>
          <p className="text-sm font-bold text-slate-500">{user?.industry || "Professional"}</p>
        </div>
        
        <div className="space-y-2 text-xs">
          {values?.contactInfo?.email && <p>✉️ {values.contactInfo.email}</p>}
          {values?.contactInfo?.mobile && <p>📱 {values.contactInfo.mobile}</p>}
          {values?.contactInfo?.linkedin && <p>💼 {values.contactInfo.linkedin}</p>}
        </div>

        {values?.skills && (
          <div>
            <h3 className="text-xs font-bold uppercase text-indigo-600 mb-2 border-b border-indigo-100 pb-1">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {values.skills.split(',').map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-medium">{skill.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 py-4 flex flex-col gap-6">
        {values?.summary && (
          <div>
            <h3 className="text-sm font-bold uppercase text-indigo-600 mb-2">Profile</h3>
            <p className="text-sm leading-relaxed text-slate-600">{values.summary}</p>
          </div>
        )}

        {values?.experience?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase text-indigo-600 mb-3">Experience</h3>
            <div className="space-y-4">
              {values.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-indigo-100">
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                  <h4 className="font-bold text-slate-800 text-sm">{exp.title}</h4>
                  <div className="text-xs font-medium text-slate-500 mb-1">{exp.company} | {exp.startDate} – {exp.current ? "Present" : exp.endDate}</div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {values?.education?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase text-indigo-600 mb-3">Education</h3>
            <div className="space-y-3">
              {values.education.map((edu, i) => (
                <div key={i}>
                  <h4 className="font-bold text-slate-800 text-sm">{edu.school}</h4>
                  <p className="text-xs text-slate-600">{edu.degree} | {edu.startDate} – {edu.current ? "Present" : edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernProfessional;
