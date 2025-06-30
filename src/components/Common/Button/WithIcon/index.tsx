import { Button } from "@/components/ui/button";


type Props = React.ComponentProps<typeof Button> & {
  icon: React.ReactNode;
  children: React.ReactNode;
};
export function ButtonWithIcon({ children, icon, ...rest }: Props) {
  return (
    <Button {...rest}>
      {icon}
      {children}
    </Button>
  );
}
