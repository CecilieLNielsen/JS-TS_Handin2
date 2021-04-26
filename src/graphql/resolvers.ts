import FriendFacade from '../facades/friendFacade';
import { IFriend } from '../interfaces/IFriend';
import { ApiError } from '../errors/errors';
import { Request } from "express";
//import fetch from "node-fetch"



let friendFacade: FriendFacade;

/*
We don't have access to app or the Router so we need to set up the facade in another way
In www.ts IMPORT and CALL the method below, like so: 
      setupFacade(db);
Just before the line where you start the server
*/
export function setupFacade(db: any) {
  if (!friendFacade) {
    friendFacade = new FriendFacade(db)
  }
}

// resolver map
export const resolvers = {
  Query: {

    getAllFriends: (root: any, _: any, context: any) => {
      return friendFacade.getAllFriendsV2()
    },
    getFriendFromEmail: (root: any, _: any, context: any) => {
      return friendFacade.getFriendFromEmail(context.email)
    },

  },
  Mutation: {
    createFriend: async (_: object, { input }: { input: IFriend }) => {
      return friendFacade.createFriendV2(input) 
    },
    editFriend: async (_: object, { email, friend }: { email: string, friend: IFriend }) => {
      return friendFacade.editFriendV2(email, friend) 
  },
    deleteFriend: async (_: object, { friendEmail }: { friendEmail: string }) => { 
    return friendFacade.deleteFriend(friendEmail)
  },
}
};
