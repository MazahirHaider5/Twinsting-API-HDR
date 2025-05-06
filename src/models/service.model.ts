import mongoose, { Schema, Document } from 'mongoose';

// Interface for Pricing Plan
interface IPricing {
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
}

// Interface for Media
interface IMedia {
  photos: string[];
  videos: string[];
}

// Interface for Review
interface IReview {
  user_id: mongoose.Types.ObjectId;
  stars: number;
  feedback: string;
}

// Interface for Service
export interface IService extends Document {
  artist_id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  subcategory: string;
  searchTags: string[];
  description: string;
  pricing: {
    starter: IPricing;
    standard: IPricing;
    advance: IPricing;
  };
  media: IMedia;
  reviews: IReview[];
  status: 'active' | 'inactive';
  orders: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PricingSchema = new Schema<IPricing>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deliveryTime: { type: Number, required: true },
  
},{ _id: false });

const MediaSchema = new Schema<IMedia>({
  photos: { type: [String], default: [] },
  videos: { type: [String], default: [] },
});

const ReviewSchema = new Schema<IReview>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String, required: true },
}, { timestamps: true });

const ServiceSchema = new Schema<IService>({
  artist_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  searchTags: { type: [String], default: [] },
  description: { type: String, required: true },
  pricing: {
    starter: { type: PricingSchema, required: false },
    standard: { type: PricingSchema, required: false },
    advance: { type: PricingSchema, required: false },
  },
  media: { type: MediaSchema, default: { photos: [], videos: [] } },
  reviews: { type: [ReviewSchema], default: [] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
}, { timestamps: true });

const Service = mongoose.model<IService>('Service', ServiceSchema);

export default Service;
