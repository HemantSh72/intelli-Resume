import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Analysis } from "../models/analysis.model.js";
import { InferenceClient } from "@huggingface/inference";

const hf = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN);

const analyzeResume = asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;
    const user = req.user;

    if (!jobDescription) {
        throw new ApiError(400, "Job description is required");
    }
    if (!user.resume) {
        throw new ApiError(400, "Please upload a resume first");
    }

    const resumeContent = `(User's resume is available at this URL: ${user.resume})`;

    const prompt = `
        Analyze the following resume against the provided job description.
        The user's resume content is represented by this text: "${resumeContent}".
        The job description is: "${jobDescription}".

        Provide a detailed analysis in a strict JSON format only. The JSON object must have these exact keys: "matchScore", "summary", "missingKeywords", "suggestedImprovements".
        - "matchScore": An integer between 0 and 100 representing how well the resume matches the job.
        - "summary": A 2-3 sentence summary of the candidate's strengths for this role.
        - "missingKeywords": A JavaScript array of 5-7 important keywords from the job description that are missing from the resume.
        - "suggestedImprovements": A short paragraph on how to improve the resume for this specific job application.
        Do not include any other text or markdown formatting like \`\`\`json.
    `;

    const response = await hf.chatCompletion({
        model: 'HuggingFaceH4/zephyr-7b-beta',
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
    });

    let aiResponseText = response.choices[0].message.content;

    const startIndex = aiResponseText.indexOf('{');
    const endIndex = aiResponseText.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
        aiResponseText = aiResponseText.substring(startIndex, endIndex + 1);
    }
    
    const aiResponseData = JSON.parse(aiResponseText);
    
    const analysis = await Analysis.create({
        owner: user._id,
        jobDescription,
        resumeUrl: user.resume,
        aiResponse: aiResponseData,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, analysis, "Analysis completed successfully"));
});

export { analyzeResume };