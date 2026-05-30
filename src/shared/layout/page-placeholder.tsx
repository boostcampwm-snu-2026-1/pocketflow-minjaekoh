type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <p className="text-sm text-muted-foreground">Pocketflow</p>
      <h1 className="mt-3 text-2xl font-bold">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
