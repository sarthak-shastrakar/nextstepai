import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

const ResumePage = async () => {
  const data = await getResume();

  // Calculate today's usage from DB values (server-side, same YYYY-MM-DD logic)
  const today = new Date().toISOString().slice(0, 10);
  const resume = data?.resume;

  const initialAIUsage = {
    improveUsed: resume?.aiImproveDate === today ? (resume?.aiImproveCount || 0) : 0,
    atsUsed:     resume?.aiAtsDate     === today ? (resume?.aiAtsCount     || 0) : 0,
  };

  return (
    <div className="container mx-auto py-4">
      <ResumeBuilder
        initialContent={resume}
        user={data?.user}
        userIndustry={data?.user?.industry}
        initialAIUsage={initialAIUsage}
      />
    </div>
  );
};

export default ResumePage;
