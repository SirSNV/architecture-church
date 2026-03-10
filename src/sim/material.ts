export interface StoneMaterial {
  compression: number;
  tension: number;
  shear: number;
  bucklingSensitivity: number;
}

export const STONE: StoneMaterial = {
  compression: 1.0,
  tension: 0.15,
  shear: 0.45,
  bucklingSensitivity: 0.55
};
