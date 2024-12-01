import { atom } from "recoil";

export const codeState = atom({
  key: "codeState",
  default: "",
});

export const socketState = atom({
  key: "socketState",
  default: null,
});

export const colorState = atom({
  key: "colorState",
  default: "black",
});

export const numPlayersState = atom({
  key: "numPlayersState",
  default: 1,
});

export const maxPlayersState = atom({
  key: "maxPlayersState",
  default: 4,
});

export const publicKeyState = atom({
  key: "publicKeyState",
  default: "",
});
