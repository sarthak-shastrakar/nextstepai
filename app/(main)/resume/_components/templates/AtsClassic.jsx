export const AtsClassic = ({ values, user }) => {
  return (
    <div className="p-8 font-sans text-[11pt] bg-white text-black max-w-[210mm] mx-auto min-h-[297mm]">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1">{user?.name || "Your Name"}</h1>
        <div className="text-sm flex flex-wrap justify-center gap-2">
          {values?.contactInfo?.email && <span>{values.contactInfo.email} |</span>}
          {values?.contactInfo?.mobile && <span>{values.contactInfo.mobile} |</span>}
          {values?.contactInfo?.linkedin && <span>{values.contactInfo.linkedin}</span>}
        </div>
      </div>

      {values?.summary && (
        <div className="mb-4">
          <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-2 pb-1">Professional Summary</h2>
          <p className="text-sm leading-tight">{values.summary}</p>
        </div>
      )}

      {values?.experience?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-2 pb-1">Experience</h2>
          <div className="space-y-3">
            {values.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold text-sm">
                  <span>{exp.title}</span>
                  <span>{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-sm font-semibold italic mb-1">{exp.company}</div>
                <p className="text-sm leading-tight whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {values?.education?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-2 pb-1">Education</h2>
          <div className="space-y-2">
            {values.education.map((edu, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <span className="font-bold">{edu.school}</span>
                  <p>{edu.degree}</p>
                </div>
                <div className="font-bold">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {values?.skills && (
        <div className="mb-4">
          <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-2 pb-1">Skills</h2>
          <p className="text-sm">{values.skills}</p>
        </div>
      )}
    </div>
  );
};

export default AtsClassic;
