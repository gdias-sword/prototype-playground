import type { BodyArea } from './script';
import ankle from './assets/areas/ankle.png';
import back from './assets/areas/back.png';
import elbow from './assets/areas/elbow.png';
import hip from './assets/areas/hip.png';
import knee from './assets/areas/knee.png';
import neck from './assets/areas/neck.png';
import shoulder from './assets/areas/shoulder.png';
import wristHand from './assets/areas/wrist-hand.png';
import ankleRegion from './assets/regions/ankle.png';
import buttocks from './assets/regions/buttocks.png';
import calf from './assets/regions/calf.png';
import chest from './assets/regions/chest.png';
import elbowRegion from './assets/regions/elbow.png';
import foot from './assets/regions/foot.png';
import forearm from './assets/regions/forearm.png';
import groin from './assets/regions/groin.png';
import hand from './assets/regions/hand.png';
import hipRegion from './assets/regions/hip.png';
import kneeRegion from './assets/regions/knee.png';
import lowerBack from './assets/regions/lower-back.png';
import middleBack from './assets/regions/middle-back.png';
import neckRegion from './assets/regions/neck.png';
import shin from './assets/regions/shin.png';
import shoulderRegion from './assets/regions/shoulder.png';
import thigh from './assets/regions/thigh.png';
import upperArm from './assets/regions/upper-arm.png';
import upperBack from './assets/regions/upper-back.png';
import wrist from './assets/regions/wrist.png';

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
  Neck: assetSrc(neckRegion),
  Chest: assetSrc(chest),
  'Shoulder / Shoulder blade': assetSrc(shoulderRegion),
  'Upper Arm': assetSrc(upperArm),
  'Upper Back': assetSrc(upperBack),
  'Middle Back': assetSrc(middleBack),
  'Lower Back': assetSrc(lowerBack),
  Elbow: assetSrc(elbowRegion),
  Forearm: assetSrc(forearm),
  Wrist: assetSrc(wrist),
  'Hand / Fingers / Thumb': assetSrc(hand),
  'Buttocks / Glutes': assetSrc(buttocks),
  Hip: assetSrc(hipRegion),
  Groin: assetSrc(groin),
  Thigh: assetSrc(thigh),
  Knee: assetSrc(kneeRegion),
  Shin: assetSrc(shin),
  Calf: assetSrc(calf),
  Ankle: assetSrc(ankleRegion),
  'Foot / Heel / Toes': assetSrc(foot),
};
