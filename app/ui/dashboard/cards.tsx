import { UserGroupIcon } from "@heroicons/react/24/outline";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import { lato } from "@/app/ui/fonts";
import { fetchCardData } from "@/app/lib/survey/data";

const iconMap = {
  surveys: PollOutlinedIcon,
  assemblies: MeetingRoomOutlinedIcon,
  members: UserGroupIcon,
  collaborators: UserGroupIcon,
};

export default async function CardWrapper() {
  const {
    numberOfSurveys,
    numberOfAssemblies,
    numberOfMembers,
    numberOfCollaborators,
  } = await fetchCardData();
  return (
    <>
      <Card title="Votaciones activas" value={numberOfSurveys} type="surveys" />
      <Card
        title="Asambleas futuras"
        value={numberOfAssemblies}
        type="assemblies"
      />
      <Card title="Total Miembros" value={numberOfMembers} type="members" />
      <Card
        title="Total Colaboradores"
        value={numberOfCollaborators}
        type="collaborators"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: "surveys" | "assemblies" | "members" | "collaborators";
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lato.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
