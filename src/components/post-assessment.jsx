import {
  addAssessment,
  addQuestion,
  addAnswer,
  getAssessments
} from "@/api/apiJobs"; // Update the import paths accordingly
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // Import Shadcn UI Select

const PostAssessment = () => {
  const { jobId } = useParams();
  const { register, handleSubmit, control, reset } = useForm();
  const [assessments, setAssessments] = useState([]);

  // Function to handle form submission
  const onSubmit = async (data) => {
    const { assessment_name, question_text, answers } = data;

    try {
      // Create assessment
      const assessment = await addAssessment({}, { job_id: jobId, name: assessment_name });

      // Create question
      const question = await addQuestion({}, { assessment_id: assessment[0].id }, { question_text });

      // Add answers
      await Promise.all(
        answers.map(async (answer) => {
          await addAnswer({}, { question_id: question[0].id }, {
            answer_text: answer.answer_text,
            is_correct: answer.is_correct === "true", // Convert string to boolean
          });
        })
      );

      // Reset form after successful submission
      reset();
      fetchAssessments(); // Re-fetch assessments to display new data
    } catch (error) {
      console.error("Error submitting assessment:", error);
    }
  };

  // Function to fetch assessments from the API
  const fetchAssessments = async () => {
    try {
      const fetchedAssessments = await getAssessments({}, { job_id: jobId });
      setAssessments(fetchedAssessments || []); // Ensure assessments is never null
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  // Fetch assessments when component mounts or jobId changes
  useEffect(() => {
    fetchAssessments();
  }, [jobId]);

  return (
    <div>
      <h1 className="text-center font-bold text-3xl">Create Assessment for Job</h1>
      
      {/* Form to create assessment */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Assessment Name */}
        <Input placeholder="Assessment Name" {...register("assessment_name")} />

        {/* Question */}
        <Textarea placeholder="Question" {...register("question_text")} />

        {/* Answers */}
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <Input  placeholder={`Answer ${idx}`} {...register(`answers.${idx}.answer_text`)} />
            <Controller
              name={`answers.${idx}.is_correct`}
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger className={`w-[150px] ${field.value === "true" ? "border-[#42C4F2] text-[#42C4F2]" : "border-[#D3D3D3] text-[#D3D3D3]"}`}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Incorrect</SelectItem>
                    <SelectItem value="true">Correct</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        ))}

        <Button type="submit" variant="lightblue" className="mt-4">Submit</Button>
      </form>

      {/* Display Existing Questions */}
      <div className="mt-8">
        <h2 className="font-bold text-2xl">Existing Questions</h2>
        
        {assessments.length > 0 ? (
          assessments.map((assessment) => (
            <div key={assessment.id}>
              <h3 className="font-semibold">{assessment.name}</h3>
              
              {assessment.questions && assessment.questions.length > 0 ? (
                assessment.questions.map((question) => (
                  <div key={question.id}>
                    <p className="font-semibold">{question.question_text}</p>
                    <ul>
                      {question.answers && question.answers.length > 0 ? (
                        question.answers.map((answer) => (
                          <li key={answer.id} className={answer.is_correct ? "text-green-600" : ""}>
                            {answer.answer_text}
                          </li>
                        ))
                      ) : (
                        <li>No answers available</li>
                      )}
                    </ul>
                  </div>
                ))
              ) : (
                <p>No questions available for this assessment</p>
              )}
            </div>
          ))
        ) : (
          <p>No assessments available</p>
        )}
      </div>
    </div>
  );
};

export default PostAssessment;
