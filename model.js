const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const EventSchema = new mongoose.Schema({
  name: String,
  date: Date,
  type: String, // online/offline
  survey: { type: mongoose.Schema.Types.ObjectId, ref: "Survey" },
  registrationCount: Number,
  surveySubmissionCount: Number,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phoneNumber: String,
  role: String
});

const SurveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      text: { type: String, required: true },
      type: { type: String, enum: ["option", "input"], required: true },
      options: [String],
    },
  ],
});



const RegistrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  checkedIn: Boolean,
  checkOut: Boolean,
  surveyLinkSent: Boolean,
});

const SurveyResponseSchema = new mongoose.Schema({
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
  },
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
      },
      options:[String],
      input:String
    }
  ],
  submittedAt: Date,
});

// Method to validate password
UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Event = mongoose.model("Event", EventSchema);
const User = mongoose.model("User", UserSchema);
const Survey = mongoose.model("Survey", SurveySchema);
const Registration = mongoose.model("Registration", RegistrationSchema);
const SurveyResponse = mongoose.model("SurveyResponse", SurveyResponseSchema);

module.exports = {
  Event,
  User,
  Survey,
  Registration,
  SurveyResponse,
};
