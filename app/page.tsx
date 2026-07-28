import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-start gap-6 p-8">
      <h1 className="text-display-large-strong">
        Relieve pain from the comfort of home
      </h1>
      <Button variant="outline">Get started</Button>
      <Button variant="solid">Get started</Button>
      <Button variant="ghost">Get started</Button>
      <Button variant="link">Get started</Button>
    </div>
  );
}
