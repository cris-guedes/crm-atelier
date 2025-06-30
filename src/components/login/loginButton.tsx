"use client";

import { ButtonWithIcon } from "../Common/Button/WithIcon";
import { GoogleIcon } from "../Common/Icons";
import { Button } from "../ui/button";


type Props = React.ComponentProps<typeof Button> & {};
export default function LoginButton(rest: Props) {
  return (
    <ButtonWithIcon {...rest} icon={<GoogleIcon />}>
      Login With Google
    </ButtonWithIcon>
  );
}
