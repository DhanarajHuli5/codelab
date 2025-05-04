import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  // get data from database
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  // check user role
  if (req.role.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "You are not authorized to create a problem." });
  }

  try{
    for(const[ language, soluctionCode] of Object.entries(referenceSolutions)){
      const languageId = getJudge0LanguageId(language);

      if(!languageId){
        return res.status(400).json({error:`Language ${language} is not supported.`})
      }

      //
      const submissions = testcases.map(({input, output}) => ({
        source_code : soluctionCode,
        language_id: languageId,
        stdin:input,
        expected_output:output,

      }))

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);
      
      const results = await pollBatchResults(tokens);

      for(let i = 0; i< results.length; i++){
        const result = results[i];

        if(result.status.id !== 3){
           return res.status(400).json({error:`Testcase ${i+1} failed for language ${language}`})
        }
      }

      // save problem to database
      const problem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });

      return res.status(201).json(problem);
    }


  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
