'use client';

import { cn } from '@/design/utils';
import { useState } from 'react';
import ankle from './assets/condition-ankle.png';
import back from './assets/condition-back.png';
import elbow from './assets/condition-elbow.png';
import hip from './assets/condition-hip.png';
import knee from './assets/condition-knee.png';
import neck from './assets/condition-neck.png';
import shoulder from './assets/condition-shoulder.png';
import wrist from './assets/condition-wrist.png';
import { assetSrc, Container, ProgressBar, SubHeader } from './shell';

export const CONDITIONS = [
  { label: 'Neck', image: neck },
  { label: 'Shoulder', image: shoulder },
  { label: 'Elbow', image: elbow },
  { label: 'Wrist/Hand', image: wrist },
  { label: 'Back', image: back },
  { label: 'Hip', image: hip },
  { label: 'Knee', image: knee },
  { label: 'Ankle/Foot', image: ankle },
];

export function ConditionSelection({
  condition,
  onConditionChange,
}: {
  condition: string;
  onConditionChange: (value: string) => void;
}) {
  return (
    <Container
      header={
        <>
          <ProgressBar total={5} current={0} />
          <SubHeader
            title="Choose the one body area you'd like to address right away."
            description="If you're experiencing pain in more than one area, you can start another program later to focus on a different body area."
          />
        </>
      }
    >
      <div role="radiogroup" className="grid gap-4 sm:grid-cols-2">
        {CONDITIONS.map((item) => {
          const isSelected = item.label === condition;
          return (
            <button
              key={item.label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onConditionChange(item.label)}
              className={cn(
                'flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-4 text-left text-[16px] leading-[22px] font-medium tracking-[0.2px] transition-[border-color,box-shadow]',
                isSelected
                  ? 'border-[#4a89e8] shadow-[inset_0_0_0_1px_#4a89e8]'
                  : 'border-[#c2c2c2] hover:border-[#8f8f8f]',
              )}
            >
              <img
                alt=""
                src={assetSrc(item.image)}
                className="size-[72px] shrink-0 rounded-2xl bg-[#fafafa] object-cover"
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </Container>
  );
}

export function ConditionFocus({
  condition,
  firstName,
}: {
  condition: string;
  firstName: string;
}) {
  return (
    <Container
      header={
        <>
          <ProgressBar total={3} current={0} />
          <SubHeader
            title={
              <span className="text-[32px] leading-10 lg:text-[40px] lg:leading-[50px]">
                Let's focus on your{' '}
                <strong className="font-semibold">
                  {condition.toLowerCase().replace('/', ' and ')}
                </strong>
                , {firstName}.
              </span>
            }
            description="Next, we'll ask some clinical questions to focus on your needs and health goals. Your responses will be kept private."
          />
        </>
      }
    />
  );
}

export function ConditionQuestion({ condition }: { condition: string }) {
  const [answer, setAnswer] = useState('');
  return (
    <Container
      header={
        <>
          <ProgressBar total={3} current={0} />
          <SubHeader
            title={`Is your movement restricted while bending or twisting your ${condition.toLowerCase().split('/')[0]}?`}
          />
        </>
      }
    >
      <div role="radiogroup" className="flex flex-col gap-4">
        {['Yes', 'No'].map((option) => {
          const isSelected = option === answer;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setAnswer(option)}
              className={cn(
                'flex h-[62px] cursor-pointer items-center rounded-2xl border bg-white px-4 text-left text-[14px] leading-5 font-medium tracking-[0.2px] transition-[border-color,box-shadow]',
                isSelected
                  ? 'border-[#4a89e8] shadow-[inset_0_0_0_1px_#4a89e8]'
                  : 'border-[#c2c2c2] hover:border-[#8f8f8f]',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </Container>
  );
}
