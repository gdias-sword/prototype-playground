import type { BodyArea } from './script';
import ankle from './assets/areas/ankle.png';
import back from './assets/areas/back.png';
import elbow from './assets/areas/elbow.png';
import hip from './assets/areas/hip.png';
import knee from './assets/areas/knee.png';
import neck from './assets/areas/neck.png';
import shoulder from './assets/areas/shoulder.png';
import wristHand from './assets/areas/wrist-hand.png';
import shoulderBlade from './assets/regions/shoulder-blade.png';
import upperArm from './assets/regions/upper-arm.png';
import upperChest from './assets/regions/upper-chest.png';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export const AREA_PHOTOS: Record<BodyArea, string> = {
  Neck: assetSrc(neck),
  Shoulder: assetSrc(shoulder),
  Elbow: assetSrc(elbow),
  'Wrist/Hand': assetSrc(wristHand),
  Back: assetSrc(back),
  Hip: assetSrc(hip),
  Knee: assetSrc(knee),
  Ankle: assetSrc(ankle),
};

export const REGION_PHOTOS: Record<string, string> = {
  'Upper chest': assetSrc(upperChest),
  'Shoulder blade': assetSrc(shoulderBlade),
  'Upper arm': assetSrc(upperArm),
};
