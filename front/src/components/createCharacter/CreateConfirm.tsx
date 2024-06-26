import tw from "tailwind-styled-components";
import CommonButton from "@/components/common/CommonButton";
import CommonInput from "@/components/common/CommonInput";
import { UseMutateFunction } from "@tanstack/react-query";

interface IProps {
  setProcess: React.Dispatch<React.SetStateAction<number>>;
  faceUrl: string;
  createdName: string;
  setCreatedName: React.Dispatch<React.SetStateAction<string>>;
  createCharacter: UseMutateFunction<{ characterId: number }, Error, { body: string }, unknown>;
}

export default function CreateConfirm({
  faceUrl,
  createdName,
  setCreatedName,
  createCharacter,
}: IProps) {
  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCreatedName(e.target.value);
  };

  const handleCreateCharacter = () => {
    createCharacter({
      body: JSON.stringify({ faceUrl, name: createdName }),
    });
  };

  return (
    <Wrapper>
      <ImgContainer>
        <CreatedImg src={faceUrl} />
      </ImgContainer>
      <Content>
        <DesktopTitle>
          <Title>캐릭터가 생성되었어요.</Title>
          <Title>캐릭터의 이름을 지어주세요.</Title>
        </DesktopTitle>
        <ButtonContainer>
          <PromptContainer>
            <CommonInput
              props={{ placeholder: "캐릭터 이름", value: createdName, onChange: onChangeName }}
            />
          </PromptContainer>
          <CommonButton title={"확인"} onClick={handleCreateCharacter} />
        </ButtonContainer>
      </Content>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-full
flex
flex-col
lg:flex-row
lg:space-x-32
justify-center
items-center
`;

const ImgContainer = tw.div`
w-60
h-60
`;

const CreatedImg = tw.img`
scale-125
translate-y-1
w-60
h-60
`;

const Content = tw.div`
flex
flex-col
justify-center
items-center
space-y-4
lg:h-80
`;

const DesktopTitle = tw.div`
flex
flex-col
items-center
space-y-4
`;

const Title = tw.h1`
font-medium
text-3xl
my-4
lg:mb-6
`;

const ButtonContainer = tw.div`
lg:h-72
flex
flex-col
space-y-4
justify-center
items-center
`;

const PromptContainer = tw.div`
py-0
w-72
`;
