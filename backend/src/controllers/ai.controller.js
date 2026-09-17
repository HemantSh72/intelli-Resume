import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Analysis } from "../models/analysis.model.js";
import { InferenceClient } from "@huggingface/inference";
import { jsonrepair } from "jsonrepair";
import axios from "axios";

// Standard way to load CommonJS modules in ESM
import { PDFParse } from "pdf-parse";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN);

const analyzeResume = asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;
    const user = req.user;

    if (!jobDescription) throw new ApiError(400, "Job description is required");
    if (!user.resume) throw new ApiError(400, "Please upload a resume first");

    // NEW: Fetch and parse the resume content
    let resumeText = "";
    try {
        const response = await axios.get(user.resume, {
            responseType: "arraybuffer"
        });

        const parser = new PDFParse({
            data: Buffer.from(response.data)
        });

        const data = await parser.getText();

        resumeText = data.text;

        await parser.destroy();
    } catch (error) {
        console.error("❌ Resume PDF parsing failed:", error);
        throw new ApiError(
            500,
            "Failed to read resume content from the provided file."
        );
    }

    const prompt = `
You are an ATS resume analyzer.

Compare the RESUME with the JOB DESCRIPTION and determine how closely the
candidate's actual qualifications match the job.

Be factual, conservative, and evidence-based.

IMPORTANT:
- Use ONLY information explicitly present in the resume or job description.
- Never invent experience, skills, technologies, qualifications, or achievements.
- Do not assume experience that is not stated.
- Do not require exact wording when the resume provides clear equivalent evidence.
- Do not behave like a simple keyword matcher.
- Evaluate requirements based on meaning and context.

MATCHING RULES:

A requirement is MATCHED when the resume provides clear evidence that the
candidate satisfies it.

A requirement is PARTIAL when the resume provides related evidence but an
important part of the requirement is not demonstrated.

A requirement is MISSING only when it is important to the job and the resume
provides no reasonable evidence for it.

Do not mark a requirement as missing simply because the exact keyword is absent.

Examples of reasonable equivalent evidence:
- AWS EC2, S3, ELB, VPC, or DynamoDB can demonstrate AWS/cloud experience.
- LLM, RAG, AI-powered applications, or multi-agent AI systems can demonstrate
  relevant AI experience when the job requires AI/LLM usage.
- REST APIs and CRUD operations can demonstrate backend/API development.
- Testing, debugging, Postman, and API testing can demonstrate testing experience.
- A personal, academic, or project implementation can satisfy a project-based
  experience requirement when the job description allows such experience.

Do NOT treat small implementation details such as HTTP methods, UTF-8,
file formats, encoding, or punctuation as missing requirements unless the
job description specifically requires them.

Do NOT treat a quantitative outcome or performance metric (e.g. "hallucination
reduction rate", "latency under X ms", "% accuracy improvement") as a normal
requirement or missing keyword. These are measured RESULTS, not skills or
technologies, and a resume cannot "add" a number it never measured. If the job
description asks for a specific metric the resume does not report, treat the
underlying capability (e.g. building/evaluating a RAG or LLM pipeline) as the
real requirement, and note the metric itself only inside missingRequirements
as context — never inside missingKeywords, and never suggest fabricating or
"reporting" a number in suggestedImprovements.

REQUIREMENT ANALYSIS:

Identify the IMPORTANT requirements from the job description.

Focus primarily on:
- mandatory qualifications
- required technical skills
- required experience
- education and eligibility
- AI/LLM requirements
- software development requirements
- testing/debugging
- cloud/deployment
- communication/collaboration
- other explicitly required qualifications

Ignore irrelevant technologies and optional details unless they materially
affect the match.

List every important requirement you identify internally as
requirementId, requirementText, and classification (matched/partial/missing)
before computing anything. This list drives the score below — do not compute
the score independently of it.

MATCH SCORE:

matchScore MUST be computed only from the requirement list above:
  rawScore = (matched * 1 + partial * 0.5) / totalImportantRequirements
  matchScore = round(rawScore * 100)

Give additional weight to requirements explicitly described as mandatory or
required by counting each of those twice in both numerator and denominator.

Hard constraints (violating any of these is an error):
- matchScore CANNOT be 100 unless every important requirement is MATCHED
  (zero partial, zero missing).
- matchScore CANNOT be 90 or above if any important requirement is MISSING.
- If partialMatches or missingRequirements is non-empty, matchScore MUST be
  below 95.
- The score must be an INTEGER from 0 to 100.

Do NOT increase the score because the resume contains many unrelated skills.
Do NOT decrease the score because the resume lacks technologies that the
job description does not require.

MATCHED REQUIREMENTS:

List only the important requirements that are actually matched.
For every item, mention:
1. The requirement.
2. The specific evidence from the resume.
Do not duplicate requirements.

PARTIAL MATCHES:

List only genuinely partial requirements.
For every item, mention:
1. What the resume demonstrates.
2. What part of the requirement is not demonstrated.
Do not use partialMatches when the requirement is already clearly satisfied.

MISSING REQUIREMENTS:

List only important requirements for which there is no reasonable evidence
in the resume.
Do not list minor or irrelevant gaps.

MISSING KEYWORDS:

A missing keyword is NOT simply a phrase that does not appear in the resume,
and it is NEVER a quantitative outcome/performance metric (see rule above).

Only include a keyword when:
- it represents an important job requirement that is a skill, tool, or
  technology (not a measured result),
- the resume lacks equivalent evidence,
- and including the term would materially improve ATS matching.

If no such keywords exist, return an empty array.

SUGGESTED IMPROVEMENTS:

Give 1-4 useful improvements.

Prioritize:
- important partial or missing requirements
- clearer wording of relevant existing experience
- measurable evidence already supported by the resume
- improving ATS discoverability of genuine experience

Never tell the candidate to falsely add experience, skills, or metrics/numbers
they have not actually measured or reported. If a requirement asks for a
specific metric the resume doesn't state, the correct suggestion is to
measure and report it truthfully if they have the means to, not to "add" it.

If the resume already demonstrates a skill, do not tell the candidate to
"learn" or "add" that skill. Instead suggest making the existing evidence
clearer if necessary.

SUMMARY:

Write 2-3 concise sentences.

The summary must:
- mention the strongest matches
- mention important gaps if they exist
- explicitly state the requirement coverage the score is based on
  (e.g. "X of Y important requirements fully matched")
- use specific evidence from the resume

Do NOT use generic phrases such as:
"strong fit"
"excellent candidate"
"highly suitable"
"great candidate"

Do NOT make a hiring recommendation.

FINAL CHECK:

Before returning the answer, verify:
- no invented facts
- no duplicated requirements
- no contradictory classifications
- matchScore was computed from the requirement list per the formula above,
  not guessed
- matchScore does not violate any hard constraint above
- missingKeywords contains no quantitative metrics
- suggestedImprovements contains no fabrication of metrics or skills
- all JSON is valid
- no comments
- no markdown
- no text outside the JSON

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY this JSON structure:

{
  "matchScore": 0,
  "summary": "2-3 sentence evidence-based summary",
  "matchedRequirements": [
    "Important requirement and specific evidence from the resume"
  ],
  "partialMatches": [
    "Important requirement, evidence that exists, and what is not demonstrated"
  ],
  "missingRequirements": [
    "Important requirement with no reasonable evidence in the resume"
  ],
  "missingKeywords": [
    "Genuinely relevant missing ATS term (skill/tool/tech only, never a metric)"
  ],
  "suggestedImprovements": [
    "Specific realistic improvement"
  ]
}
`;

    const response = await hf.chatCompletion({
        model: 'HuggingFaceH4/zephyr-7b-beta',
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024
    });

    let aiResponseText = response.choices[0].message.content;

    console.log("========== RAW AI RESPONSE ==========");
    console.log(aiResponseText);
    console.log("=====================================");

    aiResponseText = aiResponseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\/\/.*$/gm, "")
        .trim();

    let aiResponseData;

    try {
        // Remove markdown code fences if the model adds them
        aiResponseText = aiResponseText
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        // Parse the AI's JSON response
        const parsedResponse = JSON.parse(jsonrepair(aiResponseText));

        // Normalize the response structure
        aiResponseData = {
            matchScore: Number(parsedResponse.matchScore) || 0,

            summary: parsedResponse.summary || "",

            matchedRequirements: Array.isArray(parsedResponse.matchedRequirements)
                ? parsedResponse.matchedRequirements
                : [],

            partialMatches: Array.isArray(parsedResponse.partialMatches)
                ? parsedResponse.partialMatches
                : [],

            missingRequirements: Array.isArray(parsedResponse.missingRequirements)
                ? parsedResponse.missingRequirements
                : [],

            missingKeywords: Array.isArray(parsedResponse.missingKeywords)
                ? parsedResponse.missingKeywords
                : [],

            suggestedImprovements: Array.isArray(parsedResponse.suggestedImprovements)
                ? parsedResponse.suggestedImprovements
                : [],
        };

    } catch (error) {

        console.error("❌ AI JSON parsing failed:", error);
        console.error("AI response that failed:", aiResponseText);

        throw new ApiError(500, "AI returned a malformed response.");
    }

    const analysis = await Analysis.create({
        owner: user._id,
        jobDescription,
        resumeUrl: user.resume,
        aiResponse: aiResponseData,
    });

    return res.status(200).json(new ApiResponse(200, analysis, "Analysis completed successfully"));
});

export { analyzeResume };