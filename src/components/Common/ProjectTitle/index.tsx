import * as S from "./styles";

type Props = any;
export const ProjectTitle = ({ ...rest }: Props) => {
  return (
    <S.Container>
      <S.Title {...rest}>
        <S.Blue className="text-blue-900">Sales.</S.Blue>Assistant
      </S.Title>
    </S.Container>
  );
};
