"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ArtistSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    fullname: { type: String, required: false },
    username: { type: String, required: false },
    profileImage: { type: String, required: false },
    artistLocation: { type: String, required: false },
    aboutArtist: { type: String, required: false },
    skills: {
        type: [String],
        required: false
    },
    artistAvailability: {
        monday: { from: { type: String }, to: { type: String } },
        tuesday: { from: { type: String }, to: { type: String } },
        wednesday: { from: { type: String }, to: { type: String } },
        thursday: { from: { type: String }, to: { type: String } },
        friday: { from: { type: String }, to: { type: String } },
        saturday: { from: { type: String }, to: { type: String } },
        sunday: { from: { type: String }, to: { type: String } }
    },
    subscription: { type: String, required: false },
    services: {
        serviceTitle: { type: String, required: false },
        serviceCategory: { type: String, required: false },
        serviceSubCategory: { type: String, required: false },
        serviceSearchTags: { type: [String], required: false }
    },
    servicePricing: {
        starter: {
            name: { type: String, required: false },
            description: { type: String, required: false },
            price: { type: Number, required: false }
        },
        standard: {
            name: { type: String, required: false },
            description: { type: String, required: false },
            price: { type: Number, required: false }
        },
        advanced: {
            name: { type: String, required: false },
            description: { type: String, required: false },
            price: { type: Number, required: false }
        }
    },
    serviceDescription: { type: String, required: false },
    serviceImages: { type: [String], required: false },
    serviceVideos: { type: [String], required: false }
}, { timestamps: true });
const Artist = mongoose_1.default.model("Artists", ArtistSchema);
exports.default = Artist;
