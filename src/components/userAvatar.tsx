import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const UserAvatar = ({ name }: { name: string }) => {
  return (
    <Avatar className="rounded-md w-7 h-7">
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>
        {name[0]} {name.split(" ")[1][0]}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
