import { gql } from "apollo-server-express";

export default gql`
    type Query {
        user: User!
    }

    type Mutation {
        register(email: String!, password: String!): User!
        login(email: String!, password: String!): UserWithToken!
        refreshToken: UserWithToken
    }

    type UserWithToken {
        user: User
        accessToken: String
    }

    type User {
        _id: ID
        email: String
        password: String
        isAdmin: Boolean
        isBanned: Boolean
        createdAt: String
        updatedAt: String
    }
`;
