// /*
//  * Note, da sledeci put ne gubis vreme.
//
//  * Index u Snapshot-u je index crteza koji je poslednji iscrtan. Dakle,
//  * to je crtez koji je obuhvacen snapshotom. Snapshot sadrzi taj index.
//  *
//  * NextStart predstavljla indeks crteza koji treba biti prvi iscrtan u novoj
//  * iteraciji. Dakle, taj crtez ne pripada ni jednom snapshotu.
//  *
//  * Jos jedna stvar NextStart moze da ima vrenost -1. Ne mogu da se setim zasto,
//  * ali mislim da je zbog brisanje pozadine.
//  */
//
// type Index = number & { __brand: "Index" }
// type Pixels = number[] & { __brand: "Pixels" }
//
// type Snapshot = {
//   index: Index
//   pixels: Pixels
// }
//
// export class SnapshotManager {
//   private snapshots: Snapshot[] = []
//   constructor(private snapshotStep = 5) {}
//
//   public save() {
//     // Saving snapshots
//     if (drawingsLength > 0 && drawingsLength % snapshotStep === 0) {
//       const currentIndex = drawingsLength - 1
//       const currentSnapshot = snapshots.at(-1)
//
//       if (
//         currentSnapshot === undefined ||
//         currentSnapshot.index !== currentIndex
//       ) {
//         commitBuffer.loadPixels()
//         snapshots.push({
//           index: currentIndex as Index,
//           pixels: commitBuffer.pixels.slice() as Pixels,
//         })
//       }
//     }
//   }
//
//   public undo() {
//
//       // const undoHappened = nextStart > drawingsLength
//       // if (undoHappened) {
//       //   let currentSnapshot: Snapshot | null = null
//       //
//       //   for (let i = snapshots.length - 1; i >= 0; i--) {
//       //     if (snapshots[i].index >= drawingsLength) {
//       //       snapshots.pop()
//       //     } else {
//       //       currentSnapshot = snapshots[i]
//       //       break
//       //     }
//       //   }
//       //
//       //   // console.log("Novi aktuelni snapshot je: ", currentSnapshot)
//       //
//       //   if (currentSnapshot) {
//       //     commitBuffer.loadPixels()
//       //     for (let i = 0; i < currentSnapshot.pixels.length; i++)
//       //       commitBuffer.pixels[i] = currentSnapshot.pixels[i]
//       //     commitBuffer.updatePixels()
//       //
//       //     nextStart = currentSnapshot.index + 1
//       //   } else {
//       //     nextStart = -1
//       //   }
//       //
//       //   // console.log("NextStart je sada: ", nextStart)
//       // }
//   }
// }
