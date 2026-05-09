import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

const ResumePage = async () => {
  const data = await getResume();

  return (
    <div className="container mx-auto py-4">
      <ResumeBuilder
        initialContent={data?.resume}
        user={data?.user}
        userIndustry={data?.user?.industry}
      />
    </div>
  );
};

export default ResumePage;
