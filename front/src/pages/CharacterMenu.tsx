import tw from "tailwind-styled-components";
import { BsStars } from "react-icons/bs";
import { HiHeart } from "react-icons/hi";
import { LuBatteryFull } from "react-icons/lu";
import CommonMenuItem from "@/components/common/CommonMenuItem";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { characterDataAtom } from "@/store/character";
import { expHandler, statusHandler } from "@/util/value";
import Loading from "@/components/common/Loading";

export default function CharacterMenu() {
  const navigate = useNavigate();
  const characterData = useRecoilValue(characterDataAtom);

  const onClickLink = (url: string) => {
    return () => {
      navigate(url);
    };
  };

  if (!characterData) return <Loading />;

  return (
    <Wrapper>
      <CharacterContainer>
        <ExpContainer>
          <LevelText>{`LV.${expHandler(characterData.exp).level}`}</LevelText>
          <ExpBarContainer className="text-border">
            <ExpBar
              style={{
                width: `${expHandler(characterData.exp).percentage}%`,
              }}
            />
            <DataText>{`${expHandler(characterData.exp).curExp} / ${
              expHandler(characterData.exp).maxExp
            }`}</DataText>
          </ExpBarContainer>
        </ExpContainer>
        <NameContainer>
          <img
            src={characterData.characterUrl || characterData.faceUrl}
            className="w-36 lg:w-72"
          />
          <Name>{characterData.name}</Name>
          {/* <BirthDate>2024.04.15. 출생</BirthDate> */}
        </NameContainer>
      </CharacterContainer>
      <OtherContainer>
        <StatContainer>
          <StatRow>
            <BatteryIcon />
            <StatLabelText>포만감</StatLabelText>
            <StatBarContainer className="bg-red-400/50 text-border">
              <StatBar
                className="bg-red-500"
                style={{
                  width: `${(
                    (characterData.status.fullness /
                      statusHandler(characterData).fullnessMax) *
                    100
                  ).toFixed(2)}%`,
                }}
              />
              <DataText>{`${characterData.status.fullness} / ${
                statusHandler(characterData).fullnessMax
              }`}</DataText>
            </StatBarContainer>
            <StatLabelText>{`LV.${characterData.stat.fullnessStat}`}</StatLabelText>
          </StatRow>
          <StatRow>
            <HeartIcon />
            <StatLabelText>친밀도</StatLabelText>
            <StatBarContainer className="bg-amber-400/50 text-border">
              <StatBar
                className="bg-amber-500"
                style={{
                  width: `${(
                    (characterData.status.intimacy /
                      statusHandler(characterData).intimacyMax) *
                    100
                  ).toFixed(2)}%`,
                }}
              />
              <DataText>{`${characterData.status.intimacy} / ${
                statusHandler(characterData).intimacyMax
              }`}</DataText>
            </StatBarContainer>
            <StatLabelText>{`LV.${characterData?.stat.intimacyStat}`}</StatLabelText>
          </StatRow>
          <StatRow>
            <ShineIcon />
            <StatLabelText>청결도</StatLabelText>
            <StatBarContainer className="bg-blue-400/50 text-border">
              <StatBar
                className="bg-blue-500"
                style={{
                  width: `${(
                    (characterData.status.cleanness /
                      statusHandler(characterData).cleannessMax) *
                    100
                  ).toFixed(2)}%`,
                }}
              />
              <DataText>{`${characterData.status.cleanness} / ${
                statusHandler(characterData).cleannessMax
              }`}</DataText>
            </StatBarContainer>
            <StatLabelText>{`LV.${characterData.stat.cleannessStat}`}</StatLabelText>
          </StatRow>
        </StatContainer>
        <MenuContainer>
          <CommonMenuItem
            text={"캐릭터 능력치"}
            onClick={onClickLink("/character/stat")}
          />
          <CommonMenuItem
            text={"캐릭터 이름 변경"}
            onClick={onClickLink("/character/rename")}
          />
          <DeleteText>
            캐릭터를 방출하시려면{" "}
            <Link to="/character/delete">
              <DeleteLink>여기</DeleteLink>
            </Link>
            를 눌러주세요.
          </DeleteText>
        </MenuContainer>
      </OtherContainer>
    </Wrapper>
  );
}

const Wrapper = tw.div`
w-full
h-20
flex-grow
flex
flex-col
lg:flex-row
items-center
overflow-y-scroll
`;

const CharacterContainer = tw.div`
w-full
flex
flex-col
items-center
lg:flex-col-reverse
`;

const LevelText = tw.h1`
p-2
w-full
font-bold
`;

const ExpContainer = tw.div`
w-full
max-w-[30rem]
lg:max-w-[35rem]
py-4
px-16
flex
flex-col
items-center
`;

const ExpBarContainer = tw.div`
w-full
h-4
lg:h-6
bg-green-400/50
rounded-lg
shadow-md
flex
justify-center
items-center
relative
border-2
border-slate-500
`;

const ExpBar = tw.div`
absolute
top-0
left-0
bg-green-500
w-3/5
h-full
rounded-lg
`;

const DataText = tw.p`
text-sm
lg:text-base
z-10
text-slate-100
font-bold
`;

const NameContainer = tw.div`
w-full
flex
flex-col
items-center
space-y-2
py-4
`;

const Name = tw.h1`
text-2xl
`;

// const BirthDate = tw.p`
// text-sm
// text-slate-500
// `;

const OtherContainer = tw.div`
w-full
h-full
flex
flex-col
justify-center
lg:space-y-10
`;

const StatContainer = tw.div`
flex
w-full
h-20
lg:h-40
flex-col
items-center
space-y-1
lg:space-y-4
pl-2
py-2
`;

const StatRow = tw.div`
flex
items-center
space-x-2
lg:space-x-8
`;

const StatLabelText = tw.h4`
text-sm
lg:text-lg
`;

const StatBarContainer = tw.div`
w-36
lg:w-96
h-3
lg:h-5
rounded-lg
shadow-md
flex
justify-center
items-center
relative
border-2
border-slate-500
`;

const StatBar = tw.div`
absolute
top-0
left-0
h-full
rounded-lg
`;

const BatteryIcon = tw(LuBatteryFull)`
w-4
h-4
lg:w-8
lg:h-8
`;

const HeartIcon = tw(HiHeart)`
w-4
h-4
lg:w-8
lg:h-8
`;

const ShineIcon = tw(BsStars)`
w-4
h-4
lg:w-8
lg:h-8
`;

const MenuContainer = tw.div`
w-full
p-8
`;

const DeleteText = tw.p`
p-4
text-slate-400
`;

const DeleteLink = tw.span`
underline
cursor-pointer
`;
