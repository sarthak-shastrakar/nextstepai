/**
 * Cover Letter utility helpers — NOT a server action file.
 * Safe to import from both server and client components.
 */

/** Build a plain-text version of a structured cover letter object */
export function buildPlainText(s) {
  if (!s) return "";
  return [
    s.senderName,
    s.senderEmail,
    s.senderPhone,
    "",
    s.date,
    "",
    s.recipient,
    s.company,
    "",
    (s.salutation || "") + ",",
    "",
    s.introduction,
    "",
    s.body_paragraph_1,
    "",
    s.body_paragraph_2 || null,
    s.body_paragraph_2 ? "" : null,
    s.conclusion,
    "",
    (s.closing || "Sincerely") + ",",
    s.signature,
  ]
    .filter((l) => l !== null)
    .join("\n");
}
