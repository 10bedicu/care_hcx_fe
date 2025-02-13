type PageProps = {
  children: React.ReactNode;

  title?: string;
};

export default function Page({ children, title }: PageProps) {
  return (
    <div className="flex flex-col gap-6">
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
}
