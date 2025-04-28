import mongoose, { Document, Schema } from "mongoose";

export interface IArtist extends Document {
  user: mongoose.Types.ObjectId;
  fullname: string;
  username: string;
  profileImage: string;
  artistLocation: string;
  aboutArtist: string;
  skills: string[];
  artistAvailability: {
    monday?: { from: string; to: string };
    tuesday?: { from: string; to: string };
    wednesday?: { from: string; to: string };
    thursday?: { from: string; to: string };
    friday?: { from: string; to: string };
    saturday?: { from: string; to: string };
    sunday?: { from: string; to: string };
  };
  subscription: string;
  services: {
    serviceTitle: string;
    serviceCategory: string;
    serviceSubCategory: string;
    serviceSearchTags: string[];
  }[];
  servicePricing: {
    starter: { name: string; description: string; price: number };
    standard: { name: string; description: string; price: number };
    advanced: { name: string; description: string; price: number };
  };
  serviceDescription: string;
  serviceImages: string[];
  serviceVideos: string[];
}

const ArtistSchema: Schema<IArtist> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);
const Artist = mongoose.model<IArtist>("Artists", ArtistSchema);
export default Artist;
