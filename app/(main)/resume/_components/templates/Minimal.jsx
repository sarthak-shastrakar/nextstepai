"use client";

import { parseBulletPoints } from "@/app/form-lib/helper";

export default function MinimalTemplate({ values, user }) {
  const { contactInfo, summary, skills, experience, education, projects, certifications, awards } = values;

  const Section = ({ title, children }) => (
    <div className="mb-6 last:mb-0">
      <h2 className="text-[11pt] font-black uppercase tracking-[0.1em] border-b border-slate-300 pb-1 mb-3" style={{ color: '#0f172a' }}>
        {title}
      </h2>
      {children}
    </div>
  );

  const Entry = ({ title, org, date, details, link }) => (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-[10pt] font-black" style={{ color: '#0f172a' }}>
             {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }} className="transition-colors underline decoration-slate-300">
                  {title}
                </a>
             ) : (
                title
             )}
        </h3>
        <span className="text-[9pt] font-bold whitespace-nowrap ml-4" style={{ color: '#64748b' }}>{date}</span>
      </div>
      <div className="text-[9.5pt] font-bold italic mb-2 tracking-tight" style={{ color: '#334155' }}>{org}</div>
      <ul className="list-disc ml-5 space-y-1">
        {parseBulletPoints(details).map((point, i) => (
          <li key={i} className="text-[9pt] leading-normal pl-1" style={{ color: '#475569' }}>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-white p-[0.75in] w-full font-sans leading-normal" style={{ color: '#1e293b' }}>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-[26pt] font-black tracking-tighter leading-none mb-3 uppercase" style={{ color: '#020617' }}>
          {user?.fullName || "Your Name"}
        </h1>
        <p className="text-[10pt] font-bold mb-2 uppercase tracking-widest" style={{ color: '#64748b' }}>
            {user?.location || "Nagpur, India"}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[9pt] font-bold">
          {contactInfo?.email && (
            <a href={`mailto:${contactInfo.email}`} style={{ color: '#2563eb' }} className="hover:underline underline-offset-4 decoration-blue-200">
                {contactInfo.email}
            </a>
          )}
          {contactInfo?.mobile && (
            <>
                 <span style={{ color: '#cbd5e1' }} className="font-normal">|</span>
                <span style={{ color: '#000000' }}>{contactInfo.mobile}</span>
            </>
          )}
          {contactInfo?.linkedin && (
              <>
                <span style={{ color: '#cbd5e1' }} className="font-normal">|</span>
                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }} className="hover:underline underline-offset-4 decoration-blue-200 lowercase">
                    linkedin
                </a>
              </>
          )}
          {contactInfo?.github && (
            <>
                <span style={{ color: '#cbd5e1' }} className="font-normal">|</span>
                <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }} className="hover:underline underline-offset-4 decoration-blue-200 lowercase">
                    github
                </a>
            </>
          )}
        </div>
      </div>

      {summary && (
        <Section title="Professional Summary">
          <p className="text-[9.5pt] leading-[1.6] text-justify" style={{ color: '#475569' }}>{summary}</p>
        </Section>
      )}

      {skills && (
        <Section title="Core Competencies">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {skills.split(",").map((skill, i) => (
              <div key={i} className="flex items-center gap-2 text-[9pt] font-bold" style={{ color: '#334155' }}>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#4f46e5' }} />
                {skill.trim()}
              </div>
            ))}
          </div>
        </Section>
      )}

      {experience?.length > 0 && (
        <Section title="Professional Experience">
          {experience.map((exp, i) => (
            <Entry
              key={i}
              title={exp.title}
              org={exp.organization}
              date={exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}
              details={exp.description}
              link={exp.link}
            />
          ))}
        </Section>
      )}

      {projects?.length > 0 && (
        <Section title="Technical Projects">
          {projects.map((proj, i) => (
            <Entry
              key={i}
              title={proj.title}
              org={proj.organization}
              date={proj.endDate || proj.startDate}
              details={proj.description}
              link={proj.link}
            />
          ))}
        </Section>
      )}

      {education?.length > 0 && (
        <Section title="Education">
          {education.map((edu, i) => (
            <div key={i} className="mb-4 last:mb-0">
               <div className="flex justify-between items-baseline">
                <h3 className="text-[10pt] font-black" style={{ color: '#0f172a' }}>{edu.title}</h3>
                <span className="text-[9pt] font-bold whitespace-nowrap ml-4" style={{ color: '#64748b' }}>{edu.endDate || edu.startDate}</span>
              </div>
              <div className="text-[9.5pt] font-bold italic tracking-tight" style={{ color: '#334155' }}>{edu.organization}</div>
            </div>
          ))}
        </Section>
      )}

      {values.certifications?.length > 0 && (
        <Section title="Certifications">
          {values.certifications.map((cert, i) => (
            <div key={i} className="mb-3 last:mb-0">
               <div className="flex justify-between items-baseline">
                <h3 className="text-[10pt] font-black" style={{ color: '#0f172a' }}>{cert.title}</h3>
                <span className="text-[9pt] font-bold whitespace-nowrap ml-4" style={{ color: '#64748b' }}>{cert.endDate || cert.startDate}</span>
              </div>
              <div className="text-[9.5pt] font-bold italic tracking-tight" style={{ color: '#334155' }}>{cert.organization}</div>
            </div>
          ))}
        </Section>
      )}

      {values.awards?.length > 0 && (
        <Section title="Achievements & Awards">
          {values.awards.map((award, i) => (
            <div key={i} className="mb-3 last:mb-0">
               <div className="flex justify-between items-baseline">
                <h3 className="text-[10pt] font-black" style={{ color: '#0f172a' }}>{award.title}</h3>
                <span className="text-[9pt] font-bold whitespace-nowrap ml-4" style={{ color: '#64748b' }}>{award.endDate || award.startDate}</span>
              </div>
              <div className="text-[9pt] leading-normal" style={{ color: '#475569' }}>{award.description}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
