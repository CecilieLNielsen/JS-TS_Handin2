import * as mongo from "mongodb"
import FriendFacade from '../src/facades/friendFacade';

import chai from "chai";
const expect = chai.expect;

//use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs from "bcryptjs"
import { InMemoryDbConnector } from "../src/config/dbConnector"
import { ApiError } from "../src/errors/errors";

let friendCollection: mongo.Collection;
let facade: FriendFacade;

describe("## Verify the Friends Facade ##", () => {

  before("# Before all #", async () => {
    const client = await InMemoryDbConnector.connect(); //Connect to inmemory test database
    const db = client.db(); //Get the database
    friendCollection = db.collection("friends"); //Initialize friendCollection, to operate on the database without the facade
    facade = new FriendFacade(db); //Initialize the facade
  })

  beforeEach("# Before each #", async () => {
    const hashedPW = await bcryptjs.hash("secret", 4)
    await friendCollection.deleteMany({})
    await friendCollection.insertMany([ //Create a few few testusers for ALL the tests
      { firstName: "Anne", lastName: "Green", email: "AnneGreen@gmail.com", password: hashedPW },
      { firstName: "Jonas", lastName: "Green", email: "JonasGreen@gmail.com", password: hashedPW }
    ])
  })

  describe("Verify the addFriend method", () => {
    it("It should Add the user Jan", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "jan@b.dk", password: "secret" }
      const status = await facade.createFriendV2(newFriend);
      expect(status).to.be.not.null
      const jan = await friendCollection.findOne({ email: "jan@b.dk" })
      expect(jan.firstName).to.be.equal("Jan")
    })
  })

  describe("Verify the editFriend method", () => {
    it("It should change firstname to Jannick", async () => {
      const newFirstName = { firstName: "Jannick", lastName: "Green", email: "JonasGreen@gmail.com", password: "secret" }
      const status = await facade.editFriendV2("JonasGreen@gmail.com", newFirstName);
      expect(status).to.be.not.null
      const editedFriend = await friendCollection.findOne({ email: "JonasGreen@gmail.com" })
      expect(editedFriend.firstName).to.be.equal("Jannick");
    })
  })
  
  describe("Verify the deleteFriend method", () => {
    it("It should remove the user Jonas", async () => {
      const status = await facade.deleteFriend("JonasGreen@gmail.com");
      expect(status).to.be.true;
    })
    it("It should return false, for a user that does not exist", async () => {
      const status = await facade.deleteFriend("InvalidMail@gmail.com");
      expect(status).to.be.false;
    })
  })

  describe("Verify the getAllFriends method", () => {
    it("It should get two friends", async () => {
      const status = await facade.getAllFriendsV2();
      expect(status).to.have.lengthOf(2);
    })
  })

  describe("Verify the getFriend method", () => {
    it("It should find Anne Green", async () => {
      const status = await facade.getFriendFromEmail("AnneGreen@gmail.com");
      expect(status).to.exist;
    })
    it("It should not find InvalidMail@gmail.com", async () => {
      expect(facade.getFriendFromEmail("InvalidMail@gmail.com")).to.be.rejectedWith(ApiError);
    })
  })
})