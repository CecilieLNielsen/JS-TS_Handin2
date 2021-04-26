import { Router } from "express"
const router = Router();
import { ApiError } from "../errors/errors"
import FriendFacade from "../facades/friendFacade"
const debug = require("debug")("friend-routes")

let facade: FriendFacade;

// Initialize facade using the database set on the application object
router.use(async (req, res, next) => {
  if (!facade) {
    const db = req.app.get("db") // DB sat ind som et globalt objekt på vores app-objekt
    debug("Database used: " + req.app.get("db-type")) // fungerer både i udvikling, produktion og med testserver
    facade = new FriendFacade(db)
  }
  next()
})

// This does NOT require authentication in order to let new users create themself
router.post('/', async function (req, res, next) {
  try {
    let newFriend = req.body;
    const addedFriend = await facade.createFriendV2(newFriend)
    res.json({ addedFriend })
  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      next(err)
    } else {
      next(new ApiError(err.message, 400));
    }
  }
})

router.get("/all", async (req: any, res) => {
  const friends = await facade.getAllFriendsV2();
  const friendsDTO = friends.map(friend => {
    const { firstName, lastName, email } = friend
    return { firstName, lastName, email }
  })
  res.json(friendsDTO);
})

router.put('/:email', async function (req: any, res, next) {
  try {
    const email = req.params.email; //GET THE USERS EMAIL FROM SOMEWHERE (req.params OR req.credentials.userName)
    let newFriend = req.body;
    const result = await facade.editFriendV2(email, newFriend);
    res.json(result);
  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})

router.get("/find-user/:email", async (req: any, res, next) => {
  const userId = req.params.userid;
  try {
    const userEmail = req.params.email;
    const friend = await facade.getFriendFromEmail(userEmail);
    if (friend == null) {
      throw new ApiError("user not found", 404)
    }
    const { firstName, lastName, email } = friend;
    const friendDTO = { firstName, lastName, email }
    res.json(friendDTO);
  } catch (err) {
    debug(err)
    if (err instanceof ApiError) {
      return next(err)
    }
    next(new ApiError(err.message, 400));
  }
})

export default router