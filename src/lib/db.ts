import Dexie, { type EntityTable } from "dexie";
import type { AudioNote, VisualAsset } from "../types";
import type { PetRecord, PetReward } from "../types/pet";
export const db = new Dexie("lufano-offline") as Dexie & {
  audioNotes: EntityTable<AudioNote, "id">;
  visualAssets: EntityTable<VisualAsset, "id">;
  petStates: EntityTable<PetRecord, "id">;
  petRewards: EntityTable<PetReward, "id">;
};
db.version(1).stores({ audioNotes: "id,subjectId,date" });
db.version(2).stores({ audioNotes: "id,subjectId,date", visualAssets: "id" });
db.version(3).stores({
  audioNotes: "id,subjectId,date",
  visualAssets: "id",
  petStates: "id",
  petRewards: "id,date,kind",
});
