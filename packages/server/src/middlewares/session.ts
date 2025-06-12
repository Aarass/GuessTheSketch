import session from "express-session";
import { RedisStore } from "connect-redis";
import { getNewClient } from "../drivers/redis";

const redisStore = new RedisStore({
  client: getNewClient(),
  prefix: "sess_",
});

export default session({
  name: "sessionid",
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  secret: "keyboard cat",
  cookie: {
    secure: false,
    httpOnly: true,
  },
});
