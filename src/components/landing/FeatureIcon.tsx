import Image from 'next/image';

interface FeatureIconProps {
  src: string;
  alt: string;
}

export function FeatureIcon({ src, alt }: FeatureIconProps) {
  return (
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
      <Image src={src} alt={alt} width={32} height={32} />
    </div>
  );
}
