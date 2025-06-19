const mongoose = require("mongoose")

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["transport", "energy", "waste", "water", "food", "other"],
    },
    points: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
    impact: {
      co2Saved: {
        type: Number,
        default: 0,
      },
      waterSaved: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Habit", habitSchema)
