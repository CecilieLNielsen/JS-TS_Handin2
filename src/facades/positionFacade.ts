import path from "path"
require('dotenv').config({ path: path.join(__dirname, "..", "..", '.env') })
import { Db, Collection, ObjectID } from "mongodb";
import IPosition from '../interfaces/IPosition'
import FriendsFacade from './friendFacade';
import { DbConnector } from "../config/dbConnector"
import { ApiError } from "../errors/errors";

class PositionFacade {
  db: Db
  positionCollection: Collection
  friendFacade: FriendsFacade;

  constructor(db: Db) {
    this.db = db;
    this.positionCollection = db.collection("positions");
    this.friendFacade = new FriendsFacade(db);
  }

  async addOrUpdatePosition(email: string, longitude: number, latitude: number): Promise<IPosition> {
    const friend = await this.friendFacade.getFriendFromEmail(email)
    const fullName = friend.firstName + " " + friend.lastName 
   // 1) Find friend i Friend Collection (Hvad gør vi med fejl)
    // 2) Lav name ud fra firstName + lastName
 
    // 3) 
    const query = {email}
    const update = {
      $set: {lastUpdated: new Date,
        email:email,
        name: fullName,
        location: {type:"Point", coordinates: [longitude, latitude]}}
    }  //Stort set hele IPosition skal give her
    const options = {upsert:true, returnOriginal: false}
    const result = await this.positionCollection.findOneAndUpdate(query,update,options)
    return result.value;

    
  }

  async findNearbyFriends(email: string, password: string, longitude: number, latitude: number, distance: number): Promise<Array<IPosition>> {
    // Tjek om han findes
    const friend = await this.friendFacade.getFriendFromEmail(email,)
    // Opdater position
    await this.addOrUpdatePosition(email, longitude, latitude);
    
    return this.positionCollection.find({
      email: {$ne:email}, // not equal -> Undtagen sig selv
      location: {
        $near: {
          $geometry: {
             type: "Point" ,
             coordinates: [ longitude , latitude ]
          },
          $maxDistance: distance,
          //$minDistance: 2
        }
      }
   }).toArray()

    
    throw new Error("Not Implemented")
  }

  async getAllPositions(): Promise<Array<IPosition>> {
    return this.positionCollection.find({}).toArray();
  }


}

export default PositionFacade;

async function tester() {
  const client = await DbConnector.connect()
  const db = client.db(process.env.DB_NAME)
  const positionFacade = new PositionFacade(db)
  await positionFacade.addOrUpdatePosition("pp@b.dk", 5, 5)
  process.exit(0)
}

//tester()