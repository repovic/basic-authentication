import { ApolloServer } from "apollo-server-express";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import mongoose, { MongooseError } from "mongoose";
import { userResolver, userSchema } from "./graphql";
import authMiddleware from "./middlewares/auth.middleware";
require("dotenv").config({
    path: `./source/environment/.env${
        ((process.env.NODE_ENV as string) && `.${process.env.NODE_ENV}`) || ""
    }`,
});

const app = express();
app.use(
    cors({
        origin: "https://studio.apollographql.com",
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(authMiddleware);

const server = new ApolloServer({
    typeDefs: [userSchema],
    resolvers: [userResolver],
    context: ({ req, res }) => ({ req, res }),
    csrfPrevention: true,
});

(async () => {
    await mongoose
        .connect(process.env.MONGODB_CONNECTION_STRING as string)
        .then(() => {
            console.log("Successfully connected to MongoDB!");
        })
        .catch((err: MongooseError) => {
            console.error(`Error connecting to MongoDB: ${err.message}`);
            process.exit();
        });

    await server.start();
    server.applyMiddleware({
        app,
        cors: false,
        path: "/graphql",
    });
})();

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
    console.log(
        `GraphQL server running on http://localhost:${PORT}/graphql in ${process.env.NODE_ENV} mode!`
    );
});
