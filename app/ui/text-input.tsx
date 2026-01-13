export default function TextInput({
  id,
  name,
  type,
  placeholder,
  required = true,
  defaultValue,
  onChange,
}: {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
      required={required}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  );
}
