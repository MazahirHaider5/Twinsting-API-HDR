import mongoose, { Document, Schema } from "mongoose";

// Order Interface
export interface IOrder extends Document {
  order_number: string;
  service_id: mongoose.Types.ObjectId;
  order_title: string;
  location: string;
  delivery_date: Date;
  status: "active" | "inactive" | "on way" | "completed" | "cancelled";
  amount: number;
  is_paid: boolean;
  remaining_time: string;
  user_id: mongoose.Types.ObjectId;
  artist_id: mongoose.Types.ObjectId;
  booking_date_time: Date;
}

// Order Schema
const OrderSchema: Schema<IOrder> = new Schema(
  {
    order_number: { type: String, unique: true },
    service_id: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    order_title: { type: String, required: true },
    location: { type: String, required: true },
    delivery_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "on way", "completed", "cancelled"],
      default: "active",
    },
    amount: { type: Number, required: true },
    is_paid: { type: Boolean, default: false },
    remaining_time: { type: String },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    artist_id: { type: Schema.Types.ObjectId, ref: "Artists", required: true },
    booking_date_time: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto-generate order_number (increments sequentially, min 5 digits)
OrderSchema.pre<IOrder>("save", async function (next) {
  if (!this.order_number) {
    const lastOrder = await mongoose.model<IOrder>("Order").findOne({}, {}, { sort: { createdAt: -1 } });
    const nextOrderNumber = lastOrder ? parseInt(lastOrder.order_number) + 1 : 1;
    this.order_number = nextOrderNumber.toString().padStart(5, "0");
  }

  // Calculate remaining time
  const now = new Date();
  const timeDiff = this.delivery_date.getTime() - now.getTime();
  if (timeDiff > 0) {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.remaining_time = `${days}d ${hours}h`;
  } else {
    this.remaining_time = "Expired";
  }

  next();
});

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
