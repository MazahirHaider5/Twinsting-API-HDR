"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Order Schema
const OrderSchema = new mongoose_1.Schema({
    order_number: { type: String, unique: true },
    service_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Service", required: true },
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
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    artist_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Artists", required: true },
    booking_date_time: { type: Date, default: Date.now }
}, { timestamps: true });
// Auto-generate order_number (increments sequentially, min 5 digits)
OrderSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.order_number) {
            const lastOrder = yield mongoose_1.default.model("Order").findOne({}, {}, { sort: { createdAt: -1 } });
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
        }
        else {
            this.remaining_time = "Expired";
        }
        next();
    });
});
const Order = mongoose_1.default.model("Order", OrderSchema);
exports.default = Order;
