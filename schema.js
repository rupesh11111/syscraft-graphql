const { gql } = require('apollo-server');

const typeDefs = gql`
  scalar Date

  type Event {
    id: ID!
    name: String!
    date: String!
    type: String!
    survey: Survey
    registrationCount: Int!
    surveySubmissionCount: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phoneNumber: String
  }

  type Survey {
    id: ID!
    title: String!
    questions: [SurveyQuestion!]!
  }

  type SurveyQuestion {
    type: String!
    options: [String!]
    text: String
  }

  type Registration {
    id: ID!
    event: Event!
    user: User!
    checkedIn: Boolean!
    checkOut: Boolean!
    surveyLinkSent: Boolean!
  }

  type SurveyResponse {
    id: ID!
    registration: Registration!
    answers: [SurveyResponseAnswer!]!
    submittedAt: String!
  }

  type SurveyResponseAnswer {
    question: ID!
    options: [String]
    input: String
  }

  type ReportEvent {
    name: String!
    date: String!
    type: String!
    registrations: Int!
    surveyData: Int!
  }

  type SubmitSurveyResponse {
    status: Boolean
    message: String
  }

  type Query {
    events: [Event!]!
    users: [User!]!
    surveys: [Survey!]!
    registrations(event: ID!): [Registration!]!
    surveyResponses(registration: ID!): SurveyResponse
    report: [ReportEvent!]!
  }
  
  type AuthPayload {
    token: String!
    user: User!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    createEvent(name: String!, date: String!, type: String!, survey: ID): Event!
    createUser(name: String!, email: String!, phoneNumber: String): User!
    createSurvey(title: String!, event: ID, questions: [SurveyQuestionInput!]!): Survey!
    registerUser(event: ID!, user: ID!): Registration!
    checkinUser(event: ID!, user: ID!): Registration!
    checkoutUser(event: ID!, user: ID!): Registration!
    submitSurveyResponse(registration: ID!, answers: [AnswerInput]!): SubmitSurveyResponse!
  }

  input AnswerInput {
    question: ID!
    options: [String]
    input: String
  }

  input SurveyQuestionInput {
    type: String!
    options: [String]
    text: String
  }
`;

module.exports = typeDefs;
