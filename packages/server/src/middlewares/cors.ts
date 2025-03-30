import cors from "cors";

export const corsOptions = {
  credentials: true,
  origin: true, // TODO
};

export default cors(corsOptions);
