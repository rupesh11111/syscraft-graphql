require("dotenv").config();
const express = require("express");
const { mongoose } = require("mongoose");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const typeDefs = require("./schema");
const resolvers = require("./resolver");
const authMiddleware = require("./middleware/auth");

async function startServer() {
  const app = express();

  app.use(authMiddleware); // Apply middleware

  await mongoose.connect(process.env.MONGODB_URI);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  app.use(bodyParser.json());
  app.use(cors());

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        return req;
      },
    })
  );

  app.listen(8000, () => console.log("Server started at PORT = 8000"));
}

startServer();
