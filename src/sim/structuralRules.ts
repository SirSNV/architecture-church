import { STONE } from './material';
import { ForceLevel } from '../types';

export const classify = (v: number): ForceLevel => {
  if (v < 0.33) return 'low';
  if (v < 0.66) return 'medium';
  return 'high';
};

export const forceColor = (level: ForceLevel): number => {
  if (level === 'low') return 0x4caf50;
  if (level === 'medium') return 0xffc107;
  return 0xf44336;
};

export const beamRisk = (span: number, depth: number) => {
  const slenderness = span / Math.max(depth, 0.2);
  const tensionDemand = Math.min(1, slenderness / 16);
  return {
    tensionDemand,
    level: classify(tensionDemand / STONE.tension)
  };
};

export const columnRisk = (height: number, thickness: number) => {
  const bucklingIndex = Math.min(1, (height / Math.max(thickness, 0.2)) / 18);
  return {
    bucklingIndex,
    level: classify(bucklingIndex / STONE.bucklingSensitivity)
  };
};

export const archThrust = (span: number, rise: number) => {
  const thrust = Math.min(1, span / Math.max(rise * 3, 0.5));
  return { thrust, level: classify(thrust) };
};

export const vaultThrust = (span: number, thickness: number) => {
  const thrust = Math.min(1, (span / 8) * (1.2 - thickness));
  return { thrust, level: classify(Math.max(0, thrust)) };
};

export const domeThrust = (radius: number, drumHeight: number, supportFactor: number) => {
  const base = Math.min(1, radius / Math.max(2 + drumHeight, 0.5));
  const effective = Math.max(0, base * (1.1 - supportFactor));
  return { thrust: effective, level: classify(effective) };
};

export const buttressRelief = (thrust: number, buttressMass: number) => {
  const reduction = Math.min(0.85, buttressMass * 0.12);
  const remaining = Math.max(0, thrust * (1 - reduction));
  return { remaining, level: classify(remaining) };
};
