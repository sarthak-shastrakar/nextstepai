"use client";

import { parseBulletPoints } from "@/app/form-lib/helper";
import { 
  Briefcase, 
  GraduationCap, 
  Code2, 
  TrendingUp, 
  Heart, 
  Zap, 
  Settings, 
  Globe, 
  Building2, 
  Mail,
  Phone,
  Linkedin,
  Github,
  Award,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Cpu
} from "lucide-react";

const getIndustryConfig = (industry = "default") => {
  const normalized = industry.toLowerCase();
  
  const config = {
    tech: {
      color: "emerald",
      icon: <Code2 className="h-5 w-5" />,
      accent: "from-emerald-600 to-teal-500",
      secondary: "bg-emerald-50 text-emerald-700",
    },
    finance: {
      color: "blue",
      icon: <TrendingUp className="h-5 w-5" />,
      accent: "from-blue-700 to-indigo-900",
      secondary: "bg-blue-50 text-blue-700",
    },
    healthcare: {
      color: "cyan",
      icon: <Heart className="h-5 w-5" />,
      accent: "from-cyan-600 to-teal-500",
      secondary: "bg-cyan-50 text-cyan-700",
    },
    default: {
      color: "slate",
      icon: <Briefcase className="h-5 w-5" />,
      accent: "from-slate-800 to-slate-600",
      secondary: "bg-slate-50 text-slate-700",
    }
  };

  const match = Object.keys(config).find(key => normalized.includes(key));
  return config[match] || config.default;
};

export default function ProfessionalTemplate({ values, user }) {
  const { contactInfo, summary, skills, experience, education, projects, certifications, awards } = values;
  const industry = user?.industry || "Professional";
  const config = getIndustryConfig(industry);

  const Section = ({ title, icon, children }) => (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-3 mb-5 border-b border-slate-200 pb-2">
         <h2 className="text-[12pt] font-bold uppercase tracking-normal text-slate-900">
            {title}
         </h2>
      </div>
      {children}
    </div>
  );

  const Entry = ({ title, org, date, details, link }) => (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-baseline mb-0.5">
        <h3 className="text-[10.5pt] font-bold text-slate-900">
             {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/30">
                  {title}
                </a>
             ) : title}
        </h3>
        <span className="text-[8.5pt] font-semibold text-slate-500 whitespace-nowrap ml-4">{date}</span>
      </div>
      <div className="text-[9.5pt] font-semibold text-slate-600 mb-2 italic">
         {org}
      </div>
      <ul className="space-y-1.5">
        {parseBulletPoints(details).map((point, i) => (
          <li key={i} className="text-[9pt] text-slate-600 leading-normal flex gap-2.5">
            <span className="text-slate-400 mt-1">•</span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-white w-full h-[297mm] overflow-hidden text-slate-800 font-sans leading-normal flex flex-col">
      {/* Subtle Top Border */}
      <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />
      
      <div className="p-12 pb-8">
        {/* Standardized Header */}
        <div className="text-center mb-10 border-b border-slate-100 pb-8">
          <h1 className="text-[26pt] font-black text-slate-950 tracking-tight leading-none mb-3 uppercase">
            {user?.fullName || "Your Name"}
          </h1>
          <p className="text-[10pt] font-bold text-slate-500 mb-2 uppercase tracking-widest">
              {user?.location || "Nagpur, India"}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[9pt] font-bold text-slate-800">
            {contactInfo?.email && (
              <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline underline-offset-4 decoration-blue-200">
                  {contactInfo.email}
              </a>
            )}
            {contactInfo?.mobile && (
              <>
                   <span className="text-slate-300 font-normal">|</span>
                  <span className="text-black">{contactInfo.mobile}</span>
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

        {summary && (
          <div className="mb-10">
             <p className="text-[9.5pt] text-slate-700 leading-normal text-justify font-medium">
                {summary}
             </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
                {experience?.length > 0 && (
                    <Section title="Professional Experience" icon={config.icon}>
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
                    <Section title="Selected Projects" icon={<Zap className="h-5 w-5" />}>
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
            </div>

            <div className="space-y-10">
                <div>
                    <Section title="Expertise" icon={<Settings className="h-5 w-5" />}>
                        <div className="flex flex-wrap gap-1.5">
                             {skills?.split(",").map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[8pt] font-semibold text-slate-700">
                                    {skill.trim()}
                                </span>
                             ))}
                        </div>
                    </Section>
                </div>

                {education?.length > 0 && (
                    <Section title="Education" icon={<GraduationCap className="h-5 w-5" />}>
                        <div className="space-y-5">
                            {education.map((edu, i) => (
                                <div key={i}>
                                    <h4 className="text-[9.5pt] font-bold text-slate-900 leading-tight mb-0.5">{edu.title}</h4>
                                    <p className="text-[8.5pt] text-slate-500 font-medium mb-1">{edu.organization}</p>
                                    <p className="text-[8pt] font-bold text-slate-400">
                                        {edu.endDate || edu.startDate}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {values.certifications?.length > 0 && (
                    <Section title="Certifications" icon={<ShieldCheck className="h-5 w-5" />}>
                        <div className="space-y-4">
                            {values.certifications.map((cert, i) => (
                                <div key={i}>
                                    <h4 className="text-[9.5pt] font-bold text-slate-900 leading-tight mb-0.5">{cert.title}</h4>
                                    <p className="text-[8.5pt] text-slate-500 font-medium mb-1">{cert.organization}</p>
                                    <p className="text-[8pt] font-bold text-slate-400">
                                        {cert.endDate || cert.startDate}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {values.awards?.length > 0 && (
                    <Section title="Awards" icon={<Award className="h-5 w-5" />}>
                        <div className="space-y-4">
                            {values.awards.map((award, i) => (
                                <div key={i}>
                                    <h4 className="text-[9.5pt] font-bold text-slate-900 leading-tight mb-0.5">{award.title}</h4>
                                    <p className="text-[8.5pt] text-slate-600 leading-normal">{award.description}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
