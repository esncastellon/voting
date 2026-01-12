export default function TextInput({
  id,
  name,
  type,
  placeholder,
  required = true,
  value = "",
}: {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  value?: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
      required={required}
      value={value}
    />
  );
}
