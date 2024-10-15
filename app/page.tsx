import PlantIdentifier from '@/components/PlantIdentifier';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-top p-24 bg-neutral-950 text-foreground">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">🌱 Plant Identifier</h1>
        <PlantIdentifier />
      </div>
    </main>
  );
}