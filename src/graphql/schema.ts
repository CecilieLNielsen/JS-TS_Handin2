import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './resolvers';

const typeDefs = `
    type Friend {
        id: ID
        firstName: String
        lastName: String
        email: String
    }
 
     type Query {
        getAllFriends : [Friend]!
        getFriendFromEmail(email: String): Friend!
       
    }
    input FriendInput {
        firstName: String!
        lastName: String!
        password: String!
        email: String!
    }
    input FriendEditInput {
        firstName: String
        lastName: String
        password: String
        email: String!
    }
    type Mutation {
        createFriend(input: FriendInput): Friend

        editFriend (input: FriendEditInput): Friend

        deleteFriend (friendEmail: String): Friend
       
    }
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export { schema };