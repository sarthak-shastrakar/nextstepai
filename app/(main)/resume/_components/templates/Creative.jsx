"use client";
import { parseBulletPoints } from "@/app/form-lib/helper";
import { Sparkles, GraduationCap, Briefcase, Award, Globe, Heart, ShieldCheck } from "lucide-react";
export default function CreativeTemplate({ values, user }) {
    const { contactInfo, summary, skills, experience, education, projects, certifications, awards } = values;
    const Section = ({ title, icon, children }) => (
        <div className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm border border-primary/20">
                    {icon}
                </div>
                <h2 className="text-[14pt] font-black tracking-tight text-slate-900 border-b-4 border-primary/10 flex-grow">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );
    return (
        <div className="bg-white w-full h-[297mm] overflow-hidden text-slate-800 font-sans leading-normal flex flex-col">
            {/* Standardized Header Banner */}
            <div className="bg-slate-900 p-12 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full -ml-24 -mb-24 blur-3xl opacity-30" />
                <div className="relative z-10">
                    <h1 className="text-[32pt] font-black tracking-tighter leading-none mb-3 bg-gradient-to-r from-white via-white to-primary/40 bg-clip-text uppercase">
                        {user?.fullName || "Your Name"}
                    </h1>
                    <p className="text-[10pt] font-bold text-slate-400 mb-4 uppercase tracking-[0.2em] print:opacity-100">
                        {user?.location || "Nagpur, India"}
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[9.5pt] font-bold text-white/90">
                        {contactInfo?.email && (
                            <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline underline-offset-4 decoration-primary/40">
                                {contactInfo.email}
                            </a>
                        )}
                        {contactInfo?.mobile && (
                            <>
                                <span className="text-white/20 font-normal">|</span>
                                <span className="text-white">{contactInfo.mobile}</span>
                            </>
                        )}
                        {contactInfo?.linkedin && (
                            <>
                                <span className="text-white/20 font-normal">|</span>
                                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4 decoration-primary/40 lowercase">
                                    linkedin
                                </a>
                            </>
                        )}
                        {contactInfo?.github && (
                            <>
                                <span className="text-white/20 font-normal">|</span>
                                <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4 decoration-primary/40 lowercase">
                                    github
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-12 flex-grow">
                {/* Main Column */}
                <div className="md:col-span-2 space-y-2">
                    {summary && (
                        <div className="mb-12 relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                            <p className="text-[11pt] text-slate-600 leading-[1.8] italic font-medium">
                                "{summary}"
                            </p>
                        </div>
                    )}

                    {experience?.length > 0 && (
                        <Section title="Career Journey" icon={<Briefcase className="h-5 w-5" />}>
                            <div className="space-y-10">
                                {experience.map((exp, i) => (
                                    <div key={i} className="group relative">
                                        <span className="absolute -left-12 top-2 text-[9pt] font-black text-slate-300 group-hover:text-primary transition-colors uppercase vertical-text hidden lg:block">
                                            {exp.startDate.split(" ")[0]}
                                        </span>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-[12pt] font-black text-slate-900 group-hover:translate-x-1 transition-transform inline-block">
                                                {exp.title}
                                            </h3>
                                            <span className="text-[9pt] font-black text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                                                {exp.current ? "Present" : exp.endDate}
                                            </span>
                                        </div>
                                        <p className="text-[10.5pt] font-bold text-slate-500 mb-4">{exp.organization}</p>
                                        <ul className="space-y-3">
                                            {parseBulletPoints(exp.description).map((point, idx) => (
                                                <li key={idx} className="flex gap-3 text-[9.5pt] text-slate-600 leading-relaxed">
                                                    <div className="mt-2 h-1.5 w-1.5 bg-primary/40 rounded-full shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {projects?.length > 0 && (
                        <Section title="Strategic Projects" icon={<Sparkles className="h-5 w-5" />}>
                            <div className="grid grid-cols-1 gap-6">
                                {projects.map((proj, i) => (
                                    <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                        <h3 className="text-[11pt] font-black text-slate-900 mb-3">{proj.title}</h3>
                                        <p className="text-[9.5pt] text-slate-600 leading-relaxed">
                                            {proj.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="space-y-12">
                    <div>
                        <Section title="Expertise" icon={<Award className="h-5 w-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {skills?.split(",").map((skill, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-900 text-white text-[8.5pt] font-bold rounded-2xl shadow-lg shadow-slate-900/10">
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {education?.length > 0 && (
                        <Section title="Academic Base" icon={<GraduationCap className="h-5 w-5" />}>
                            <div className="space-y-6">
                                {education.map((edu, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-primary/20">
                                        <h3 className="text-[10pt] font-black text-slate-900 leading-tight mb-1">{edu.title}</h3>
                                        <p className="text-[9pt] text-slate-500 font-bold">{edu.organization}</p>
                                        <p className="text-[8.5pt] text-primary/60 font-black mt-1 uppercase tracking-wider">{edu.endDate || edu.startDate}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    <div className="p-8 bg-primary rounded-[2.5rem] text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                        <Heart className="h-8 w-8 mb-4 fill-white animate-pulse" />
                        <h3 className="text-[14pt] font-black mb-2">Passion for Excellence</h3>
                        <p className="text-[9pt] text-white/80 leading-relaxed font-medium">
                            Driven by innovation and a relentless pursuit of professional growth.
                        </p>
                    </div>

                    {values.certifications?.length > 0 && (
                        <Section title="Certificates" icon={<ShieldCheck className="h-5 w-5" />}>
                            <div className="space-y-6">
                                {values.certifications.map((cert, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-primary/20">
                                        <h3 className="text-[10pt] font-black text-slate-900 leading-tight mb-1">{cert.title}</h3>
                                        <p className="text-[9pt] text-slate-500 font-bold">{cert.organization}</p>
                                        <p className="text-[8.5pt] text-primary/60 font-black mt-1 uppercase tracking-wider">{cert.endDate || cert.startDate}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {values.awards?.length > 0 && (
                        <Section title="Recognition" icon={<Sparkles className="h-5 w-5" />}>
                            <div className="space-y-6">
                                {values.awards.map((award, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <h3 className="text-[10pt] font-black text-slate-900 mb-2">{award.title}</h3>
                                        <p className="text-[8.5pt] text-slate-600 leading-relaxed">{award.description}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
