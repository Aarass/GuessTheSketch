import cors from "cors";

export const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5173"],
};

export default cors(corsOptions);
