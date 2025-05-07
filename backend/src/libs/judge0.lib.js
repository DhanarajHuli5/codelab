import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
export const getJudge0LanguageId = (language) => {
  const languageMap = {
    "PYTHON": 71,
    "JAVA":62,
    "JAVASCRIPT":63,
  }
  return languageMap[language.toUpperCase()];
}


export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": process.env.JUDGE0_API_KEY
      }
    }
  );

  console.log("Submission Result", data);
  return data;
};

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": process.env.JUDGE0_API_KEY
        }
      }
    );

    const results = data.submissions;

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2
    );

    if (isAllDone) {
      return results;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};
