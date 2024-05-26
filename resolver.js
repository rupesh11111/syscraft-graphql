const { GraphQLDate } = require("graphql-scalars");
const sendMail = require("./mail");
const jwt = require("jsonwebtoken");
const {
  Event,
  User,
  Registration,
  Survey,
  SurveyResponse,
} = require("./model");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, "secret-key", {
    expiresIn: "1h",
  });
};

const resolvers = {
  Date: GraphQLDate,
  Query: {
    events: async () => {
      try {
        return await Event.find().populate("survey");
      } catch (error) {
        throw new Error("Error fetching events");
      }
    },

    users: async () => {
      try {
        return await User.find();
      } catch (error) {
        throw new Error("Error fetching users");
      }
    },

    surveys: async () => {
      try {
        return await Survey.find();
      } catch (error) {
        throw new Error("Error fetching surveys");
      }
    },

    registrations: async (_, { event }) => {
      try {
        return await Registration.find({ event })
          .populate({
            path: "event",
            populate: {
              path: "survey",
            },
          })
          .populate("user");
      } catch (error) {
        throw new Error("Error fetching registrations");
      }
    },

    surveyResponses: async (_, { registration }) => {
      try {
        return await SurveyResponse.findOne({ registration }).populate({
          path: "registration",
          populate: [
            {
              path: "event",
              populate: {
                path: "survey",
              },
            },
            {
              path: "user",
            },
          ],
        });
      } catch (error) {
        throw new Error("Error fetching survey responses");
      }
    },

    report: async () => {
      try {
        const events = await Event.find();
        // Aggregate data for report
        const report = events.map((event) => ({
          name: event.name,
          date: event.date,
          type: event.type,
          registrations: event.registrationCount,
          surveyData: event.surveySubmissionCount,
        }));
        return report;
      } catch (error) {
        throw new Error("Error generating report");
      }
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.correctPassword(password, user.password))) {
        throw new Error("Invalid credentials");
      }
      const token = generateToken(user);
      return { token, user };
    },

    createEvent: async (_, { name, date, type, survey }, context) => {
      try {
        if (!context.context) {
          throw new Error("Unauthorized");
        }
        const userContext = JSON.parse(JSON.stringify(context.context));
        if (userContext.user.role != "admin") {
          Error.message = "Only admin have access to create a event";
          throw new Error("Only admin have access to create a event");
        }
        const event = new Event({
          name,
          date,
          type,
          survey,
          registrationCount: 0,
          surveySubmissionCount: 0,
        });
        const savedEvent = await event.save();
        return savedEvent;
      } catch (error) {
        console.error("Error creating event:", error);
        throw new Error("Failed to create event");
      }
    },

    createSurvey: async (_, args) => {
      try {
        const survey = new Survey(args);
        const savedSurvey = await survey.save();
        if (args?.event) {
          const event = await Event.findById(args.event);
          event.survey = survey._id;
          await event.save();
        }
        return savedSurvey;
      } catch (error) {
        console.error("Error creating survey:", error);
        throw new Error("Failed to create survey");
      }
    },

    createUser: async (_, { name, email, phoneNumber }) => {
      const user = new User({ name, email, phoneNumber });
      return await user.save();
    },

    submitSurveyResponse: async (_, reqData) => {
      try {
        const userSurvey = new SurveyResponse(reqData);
        await userSurvey.save();
        const registration = await Registration.findById(reqData.registration);
        const event = await Event.findById(registration.event);
        event.surveySubmissionCount++;
        await event.save();
        return {
          status: true,
          message: "Survey submitted successfully",
        };
      } catch (error) {
        console.error(error);
        return {
          status: false,
          message: "Survey submission failed",
        };
      }
    },

    registerUser: async (_, { event, user }) => {
      const eventData = await Event.findById(event);
      const userData = await User.findById(user);
      if (!eventData || !userData) {
        throw new Error("Invalid event or user ID");
      }
      const existingRegistration = await Registration.findOne({
        event,
        user,
      })
        .populate("event")
        .populate("user");

      let registration = existingRegistration;
      let count = 0;
      if (!existingRegistration) {
        registration = new Registration({
          event,
          user,
          checkedIn: false,
          checkOut: false,
          surveyLinkSent: false,
        });
        await registration.save();
        count = 1;
      }
      if(count === 0 ) {
        eventData.registrationCount++;
        await eventData.save();  
      } 
            
      sendMail({
        to: userData?.email,
        subject: userData?.name,
        html: "email.jade",
      });

      return registration;
    },

    checkinUser: async (_, { event, user }) => {
      const registration = await Registration.findOneAndUpdate(
        { event, user },
        { checkedIn: true },
        { new: true }
      );
      if (!registration) {
        throw new Error("User not registered for event");
      }
      if (registration.surveyLinkSent === false) {
        sendMail({
          to: user?.email,
          subject: user?.name,
          html: "email.jade",
        });
        registration.surveyLinkSent = true;
        await registration.save();
      }
      return registration;
    },

    checkoutUser: async (_, { event, user }) => {
      const registration = await Registration.findOneAndUpdate(
        { event, user },
        { checkOut: true },
        { new: true }
      );
      if (!registration) {
        throw new Error("User not registered for event");
      }
      return registration;
    },
  },
};

module.exports = resolvers;
