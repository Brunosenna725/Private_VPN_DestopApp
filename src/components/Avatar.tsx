import { UserAvatar } from "@surfskip/api-types";

export const Avatar = (props: {avatar?: UserAvatar, size: number}) => {
  const gender = () => props.avatar?.gender;
  const skinColor = () => props.avatar?.skinColor?.substring(1);
  const hairColor = () => props.avatar?.hairColor?.substring(1);
  
  
  const hair = () => {
    const rawHair = props.avatar?.hair;
    if (rawHair === "OldManHair" && gender() === "Women") return "OldLadyHair";
    return rawHair;

  };

  const age = () =>  {
    const rawAge = props.avatar?.age;
    if (gender() === "Women" && rawAge === "Man") return "Girl";
    if (gender() === "Women" && rawAge === "Boy") return "Female";
    return rawAge;
  };
  
  const avatarUrl = () => !props.avatar ? "assets/black-avatar.webp" :   `assets/avatars/${gender()}-${age()}-${skinColor()}-${hair()}-${hairColor()}.webp`;

  return (
    <img style={{width: `${props.size}px`, height: `${props.size}px`}} class="relative z-22222" src={avatarUrl()} alt="" />
  );
};