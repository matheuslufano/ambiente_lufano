import type { PetAction, PetSceneId } from "../../types/pet";
// No broken requests: the vector fallback stays active until real PNGs are present.
const poses = import.meta.glob<string>("./*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const rooms = import.meta.glob<string>("../backgrounds/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const objects = import.meta.glob<string>("../items/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const accessories = import.meta.glob<string>("../accessories/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
export function petImage(action: PetAction) {
  return poses[`./${action}.png`] || poses["./idle.png"] || null;
}
export function hasPetPose(action: PetAction) {
  return !!poses[`./${action}.png`];
}
export function sceneImage(scene: PetSceneId) {
  return rooms[`../backgrounds/${scene}.png`] || null;
}
export function accessoryImage(id: string | null) {
  return id ? accessories[`../accessories/${id}.png`] || null : null;
}
export function itemImage(id: string) {
  return objects[`../items/${id}.png`] || null;
}
