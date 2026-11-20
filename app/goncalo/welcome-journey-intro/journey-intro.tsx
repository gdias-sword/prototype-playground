import { KitFinish } from './kit-layouts';
import { Container, Footer, SubHeader } from './shell';

interface JourneyIntroProps {
  firstName: string;
  onContinue: () => void;
}

export function JourneyIntro({ firstName, onContinue }: JourneyIntroProps) {
  return (
    <>
      <Container
        header={
          <SubHeader
            title={
              <>
                Welcome, {firstName}!
                <br />
                Here’s how you’ll get started.
              </>
            }
          />
        }
      >
        <KitFinish />
      </Container>
      <Footer label="Continue" isSolid={false} onContinue={onContinue} />
    </>
  );
}
