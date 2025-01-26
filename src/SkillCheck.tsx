import React, { useState } from "react";
import { SKILL_LIST } from "./consts";

// SkillCheck Props for both character and party check
interface SkillCheckProps {
  characterAttributes?: { [key: string]: number };
  characterSkills?: { [key: string]: number };
  party?: boolean; // Flag to differentiate between party check and individual character check
  characters?: any[]; // Array of characters for party check
  onSkillChange?: (selectedSkill: string) => void;
  onRollResult?: (result: string) => void;
  dc: number;
}

const SkillCheck: React.FC<SkillCheckProps> = ({
  characterAttributes,
  characterSkills,
  characters,
  party = false,
  onSkillChange,
  onRollResult,
  dc,
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string>(
    SKILL_LIST[0].name
  );
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [totalSkill, setTotalSkill] = useState<number>(0);

  // Calculate modifier for skill check based on attribute
  const calculateModifier = (attributeValue: number) =>
    Math.floor((attributeValue - 10) / 2);

  // For individual character checks, use their skills and attributes
  const calculateTotalSkill = () => {
    if (characterAttributes && characterSkills) {
      const skillModifier = calculateModifier(
        characterAttributes[
          SKILL_LIST.find((skill) => skill.name === selectedSkill)
            ?.attributeModifier || ""
        ]
      );
      return characterSkills[selectedSkill] + skillModifier;
    }
    return 0;
  };

  const handleRoll = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setTotalSkill(calculateTotalSkill());
    const total = totalSkill + roll;
    setRollResult(total);
    onRollResult?.(`Result: ${total >= dc ? "Success" : "Failure"}`);
  };

  // For party check, find the character with the highest skill
  const bestCharacter = characters?.reduce(
    (best: any, character: any) => {
      const skillModifier = calculateModifier(
        character.attributes[
          SKILL_LIST.find((skill) => skill.name === selectedSkill)
            ?.attributeModifier || ""
        ]
      );
      const totalSkill = character.skills[selectedSkill] + skillModifier;
      return totalSkill > best.totalSkill
        ? { id: character.id, totalSkill }
        : best;
    },
    { id: -1, totalSkill: -Infinity }
  );

  const handlePartyRoll = () => {
    const roll = Math.floor(Math.random() * 20) + 1;
    setTotalSkill(bestCharacter.totalSkill);
    const total = bestCharacter.totalSkill + roll;
    setRollResult(total);
    onRollResult?.(`Result: ${total >= dc ? "Success" : "Failure"}`);
  };

  return (
    <div>
      <label>Skill: </label>
      <select
        value={selectedSkill}
        onChange={(e) => {
          setSelectedSkill(e.target.value);
          onSkillChange?.(e.target.value);
        }}
      >
        {SKILL_LIST.map((skill) => (
          <option key={skill.name} value={skill.name}>
            {skill.name}
          </option>
        ))}
      </select>
      <label>DC: </label>
      <input type="number" value={dc} onChange={(e) => {}} />

      <button onClick={party ? () => handlePartyRoll() : handleRoll}>
        Roll
      </button>

      {rollResult !== null && (
        <div>
          {party && bestCharacter.id !== -1 && (
            <p>{`Character: ${bestCharacter.id}`}</p>
          )}
          <p>{`Skill: ${selectedSkill}: ${totalSkill}`}</p>
          <p>{`You Rolled: ${rollResult}`}</p>
          <p>{`The DC was: ${dc}`}</p>
        </div>
      )}
    </div>
  );
};

export default SkillCheck;
