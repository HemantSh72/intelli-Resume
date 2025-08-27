import mongoose, { Schema } from "mongoose";

const analysisSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        resumeUrl: {
            type: String,
            required: true,
        },
        aiResponse: {
            matchScore: { type: Number },
            summary: { type: String },
            missingKeywords: [{ type: String }],
            suggestedImprovements: { type: String },
        },
    },
    { timestamps: true }
);

export const Analysis = mongoose.model("Analysis", analysisSchema);