import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUserPayment extends Document {
  userId: mongoose.Types.ObjectId
  eventFeePaid: boolean
  eventFeeAmount: number // 150 for PSG students, 200 for others
  workshopsPaid: string[] // Array of workshop IDs that are paid
  
  createdAt: Date
  updatedAt: Date
}

const UserPaymentSchema = new Schema<IUserPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    eventFeePaid: {
      type: Boolean,
      default: false,
    },
    eventFeeAmount: {
      type: Number,
      default: 200,
    },
    workshopsPaid: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const UserPayment: Model<IUserPayment> =
  mongoose.models.UserPayment || mongoose.model<IUserPayment>("UserPayment", UserPaymentSchema)

export default UserPayment

