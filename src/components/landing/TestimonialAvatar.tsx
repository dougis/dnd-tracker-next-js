interface TestimonialAvatarProps {
  name: string;
  title: string;
}

export function TestimonialAvatar({ name, title }: TestimonialAvatarProps) {
  return (
    <div className="flex items-center">
      <div
        className="w-10 h-10 bg-primary/10 rounded-full mr-3"
        data-testid="testimonial-avatar"
      ></div>
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </div>
    </div>
  );
}
