import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Analysis } from "../models/analysis.model.js";
import { InferenceClient } from "@huggingface/inference";
import { jsonrepair } from "jsonrepair";
import axios from "axios";

// Standard way to load CommonJS modules in ESM
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const hf = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN);

const analyzeResume = asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;
    const user = req.user;

    if (!jobDescription) throw new ApiError(400, "Job description is required");
    if (!user.resume) throw new ApiError(400, "Please upload a resume first");

    // NEW: Fetch and parse the resume content
    let resumeText = "";
    try {
        const response = await axios.get(user.resume, { responseType: 'arraybuffer' });
        const data = await pdf(response.data);
        resumeText = data.text;
    } catch (error) {
        throw new ApiError(500, "Failed to read resume content from the provided file.");
    }

    const prompt = `
    Analyze the following resume text against the job description.
    Resume Text: "${resumeText}".
    Job Description: "${jobDescription}".

    Return ONLY a single, valid JSON object with: "matchScore", "summary", "missingKeywords", "suggestedImprovements".
    Do not include any conversational filler.
    `;

    const response = await hf.chatCompletion({
        model: 'HuggingFaceH4/zephyr-7b-beta',
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024
    });

    let aiResponseText = response.choices[0].message.content;

    let aiResponseData;
    try {
        aiResponseData = JSON.parse(jsonrepair(aiResponseText));
    } catch (error) {
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