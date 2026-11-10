import { db } from "../lib/db";
import type { MockExam, StudySession } from "../types";
import type { PetRecord, PetSceneId, RewardRules } from "../types/pet";
import {
  defaultRewardRules,
  intervalSeconds,
  mergeIntervals,
  petLevel,
  secondsByDay,
  sessionIntervals,
  timeReward,
  validRewardRules,
} from "./rewardService";
export const foods = [
  {
    id: "sandwich",
    name: "Sanduíche",
    price: 35,
    hunger: 50,
    energy: 20,
    level: 2,
  },
  { id: "fish", name: "Peixe", price: 20, hunger: 35, energy: 10, level: 1 },
  { id: "fruit", name: "Frutinha", price: 10, hunger: 18, energy: 5, level: 1 },
  { id: "milk", name: "Leite", price: 15, hunger: 20, energy: 10, level: 1 },
  { id: "juice", name: "Suco", price: 18, hunger: 18, energy: 15, level: 1 },
  {
    id: "special",
    name: "Comida especial",
    price: 60,
    hunger: 80,
    energy: 30,
    level: 3,
  },
] as const;
export const accessories = [
  { id: "glasses", name: "Óculos de leitura", price: 40, level: 1 },
  { id: "headphones", name: "Fones de ouvido", price: 60, level: 2 },
  { id: "graduation", name: "Chapéu de formatura", price: 100, level: 3 },
  { id: "bow", name: "Laço colorido", price: 25, level: 1 },
  { id: "flower", name: "Flor no pelo", price: 30, level: 1 },
  { id: "scarf", name: "Cachecol quentinho", price: 55, level: 2 },
  { id: "crown", name: "Coroa brilhante", price: 120, level: 3 },
  { id: "cape", name: "Capa de heroína", price: 160, level: 4 },
  { id: "beret", name: "Boina charmosa", price: 45, level: 1 },
  { id: "bandana", name: "Bandana de aventura", price: 50, level: 2 },
  { id: "backpack", name: "Mochila de exploradora", price: 85, level: 2 },
  { id: "halo", name: "Auréola brilhante", price: 110, level: 3 },
  { id: "bowtie", name: "Gravata borboleta", price: 35, level: 1 },
] as const;
export const scenes = [
  { id: "bedroom", name: "Quarto", minutes: 0, level: 1 },
  { id: "study-room", name: "Sala de estudos", minutes: 25, level: 1 },
  { id: "library", name: "Biblioteca", minutes: 120, level: 1 },
  { id: "garden", name: "Jardim", minutes: 0, level: 3 },
] as const;
export function initialPet(now = Date.now()): PetRecord {
  return {
    id: "lufi",
    name: "Lufi",
    coins: 0,
    xp: 0,
    hunger: 80,
    happiness: 80,
    energy: 80,
    updatedAt: now,
    scene: "bedroom",
    owned: [],
    equipped: null,
    rewardedIntervals: [],
    rewardedQuestions: 0,
    dailyGoals: {},
    lastPlayAt: 0,
    restingSince: null,
    rules: { ...defaultRewardRules },
  };
}
export function timedVitals(pet: PetRecord, now = Date.now()): PetRecord {
  const hours = Math.max(0, now - pet.updatedAt) / 3600000;
  return {
    ...pet,
    hunger: Math.max(0, pet.hunger - hours * 2),
    happiness: Math.max(20, pet.happiness - hours),
    energy: Math.min(
      100,
      Math.max(
        0,
        pet.energy -
          hours +
          (pet.restingSince
            ? (Math.max(0, now - Math.max(pet.restingSince, pet.updatedAt)) /
                60000) *
              2
            : 0),
      ),
    ),
    updatedAt: now,
  };
}
export function sceneUnlocked(pet: PetRecord, id: PetSceneId) {
  const scene = scenes.find((s) => s.id === id)!;
  return (
    petLevel(pet.xp).level >= scene.level &&
    intervalSeconds(pet.rewardedIntervals) >= scene.minutes * 60
  );
}
async function updatePet(update: (pet: PetRecord) => PetRecord) {
  return db.transaction("rw", db.petStates, async () => {
    const pet = timedVitals((await db.petStates.get("lufi")) || initialPet());
    const next = update(pet);
    await db.petStates.put(next);
    return next;
  });
}
export async function ensurePet() {
  await db.transaction("rw", db.petStates, async () => {
    if (!(await db.petStates.get("lufi"))) await db.petStates.add(initialPet());
  });
}
/** Read/ledger/update share one IndexedDB transaction, serializing concurrent browser tabs. */
export async function claimStudyReward(
  session: StudySession,
  dailyHours: number,
) {
  if (
    !session.summary.trim() ||
    !Number.isFinite(session.duration) ||
    session.duration < 0 ||
    !Number.isSafeInteger(session.questions) ||
    session.questions < 0 ||
    !Number.isSafeInteger(session.correct) ||
    session.correct < 0 ||
    session.correct > session.questions
  )
    return;
  return db.transaction("rw", db.petStates, db.petRewards, async () => {
    const id = `study:${session.id}`;
    if (await db.petRewards.get(id)) return;
    let pet = timedVitals((await db.petStates.get("lufi")) || initialPet());
    const before = intervalSeconds(pet.rewardedIntervals);
    const intervals = mergeIntervals([
      ...pet.rewardedIntervals,
      ...sessionIntervals(session),
    ]);
    const after = intervalSeconds(intervals),
      validSeconds = after - before;
    const eligibleQuestions =
      session.duration > 0
        ? Math.floor(
            session.questions * Math.min(1, validSeconds / session.duration),
          )
        : 0;
    const xp = Math.max(
      0,
      timeReward(after, pet.rules) - timeReward(before, pet.rules),
    );
    const questionCoins =
      (Math.floor((pet.rewardedQuestions + eligibleQuestions) / 10) -
        Math.floor(pet.rewardedQuestions / 10)) *
      pet.rules.questions10;
    pet = {
      ...pet,
      rewardedIntervals: intervals,
      rewardedQuestions: pet.rewardedQuestions + eligibleQuestions,
      coins: pet.coins + xp + questionCoins,
      energy: Math.min(100, pet.energy + validSeconds / 600),
      xp: pet.xp + xp,
      restingSince: null,
    };
    await db.petRewards.add({
      id,
      kind: "study",
      date: new Date().toISOString(),
      coins: xp + questionCoins,
      xp,
      validSeconds,
      message: `${Math.floor(validSeconds / 60)} min válidos de estudo juntos`,
    });
    const days = secondsByDay(intervals);
    for (const [day, seconds] of Object.entries(days)) {
      const target = pet.dailyGoals[day] ?? Math.max(0.5, dailyHours) * 3600;
      pet.dailyGoals[day] = target;
      if (seconds >= target && !(await db.petRewards.get(`daily:${day}`))) {
        pet.coins += pet.rules.dailyGoal;
        await db.petRewards.add({
          id: `daily:${day}`,
          kind: "daily",
          date: new Date().toISOString(),
          coins: pet.rules.dailyGoal,
          xp: 0,
          validSeconds: 0,
          message: `Meta de ${day} alcançada`,
        });
      }
    }
    await db.petStates.put(pet);
  });
}
export async function claimMockReward(exam: MockExam) {
  if (
    !exam.title.trim() ||
    !Number.isSafeInteger(exam.total) ||
    !Number.isSafeInteger(exam.correct) ||
    exam.total < 1 ||
    exam.correct < 0 ||
    exam.correct > exam.total
  )
    return;
  await db.transaction("rw", db.petStates, db.petRewards, async () => {
    const id = `mock:${exam.id}`;
    if (await db.petRewards.get(id)) return;
    const pet = timedVitals((await db.petStates.get("lufi")) || initialPet());
    await db.petRewards.add({
      id,
      kind: "mock",
      date: new Date().toISOString(),
      coins: pet.rules.mockExam,
      xp: 0,
      validSeconds: 0,
      message: `Simulado: ${exam.title}`,
    });
    await db.petStates.put({ ...pet, coins: pet.coins + pet.rules.mockExam });
  });
}
export async function feedPet(foodId: string) {
  return updatePet((pet) => {
    const food = foods.find((item) => item.id === foodId);
    if (!food) throw new Error("Alimento não encontrado.");
    if (petLevel(pet.xp).level < food.level)
      throw new Error(`Disponível no nível ${food.level}.`);
    if (pet.coins < food.price)
      throw new Error("Estude para conquistar mais moedas.");
    return {
      ...pet,
      coins: pet.coins - food.price,
      hunger: Math.min(100, pet.hunger + food.hunger),
      energy: Math.min(100, pet.energy + food.energy),
      happiness: Math.min(100, pet.happiness + 5),
    };
  });
}
export async function playWithPet() {
  return updatePet((pet) => {
    if (Date.now() - pet.lastPlayAt < 60000)
      throw new Error("Vamos brincar de novo em um minutinho.");
    if (pet.energy < 8)
      throw new Error("Um descanso vai ajudar a recuperar a energia.");
    return {
      ...pet,
      energy: pet.energy - 8,
      happiness: Math.min(100, pet.happiness + 15),
      lastPlayAt: Date.now(),
      restingSince: null,
    };
  });
}
export async function petAffection() {
  return updatePet((pet) => ({
    ...pet,
    happiness: Math.min(100, pet.happiness + 1),
  }));
}
export async function restPet() {
  return updatePet((pet) => ({
    ...pet,
    restingSince: pet.restingSince ? null : Date.now(),
  }));
}
export async function wakePet() {
  return updatePet((pet) => ({ ...pet, restingSince: null }));
}
export async function selectPetScene(scene: PetSceneId) {
  return updatePet((pet) => {
    if (!sceneUnlocked(pet, scene))
      throw new Error(
        "Este ambiente ainda está bloqueado. Veja a meta indicada.",
      );
    return { ...pet, scene };
  });
}
export async function buyOrEquipAccessory(id: string) {
  return updatePet((pet) => {
    const item = accessories.find((a) => a.id === id);
    if (!item) throw new Error("Acessório não encontrado.");
    if (pet.owned.includes(id))
      return { ...pet, equipped: pet.equipped === id ? null : id };
    if (petLevel(pet.xp).level < item.level)
      throw new Error(`Disponível no nível ${item.level}.`);
    if (pet.coins < item.price)
      throw new Error("Moedas insuficientes. Continue estudando com a Lufi.");
    return {
      ...pet,
      coins: pet.coins - item.price,
      owned: [...pet.owned, id],
      equipped: id,
    };
  });
}
export async function configurePet(name: string, rules: RewardRules) {
  if (!name.trim() || name.length > 30 || !validRewardRules(rules))
    throw new Error(
      "Use um nome de até 30 caracteres e recompensas crescentes válidas.",
    );
  return updatePet((pet) => ({
    ...pet,
    name: name.trim(),
    rules: { ...rules },
  }));
}
