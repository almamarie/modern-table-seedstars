import { STATUS } from "../enum";

const statusBackgroundColors = {
  [STATUS.REJECTED]: "bg-[#FFEDEF]",
  [STATUS.ACCEPTED]: "bg-[#E1FCEF]",
  [STATUS.PENDING]: "bg-gray-50",
};

const statusTextColors = {
  [STATUS.REJECTED]: "text-[#D1293D]",
  [STATUS.ACCEPTED]: "text-[#14804A]",
  [STATUS.PENDING]: "text-gray-600",
};

const statusDotBackgroundColors = {
  [STATUS.REJECTED]: "bg-[#D1293D]",
  [STATUS.ACCEPTED]: "bg-[#14804A]",
  [STATUS.PENDING]: "bg-gray-600",
};

const statusLabels = {
  [STATUS.REJECTED]: "Rejected",
  [STATUS.ACCEPTED]: "Accepted",
  [STATUS.PENDING]: "Pending",
};

const ApplicationStatus = ({
  status,
}: {
  status: STATUS.REJECTED | STATUS.ACCEPTED | STATUS.PENDING;
}) => {
  return (
    <div
      className={`flex items-center justify-center w-fit h-6 px-3 gap-2 rounded-sm text-sm font-normal ${statusBackgroundColors[status]} ${statusTextColors[status]}`}
    >
      <div
        className={`w-2 h-2 rounded-[2px] ${statusDotBackgroundColors[status]}`}
      />
      {statusLabels[status]}
    </div>
  );
};

export default ApplicationStatus;
