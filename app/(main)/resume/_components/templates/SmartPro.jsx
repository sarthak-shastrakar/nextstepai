"use client";

import { parseBulletPoints } from "@/app/form-lib/helper";

export default function SmartProTemplate({ values, user }) {
  const { contactInfo, summary, skills, experience, education, projects, certifications, awards } = values;

  const Section = ({ title, children }) => (
    <div className="mb-5 last:mb-0">
      <div className="flex items-baseline mb-1.5 px-0">
        <h2 className="text-[10.5pt] font-extrabold uppercase tracking-widest text-black shrink-0">
          {title}
        </h2>
        <div className="flex-grow border-b-[1.2px] border-black ml-2 mb-[4px]" />
      </div>
      <div className="px-0.5">
        {children}
      </div>
    </div>
  );

  const Entry = ({ title, org, date, details, link, subtitle }) => (
    <div className="mb-4 last:mb-0 text-[9.5pt]">
      <div className="flex justify-between items-baseline mb-0.5">
        <div className="font-bold text-black flex items-center gap-1.5 flex-wrap">
          <span className="text-[10pt]">{title}</span> 
          {subtitle && <span className="font-normal font-serif italic text-slate-700">— {subtitle}</span>}
        </div>
        <span className="font-bold whitespace-nowrap ml-4 text-black text-[9.5pt]">{date}</span>
      </div>
      <div className="flex justify-between items-baseline mb-1 text-[9.5pt]">
        <p className="font-semibold text-slate-800">{org}</p>
        {link && (
            <div className="flex gap-2 text-blue-600 font-bold ml-4 lowercase italic text-[8.5pt]">
                 <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
                    [link]
                 </a>
            </div>
        )}
      </div>
      <ul className="list-disc ml-5 space-y-0.5 mt-1.5">
        {parseBulletPoints(details).map((point, i) => (
          <li key={i} className="text-slate-800 leading-[1.4] pl-1 tracking-tight">
             <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-white p-[0.5in] w-full text-black font-sans leading-tight">
      {/* ── Header ── Centered */}
      <div className="text-center mb-5">
        <h1 className="text-[20pt] font-bold text-black tracking-tighter leading-none mb-1.5 uppercase">
          {user?.fullName || "Your Name"}
        </h1>
        <p className="text-[9pt] font-semibold text-slate-500 mb-1.5 uppercase tracking-widest">
          {user?.location || "Nagpur, India"}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[8.5pt] font-bold text-slate-800">
          {contactInfo?.email && (
            <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline underline-offset-4 decoration-blue-200">
                {contactInfo.email}
            </a>
          )}
          {contactInfo?.mobile && (
            <>
                 <span className="text-slate-300 font-normal">|</span>
                <span className="text-black font-extrabold">(+91) {contactInfo.mobile}</span>
            </>
          )}
          {contactInfo?.linkedin && (
              <>
                <span className="text-slate-300 font-normal">|</span>
                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline underline-offset-4 decoration-blue-200 lowercase">
                    linkedin
                </a>
              </>
          )}
          {contactInfo?.github && (
            <>
                <span className="text-slate-300 font-normal">|</span>
                <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline underline-offset-4 decoration-blue-200 lowercase">
                    github
                </a>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Summary">
          <p className="text-[9.5pt] text-slate-800 leading-[1.5] text-justify tracking-tight pr-1" 
             dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
        </Section>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <Section title="Education">
          {education.map((edu, i) => (
            <div key={i} className="mb-2 last:mb-0 text-[10pt]">
               <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-black text-[10pt]">{edu.organization}</h3>
                <span className="font-bold text-black ml-4 text-[9.5pt]">{edu.endDate || edu.startDate}</span>
              </div>
              <div className="flex justify-between items-baseline mt-0.5">
                  <p className="font-semibold text-slate-700 text-[9.5pt] italic">{edu.title}</p>
                  {edu.description && <span className="font-bold text-[9pt]">{edu.description}</span>}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Work Experience */}
      {experience?.length > 0 && (
        <Section title="Work Experience">
          {experience.map((exp, i) => (
            <Entry
              key={i}
              title={exp.title}
              org={exp.organization}
              date={`${exp.startDate} — ${exp.current ? "Present" : exp.endDate}`}
              details={exp.description}
              link={exp.link}
            />
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <Section title="Projects">
          {projects.map((proj, i) => (
            <div key={i} className="mb-4 last:mb-0 text-[10pt]">
                 <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-black text-[10pt]">
                        {proj.title}
                        {proj.link && (
                            <span className="text-blue-600 ml-2 font-bold lowercase text-[8.5pt]">
                                [<a href={proj.link} className="hover:underline">link</a>]
                            </span>
                        )}
                    </h3>
                    <span className="font-bold text-black ml-4 text-[9.5pt]">{proj.endDate || proj.startDate}</span>
                </div>
                <div className="font-semibold text-slate-700 text-[9pt] italic mb-1.5">{proj.organization}</div>
                <ul className="list-disc ml-5 space-y-0.5">
                    {parseBulletPoints(proj.description).map((point, idx) => (
                        <li key={idx} className="text-slate-800 leading-[1.4] pl-1 tracking-tight">
                             <span dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                        </li>
                    ))}
                </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Technical Skills */}
      {skills && (
        <Section title="Technical Skills">
          <div className="space-y-1.5 text-[9.5pt] mt-1 pr-2">
            {skills.split("\n").map((line, i) => {
                const parts = line.split(":");
                if (parts.length < 2) return <p key={i} className="text-slate-800">{line}</p>;
                return (
                    <p key={i} className="text-slate-800 leading-tight">
                        <b className="font-black">{parts[0].trim()}:</b> {parts.slice(1).join(":").trim()}
                    </p>
                );
            })}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-2">
            {certifications.map((cert, i) => (
                <div key={i} className="flex justify-between items-baseline text-[9.5pt]">
                <p className="text-slate-800">
                    <span className="font-bold">• {cert.title}</span> — <span>{cert.organization}</span>
                </p>
                <span className="font-bold text-black ml-4">{cert.endDate || cert.startDate}</span>
                </div>
            ))}
          </div>
        </Section>
      )}

      {/* Achievements & Awards */}
      {awards?.length > 0 && (
        <Section title="Achievements & Awards">
          <ul className="list-disc ml-5 space-y-1 text-[9.5pt]">
            {awards.map((award, i) => (
                <li key={i} className="text-slate-800 pl-1 tracking-tight leading-[1.4]">
                    <span className="font-bold" dangerouslySetInnerHTML={{ __html: award.title.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                    {award.description && <span> — {award.description}</span>}
                </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
