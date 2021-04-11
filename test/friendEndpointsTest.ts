import path from "path";
import { expect } from "chai"
import app from "../src/app"

import supertest from "supertest"
const request = supertest(app)

import bcryptjs from "bcryptjs"
import * as mongo from "mongodb"
import { InMemoryDbConnector } from "../src/config/dbConnector"
let friendCollection: mongo.Collection;

describe("## Describe the Friend Endpoints (/api/friends) ##", () => {
  let URL: string;

  before("# Before all #", async () => {
    const connection = await InMemoryDbConnector.connect(); //Connect to IN-MEMORY test database
    const db = connection.db();
    app.set("db", db); //Get the database and set it on the app-object to make it availabe for the friendRoutes
    app.set("db-type", "TEST-DB");
    friendCollection = db.collection("friends"); //Initialize friendCollection, to operate on the database without the facade
  })

  beforeEach("# Before each #", async () => {
    const hashedPW = await bcryptjs.hash("secret", 8);
    await friendCollection.deleteMany({});
    await friendCollection.insertMany([
      { firstName: "Anne", lastName: "Green", email: "AnneGreen@gmail.com", password: hashedPW },
      { firstName: "Jonas", lastName: "Green", email: "JonasGreen@gmail.com", password: hashedPW }
    ]);
  })

  describe("While attempting to add a user", () => {
    it("It should add the user Jan Olsen", async () => {
      const newFriend = { firstName: "Jan", lastName: "Olsen", email: "JanOlsen@gmail.com", password: "secret" }
      const response = await request.post('/api/friends').send(newFriend)
      expect(response.status).to.equal(200)
      expect(response.body.id).to.be.not.null
    })

    it("It should fail to add user due to wrong password length", async () => {
      const newFriend = { firstName: "Kalle", lastName: "Hansen", email: "KalleHansen@gmail.com", password: "bad" }
      const response = await request.post('/api/friends').send(newFriend)
      expect(response.status).to.equal(400)
    })
  })

  describe("While attempting to edit a user", () => {
    it("It should edit the user Jonas Green", async () => {
      const email = "JonasGreen@gmail.com";
      const newFirstName = { firstName: "Jannick", lastName: "Green", email, password: "secret" }
      const response = await request.put('/api/friends/' + email).send(newFirstName)
      expect(response.status).to.equal(200)
      expect(response.body.modifiedCount).to.be.equal(1)
    })

    it("It should fail to edit user due to wrong password length", async () => {
      const email = "JonasGreen@gmail.com";
      const newPassword = { firstName: "Jonas", lastName: "Green", email, password: "bad" }
      const response = await request.put('/api/friends/' + email).send(newPassword)
      expect(response.status).to.equal(400)
    })
  })

  describe("While attempting to retrieve all users", () => {
    it("It should retrieve two users", async () => {
      const response = await request.get('/api/friends/all').send()
      expect(response.status).to.equal(200)
      expect(response.body.friendsDTO).to.have.lengthOf(2)
    })
  })

  describe("While attempting to retrieve a user", () => {
    it("It should retrieve the user Jonas Green", async () => {
      const user = { firstName: "Jonas", lastName: "Green", email: "JonasGreen@gmail.com" };
      const response = await request.get('/api/friends/find-user/' + user.email).send()
      expect(response.status).to.equal(200)
      expect(response.body.friendDTO).to.deep.equal(user)
    })

    it("It should fail to retrieve the user due to an invalid email", async () => {
      const invalidEmail = "InvalidEmail@gmail.com";
      const response = await request.get('/api/friends/find-user/' + invalidEmail).send()
      expect(response.status).to.equal(400)
    })
  })
})