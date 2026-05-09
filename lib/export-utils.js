import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ExternalHyperlink } from "docx";

export const exportToDocx = async (formValues, user) => {
  const { contactInfo, summary, skills, experience, education, projects, certifications, awards } = formValues;

  const createContactSection = () => {
    const parts = [];
    if (contactInfo?.email) {
      parts.push(new ExternalHyperlink({
        children: [new TextRun({ text: contactInfo.email, color: "0000FF", underline: true })],
        link: `mailto:${contactInfo.email}`,
      }));
    }
    if (contactInfo?.mobile) {
      parts.push(new TextRun({ text: ` | ${contactInfo.mobile}` }));
    }
    if (contactInfo?.linkedin) {
      parts.push(new TextRun({ text: " | " }));
      parts.push(new ExternalHyperlink({
        children: [new TextRun({ text: "LinkedIn", color: "0000FF", underline: true })],
        link: contactInfo.linkedin,
      }));
    }
    if (contactInfo?.github) {
      parts.push(new TextRun({ text: " | " }));
      parts.push(new ExternalHyperlink({
        children: [new TextRun({ text: "GitHub", color: "0000FF", underline: true })],
        link: contactInfo.github,
      }));
    }
    return parts;
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            text: user?.fullName || user?.name || "Your Name",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: createContactSection(),
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          ...(summary ? [
            new Paragraph({ 
              text: "PROFESSIONAL SUMMARY", 
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
              spacing: { before: 200, after: 120 }
            }),
            new Paragraph({ text: summary, spacing: { after: 300 }, alignment: AlignmentType.JUSTIFY }),
          ] : []),

          ...(skills ? [
            new Paragraph({ 
              text: "CORE COMPETENCIES", 
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
              spacing: { before: 200, after: 120 }
            }),
            new Paragraph({ text: skills, spacing: { after: 300 } }),
          ] : []),

          ...(experience?.length > 0 ? [
            new Paragraph({ 
              text: "PROFESSIONAL EXPERIENCE", 
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
              spacing: { before: 200, after: 120 }
            }),
            ...experience.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true, size: 22 }),
                  new TextRun({ text: `\t${exp.startDate} - ${exp.current ? "Present" : exp.endDate}`, bold: true, size: 20 }),
                ],
                tabStops: [{ type: "right", position: 9500 }],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: exp.organization, italics: true, size: 20 }),
                ],
                spacing: { after: 100 }
              }),
              ...exp.description.split("\n").filter(Boolean).map(point => 
                new Paragraph({
                  text: point.replace(/^[•\-\*]\s*/, ""),
                  bullet: { level: 0 },
                  spacing: { after: 80 },
                })
              ),
              new Paragraph({ text: "", spacing: { after: 120 } }),
            ]),
          ] : []),

          ...(projects?.length > 0 ? [
            new Paragraph({ 
              text: "TECHNICAL PROJECTS", 
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
              spacing: { before: 200, after: 120 }
            }),
            ...projects.flatMap(proj => [
              new Paragraph({
                children: [
                  new TextRun({ text: proj.title, bold: true, size: 22 }),
                  proj.link ? new TextRun({ text: " " }) : new TextRun({ text: "" }),
                  ...(proj.link ? [
                    new ExternalHyperlink({
                      children: [new TextRun({ text: "(Link)", color: "0000FF", underline: true, size: 18 })],
                      link: proj.link,
                    })
                  ] : []),
                  new TextRun({ text: `\t${proj.startDate} - ${proj.endDate || "Present"}`, bold: true, size: 20 }),
                ],
                tabStops: [{ type: "right", position: 9500 }],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: proj.organization, italics: true, size: 20 }),
                ],
                spacing: { after: 100 }
              }),
              ...proj.description.split("\n").filter(Boolean).map(point => 
                new Paragraph({
                  text: point.replace(/^[•\-\*]\s*/, ""),
                  bullet: { level: 0 },
                  spacing: { after: 80 },
                })
              ),
              new Paragraph({ text: "", spacing: { after: 120 } }),
            ]),
          ] : []),

          ...(education?.length > 0 ? [
            new Paragraph({ 
              text: "EDUCATION", 
              heading: HeadingLevel.HEADING_2,
              border: { bottom: { color: "000000", space: 1, value: "single", size: 6 } },
              spacing: { before: 200, after: 120 }
            }),
            ...education.flatMap(edu => [
              new Paragraph({
                children: [
                  new TextRun({ text: edu.title, bold: true, size: 22 }),
                  new TextRun({ text: `\t${edu.startDate} - ${edu.endDate}`, bold: true, size: 20 }),
                ],
                tabStops: [{ type: "right", position: 9500 }],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: edu.organization, italics: true, size: 20 }),
                ],
                spacing: { after: 200 }
              }),
            ]),
          ] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${user?.fullName || user?.name || "Resume"}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToText = (formValues, user) => {
  let text = `${user?.name || "Your Name"}\n`;
  text += `${formValues?.contactInfo?.email || ""} | ${formValues?.contactInfo?.mobile || ""} | ${formValues?.contactInfo?.linkedin || ""}\n\n`;

  if (formValues?.summary) {
    text += `PROFESSIONAL SUMMARY\n${formValues.summary}\n\n`;
  }

  if (formValues?.experience?.length > 0) {
    text += `EXPERIENCE\n`;
    formValues.experience.forEach(exp => {
      text += `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})\n`;
      text += `${exp.description}\n\n`;
    });
  }

  if (formValues?.education?.length > 0) {
    text += `EDUCATION\n`;
    formValues.education.forEach(edu => {
      text += `${edu.degree} - ${edu.school} (${edu.startDate} - ${edu.current ? "Present" : edu.endDate})\n\n`;
    });
  }

  if (formValues?.skills) {
    text += `SKILLS\n${formValues.skills}\n`;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${user?.name || "Resume"}.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = async (user) => {
  const element = document.getElementById("resume-pdf");
  if (!element) return;
  
  const html2pdf = (await import("html2pdf.js")).default;
  
  const opt = {
    margin: 0,
    filename: `${user?.fullName || user?.name || "Resume"}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Create a temporary canvas to convert colors
        const canvas = clonedDoc.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const convertToRgb = (color) => {
          if (!color || typeof color !== 'string') return color;
          if (!color.includes('oklch') && !color.includes('color(')) return color;
          try {
            ctx.fillStyle = color;
            return ctx.fillStyle; // Returns hex or rgb which html2canvas understands
          } catch (e) {
            return "#000000"; // Fallback
          }
        };

        const elements = clonedDoc.getElementsByTagName("*");
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          const style = window.getComputedStyle(el);
          
          // 1. Convert all possible color properties
          const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke', 'stopColor', 'columnRuleColor', 'textDecorationColor'];
          colorProps.forEach(prop => {
            const val = style[prop];
            if (val && (val.includes('oklch') || val.includes('color('))) {
              el.style[prop] = convertToRgb(val);
            }
          });

          // 2. Clear Tailwind 4 variables that often contain oklch and crash html2canvas
          el.style.setProperty('--tw-ring-color', 'transparent', 'important');
          el.style.setProperty('--tw-ring-shadow', 'none', 'important');
          el.style.setProperty('--tw-shadow', 'none', 'important');
          el.style.setProperty('--tw-outline-color', 'transparent', 'important');
          
          // 3. Handle boxShadow which often contains oklch in Tailwind 4
          if (style.boxShadow && style.boxShadow.includes('oklch')) {
            el.style.boxShadow = 'none';
          }
        }
        
        // 4. Force a specific style for the container
        const resumeContainer = clonedDoc.getElementById("resume-pdf");
        if (resumeContainer) {
          resumeContainer.style.backgroundColor = "#ffffff";
          resumeContainer.style.color = "#000000";
        }
      }
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error("PDF Export Error:", err);
    // If it still fails, try a simpler render
    const simpleOpt = { ...opt, html2canvas: { scale: 1, useCORS: true } };
    await html2pdf().set(simpleOpt).from(element).save();
  }
};
