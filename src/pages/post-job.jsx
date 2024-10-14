import { getCompanies } from "@/api/apiCompanies";
import { addNewJob, addAssessment, addQuestion, addAnswer } from "@/api/apiJobs";
import AddCompanyDrawer from "@/components/add-company-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { State } from "country-state-city";
import { useEffect } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id: z.string().min(1, { message: "Select or Add a new Company" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
  assessment_name: z.string().min(1, { message: "Assessment Name is required" }),
  questions: z.array(
    z.object({
      question_text: z.string().min(1, { message: "Question is required" }),
      answers: z.array(
        z.object({
          answer_text: z.string().min(1, { message: "Answer is required" }),
          is_correct: z.string().min(1, { message: "Select correct or incorrect" }),
        })
      ),
    })
  ),
});

const PostJob = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      location: "",
      company_id: "",
      requirements: "",
      questions: [{ question_text: "", answers: [{ answer_text: "", is_correct: "" }, { answer_text: "", is_correct: "" }] }]
    },
    resolver: zodResolver(schema),
  });

  // UseFieldArray for dynamic questions and answers
  const { fields: questionFields, append: addQuestionField, remove: removeQuestionField } = useFieldArray({
    control,
    name: "questions",
  });

  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    data: dataCreateJob,
    fn: fnCreateJob,
  } = useFetch(addNewJob);

  const onSubmit = async (data) => {
    const jobData = {
      title: data.title,
      description: data.description,
      location: data.location,
      company_id: data.company_id,
      requirements: data.requirements,
      recruiter_id: user.id,
      isOpen: true,
    };

    const job = await fnCreateJob(jobData); // Create job

    if (job && job.length > 0) {
      // Create assessment
      const assessment = await addAssessment({}, { job_id: job[0].id, name: data.assessment_name });

      // Add all questions and their respective answers
      await Promise.all(
        data.questions.map(async (questionData) => {
          const question = await addQuestion({}, { assessment_id: assessment[0].id }, { question_text: questionData.question_text });

          await Promise.all(
            questionData.answers.map(async (answer) => {
              await addAnswer({}, { question_id: question[0].id }, {
                answer_text: answer.answer_text,
                is_correct: answer.is_correct === "true", // Convert string to boolean
              });
            })
          );
        })
      );

      // Reset form after successful submission
      reset();
      navigate("/jobs");
    }
  };

  useEffect(() => {
    if (dataCreateJob?.length > 0) navigate("/jobs");
  }, [loadingCreateJob]);

  const {
    loading: loadingCompanies,
    data: companies,
    fn: fnCompanies,
  } = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) {
      fnCompanies();
    }
  }, [isLoaded]);

  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">Post a Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 pb-0">
        {/* Job Title */}
        <Input placeholder="Job Title" {...register("title")} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        {/* Job Description */}
        <Textarea placeholder="Job Description" {...register("description")} />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}

        {/* Location and Company */}
        <div className="flex gap-4 items-center">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {State.getStatesOfCountry("IN").map(({ name }) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="company_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Company">
                    {field.value ? companies?.find((com) => com.id === Number(field.value))?.name : "Company"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies?.map(({ name, id }) => (
                      <SelectItem key={name} value={id}>{name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <AddCompanyDrawer fetchCompanies={fnCompanies} />
        </div>

        {/* Job Requirements */}
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => <MDEditor value={field.value} onChange={field.onChange} />}
        />
        {errors.requirements && <p className="text-red-500">{errors.requirements.message}</p>}

        {/* Assessment Section */}
        <h2 className="font-bold text-3xl mt-6">Create Assessment</h2>

        <Input placeholder="Assessment Name" {...register("assessment_name")} />
        {errors.assessment_name && <p className="text-red-500">{errors.assessment_name.message}</p>}

        {/* Questions and Answers */}
        {questionFields.map((question, qIdx) => (
          <div key={qIdx} className="question-section">
            <Textarea
              placeholder={`Question ${qIdx + 1}`}
              {...register(`questions.${qIdx}.question_text`)}
            />
            {errors.questions?.[qIdx]?.question_text && (
              <p className="text-red-500">{errors.questions[qIdx].question_text.message}</p>
            )}

            {question.answers.map((_, aIdx) => (
              <div key={aIdx} className="flex gap-4 items-center">
                <Input
                  placeholder={`Answer ${aIdx + 1}`}
                  {...register(`questions.${qIdx}.answers.${aIdx}.answer_text`)}
                />
                <Controller
                  name={`questions.${qIdx}.answers.${aIdx}.is_correct`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={`w-[150px] ${field.value === "true" ? "border-[#42C4F2] text-[#42C4F2]" : "border-[#D3D3D3] text-[#D3D3D3]"}`}>
                        <SelectValue placeholder="Correct/Incorrect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="true">Correct</SelectItem>
                          <SelectItem value="false">Incorrect</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.questions?.[qIdx]?.answers?.[aIdx]?.is_correct && (
                  <p className="text-red-500">{errors.questions[qIdx].answers[aIdx].is_correct.message}</p>
                )}
              </div>
            ))}
            <Button  variant = "destructive" type="button" onClick={() => removeQuestionField(qIdx)} className="mt-2">Remove Question</Button>
          </div>
        ))}

        <Button type="button" variant = "lightblue" onClick={() => addQuestionField({ question_text: "", answers: [{ answer_text: "", is_correct: "" }, { answer_text: "", is_correct: "" }] })}>
          Add Another Question
        </Button>

        <Button className="mt-4"  variant = "lightblue" type="submit">Post Job</Button>
      </form>
    </div>
  );
};

export default PostJob;
