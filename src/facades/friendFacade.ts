import { IFriend } from '../interfaces/IFriend';
import { Db, Collection } from "mongodb";
import bcrypt from "bcryptjs";
import { ApiError } from '../errors/errors';
import Joi, { ValidationError } from "joi"

const BCRYPT_ROUNDS = 10;

const USER_INPUT_SCHEMA = Joi.object({
  firstName: Joi.string().min(2).max(40).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(4).max(30).required(),
  email: Joi.string().email().required()
})

class FriendsFacade {
  db: Db
  friendCollection: Collection

  constructor(db: Db) {
    this.db = db;
    this.friendCollection = db.collection("friends");
  }

  /**
   * 
   * @param friend 
   * @throws ApiError if validation fails
   */
  async addFriend(friend: IFriend): Promise<{ id: String }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw }
    const insertedFriend = await this.friendCollection.insertOne(f);
    return insertedFriend.insertedId;
  }

  /**
   * 
   * @param email 
   * @param friend 
   * @throws ApiError if validation fails or friend was not found
   */
  async editFriend(email: string, friend: IFriend): Promise<{ modifiedCount: number }> {
    const status = USER_INPUT_SCHEMA.validate(friend);
    if (status.error) {
      throw new ApiError(status.error.message, 400)
    }
    const hashedpw = await bcrypt.hash(friend.password, BCRYPT_ROUNDS);
    const f = { ...friend, password: hashedpw }

    const filter = { email: email };
    const update = {
      $set: { firstName: f.firstName, lastName: f.lastName, email: f.email, password: f.password, },
    }
    const updatedData = await this.friendCollection.updateOne(filter, update)
    return { modifiedCount: updatedData.modifiedCount };
  }

  /**
   * 
   * @param friendEmail 
   * @returns true if deleted otherwise false
   */
  async deleteFriend(friendEmail: string): Promise<boolean> {
    const result = await this.friendCollection.findOneAndDelete({ email: friendEmail });
    return result.ok === 1; // 1 = true - 0 = false
  }

  /**
   * 
   * @returns Array of IFriend
   */
  async getAllFriends(): Promise<Array<IFriend>> {
    const users: unknown = await this.friendCollection.find({}).toArray();
    return users as Array<IFriend>
  }

  /**
   * 
   * @param friendEmail 
   * @returns IFriend
   * @throws ApiError if not found
   */
  async getFriend(friendEmail: string): Promise<IFriend> {
    return this.friendCollection.findOne({ email: friendEmail });
  }
}

export default FriendsFacade;