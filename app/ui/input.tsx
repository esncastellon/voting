export default function Input({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-2 rounded-md">
        <div className="relative">
          {children}
          {icon}
        </div>
      </div>
    </div>
  );
}
