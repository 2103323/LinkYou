import supabaseClient from "@/utils/supabase";

// Fetch Jobs
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) {
    query = query.eq("location", location);
  }

  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Read Saved Jobs
export async function getSavedJobs(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  return data;
}

// Read single job
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// - Add / Remove Saved Job
export async function saveJob(token, { alreadySaved }, saveData) {
  const supabase = await supabaseClient(token);

  if (alreadySaved) {
    // If the job is already saved, remove it
    const { data, error: deleteError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", saveData.job_id);

    if (deleteError) {
      console.error("Error removing saved job:", deleteError);
      return data;
    }

    return data;
  } else {
    // If the job is not saved, add it to saved jobs
    const { data, error: insertError } = await supabase
      .from("saved_jobs")
      .insert([saveData])
      .select();

    if (insertError) {
      console.error("Error saving job:", insertError);
      return data;
    }

    return data;
  }
}

// - job isOpen toggle - (recruiter_id = auth.uid())
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error Updating Hiring Status:", error);
    return null;
  }

  return data;
}

// get my created jobs
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Delete job
export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (deleteError) {
    console.error("Error deleting job:", deleteError);
    return data;
  }

  return data;
}

// - post job
export async function addNewJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error Creating Job");
  }

  return data;
}

// Fetch Assessments for a Job
export async function getAssessments(token, { job_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("assessments")
    .select("*, questions: questions(*, answers: answers(*))")
    .eq("job_id", job_id);

  if (error) {
    console.error("Error fetching Assessments:", error);
    return null;
  }

  return data;
}

// Fetch Single Assessment with Questions and Answers
export async function getSingleAssessment(token, { assessment_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("assessments")
    .select("*, questions: questions(*, answers: answers(*))")
    .eq("id", assessment_id)
    .single();

  if (error) {
    console.error("Error fetching Assessment:", error);
    return null;
  }

  return data;
}

// Add New Assessment
export async function addAssessment(token, { job_id }, assessmentData) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("assessments")
    .insert([{ ...assessmentData, job_id }])
    .select();

  if (error) {
    console.error("Error adding Assessment:", error);
    throw new Error("Error creating Assessment");
  }

  return data;
}

// Add New Question to an Assessment
export async function addQuestion(token, { assessment_id }, questionData) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("questions")
    .insert([{ ...questionData, assessment_id }])
    .select();

  if (error) {
    console.error("Error adding Question:", error);
    throw new Error("Error creating Question");
  }

  return data;
}

// Add Answer to a Question
export async function addAnswer(token, { question_id }, answerData) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("answers")
    .insert([{ ...answerData, question_id }])
    .select();

  if (error) {
    console.error("Error adding Answer:", error);
    throw new Error("Error creating Answer");
  }

  return data;
}

// Delete an Assessment
export async function deleteAssessment(token, { assessment_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", assessment_id)
    .select();

  if (error) {
    console.error("Error deleting Assessment:", error);
    return null;
  }

  return data;
}

// Update an Assessment
export async function updateAssessment(token, { assessment_id }, assessmentData) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("assessments")
    .update(assessmentData)
    .eq("id", assessment_id)
    .select();

  if (error) {
    console.error("Error updating Assessment:", error);
    return null;
  }

  return data;
}

// Update a Question
export async function updateQuestion(token, { question_id }, questionData) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("questions")
    .update(questionData)
    .eq("id", question_id)
    .select();

  if (error) {
    console.error("Error updating Question:", error);
    return null;
  }

  return data;
}

// Update an Answer
export async function updateAnswer(token, { answer_id }, answerData) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("answers")
    .update(answerData)
    .eq("id", answer_id)
    .select();

  if (error) {
    console.error("Error updating Answer:", error);
    return null;
  }

  return data;
}

// Delete a Question
export async function deleteQuestion(token, { question_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("questions")
    .delete()
    .eq("id", question_id)
    .select();

  if (error) {
    console.error("Error deleting Question:", error);
    return null;
  }

  return data;
}

// Delete an Answer
export async function deleteAnswer(token, { answer_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("answers")
    .delete()
    .eq("id", answer_id)
    .select();

  if (error) {
    console.error("Error deleting Answer:", error);
    return null;
  }

  return data;
}
