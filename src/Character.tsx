import { useState } from "react";
import SkillCheck from "./SkillCheck";
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from "./consts";

interface CharacterProps {
  id: number;
  characterAttributes: { [key: string]: number };
  characterSkillPoints: { [key: string]: number };
  handleAttributeChange: (
    id: number,
    attribute: string,
    increment: boolean
  ) => void;
  handleSkillChange: (id: number, skill: string, increment: boolean) => void;
}

// Define a Character component
const Character: React.FC<CharacterProps> = ({
  id,
  characterAttributes,
  characterSkillPoints,
  handleAttributeChange,
  handleSkillChange,
}) => {
  const [num, setNum] = useState<number>(3);
  const [selectedSkill, setSelectedSkill] = useState<string>(
    SKILL_LIST[0].name
  );
  const [dc, setDc] = useState<number>(10);
  const [skill, setSkill] = useState<string>(SKILL_LIST[0].name);
  const [rollResult, setRollResult] = useState<string | null>(null);

  const totalSkill = () => {
    const skillModifier = getModifier(
      characterAttributes[
        SKILL_LIST.find((skill) => skill.name === selectedSkill)
          ?.attributeModifier || ""
      ]
    );
    return characterSkillPoints[selectedSkill] + skillModifier;
  };

  const getModifier = (attributeValue: number) =>
    Math.floor((attributeValue - 10) / 2);

  const totalPoints = () =>
    10 + 4 * getModifier(characterAttributes["Intelligence"]);

  const pointsSpent = () =>
    Object.values(characterSkillPoints).reduce(
      (acc, points) => acc + points,
      0
    );

  const pointsRemaining = () => totalPoints() - pointsSpent();

  const meetsRequirements = (classRequirements: { [key: string]: number }) => {
    return Object.keys(classRequirements).every(
      (attribute) =>
        characterAttributes[attribute] >= classRequirements[attribute]
    );
  };

  return (
    <div>
      <div>
        <h3>Character {id}</h3>
        <div>
          <h2>Party Skill Check</h2>
          <SkillCheck
            dc={dc}
            party={false}
            characterAttributes={characterAttributes}
            characterSkills={characterSkillPoints}
            onSkillChange={(selectedSkill) => setSkill(selectedSkill)}
            onRollResult={(result) => setRollResult(result)}
          />
          {rollResult && <p>{rollResult}</p>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h4>Attributes</h4>
          {ATTRIBUTE_LIST.map((attribute, index) => (
            <div key={index}>
              <span>{attribute}: </span>
              <span>{characterAttributes[attribute]}</span>
              <span>
                {" "}
                (Modifier:{" "}
                {Math.floor((characterAttributes[attribute] - 10) / 2)})
              </span>
              <button
                onClick={() => handleAttributeChange(id, attribute, true)}
              >
                +
              </button>
              <button
                onClick={() => handleAttributeChange(id, attribute, false)}
              >
                -
              </button>
            </div>
          ))}
        </div>
        <div>
          <h4>Classes</h4>
          {Object.keys(CLASS_LIST).map((classItem, index) => (
            <div
              key={index}
              style={{
                color: meetsRequirements(CLASS_LIST[classItem])
                  ? "green"
                  : "red",
              }}
            >
              {classItem}
              <button onClick={() => setNum(num === index ? -1 : index)}>
                {num === index ? "Hide Requirements" : "Show Requirements"}
              </button>
              {num === index && (
                <div>
                  {Object.entries(CLASS_LIST[classItem]).map(
                    ([attribute, requirement], idx) => (
                      <div key={idx}>
                        <span>{attribute}: </span>
                        <span>{requirement as number}</span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          <h4>Skills</h4>
          <div>
            <span>Total Points: {totalPoints()}</span>
          </div>
          <div>
            <span>Points Remaining: {pointsRemaining()}</span>
          </div>
          {SKILL_LIST.map((skill, index) => {
            const attribute = SKILL_LIST[index].attributeModifier;
            const modifier = getModifier(characterAttributes[attribute]);
            const total = characterSkillPoints[skill.name] + modifier;
            return (
              <div key={index}>
                <span>
                  {skill.name} - points: {characterSkillPoints[skill.name]}{" "}
                </span>
                <button onClick={() => handleSkillChange(id, skill.name, true)}>
                  +
                </button>
                <button
                  onClick={() => handleSkillChange(id, skill.name, false)}
                >
                  -
                </button>
                <span>
                  {" "}
                  modifier ({attribute}): {modifier}{" "}
                </span>
                <span> total: {total} </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Character;
