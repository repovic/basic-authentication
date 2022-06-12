import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        email: {
            required: true,
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            required: true,
            type: String,
            trim: true,
        },
        isAdmin: {
            default: false,
            type: Boolean,
        },
        isBanned: {
            default: false,
            type: Boolean,
        },
        refreshTokens: [
            {
                _id: false,
                token: {
                    type: String,
                },
                userAgent: {
                    type: String,
                },
                ip: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
