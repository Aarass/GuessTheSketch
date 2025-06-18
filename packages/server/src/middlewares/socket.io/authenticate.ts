import type { Session, SessionData } from "express-session";
import type { ExtendedError, Socket } from "socket.io";
//
// function reload(
//   session: Session & SessionData,
// ): Promise<Session & SessionData> {
//   return new Promise((resolve, reject) => {
//     session.reload((err) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(session);
//       }
//     });
//   });
// }
//
// (async () => {
//   for (let i = 0; i < 10; i++) {
//     try {
//       const res = await reload(session);
//       console.log(`Success: ${JSON.stringify(res)}`);
//       return;
//     } catch (err) {
//       console.error(`session reload error ${err}`);
//
//       await new Promise((resolve) => {
//         setTimeout(resolve, 1000);
//       });
//     }
//   }
// })();

export function authenticate(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  console.warn(`authenticate ${socket.nsp.name}`);
  const session = socket.request.session;

  //eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (session && session.userId) {
    console.log(`socket session okay`);
    next();
  } else {
    const err = new Error(`socket session not okay`);
    console.error(err);
    next(err);
  }
}
