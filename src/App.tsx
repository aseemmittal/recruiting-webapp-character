import { useState, useEffect } from "react";
import "./App.css";
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from "./consts";

function App() {
  const githubUsername = "{aseemmittal}"; // replace with your GitHub username
  const apiUrl = `https://recruiting.verylongdomaintotestwith.ca/api/${githubUsername}/character`;
  const [num, setNum] = useState<number>(3);
  const [characterCount, setCharacterCount] = useState<number>(0);
  useEffect(() => {
    setCharacterAttributes((prevAttributes) => [
      ...prevAttributes,
      ATTRIBUTE_LIST.reduce(
        (acc, attribute) => {
          acc[attribute] = 0;
          return acc;
        },
        {} as { [key: string]: number }
      ),
    ]);

    setCharacterSkillPoints((prevPoints) => [
      ...prevPoints,
      SKILL_LIST.reduce(
        (acc, skill) => {
          acc[skill.name] = 0;
          return acc;
        },
        {} as { [key: string]: number }
      ),
    ]);
  }, [characterCount]);
  const [characterAttributes, setCharacterAttributes] = useState(
    Array.from({ length: characterCount }).map(() =>
      ATTRIBUTE_LIST.reduce(
        (acc, attribute) => {
          acc[attribute] = 0;
          return acc;
        },
        {} as { [key: string]: number }
      )
    )
  );

  const handleIncrement = (characterIndex: number, attribute: string) => {
    const totalAttributes = Object.values(
      characterAttributes[characterIndex]
    ).reduce((acc, val) => acc + val, 0);
    if (totalAttributes < 70) {
      setCharacterAttributes((prevAttributes) => {
        const newAttributes = [...prevAttributes];
        newAttributes[characterIndex] = {
          ...newAttributes[characterIndex],
          [attribute]: newAttributes[characterIndex][attribute] + 1,
        };
        return newAttributes;
      });
    } else {
      alert("A Character can have up to 70 Delegated Attribute Points");
    }
  };

  const handleDecrement = (characterIndex: number, attribute: string) => {
    setCharacterAttributes((prevAttributes) => {
      const newAttributes = [...prevAttributes];
      newAttributes[characterIndex] = {
        ...newAttributes[characterIndex],
        [attribute]: newAttributes[characterIndex][attribute] - 1,
      };
      return newAttributes;
    });
  };

  const meetsRequirements = (
    characterIndex: number,
    classRequirements: { [key: string]: number }
  ) => {
    return Object.keys(classRequirements).every(
      (attribute) =>
        characterAttributes[characterIndex][attribute] >=
        classRequirements[attribute]
    );
  };

  const getModifier = (attributeValue: number) =>
    Math.floor((attributeValue - 10) / 2);

  const getTotalPoints = (intelligenceModifier: number) =>
    10 + 4 * intelligenceModifier;

  const [characterSkillPoints, setCharacterSkillPoints] = useState(
    Array.from({ length: characterCount }).map(() =>
      SKILL_LIST.reduce(
        (acc, skill) => {
          acc[skill.name] = 0;
          return acc;
        },
        {} as { [key: string]: number }
      )
    )
  );

  const totalPoints = (characterIndex: number) =>
    getTotalPoints(
      getModifier(characterAttributes[characterIndex]["Intelligence"])
    );
  const pointsSpent = (characterIndex: number) =>
    Object.values(characterSkillPoints[characterIndex]).reduce(
      (acc, points) => acc + points,
      0
    );
  const pointsRemaining = (characterIndex: number) =>
    totalPoints(characterIndex) - pointsSpent(characterIndex);

  const handleSkillIncrement = (characterIndex: number, skill: string) => {
    if (pointsRemaining(characterIndex) > 0) {
      setCharacterSkillPoints((prevPoints) => {
        const newPoints = [...prevPoints];
        newPoints[characterIndex] = {
          ...newPoints[characterIndex],
          [skill]: newPoints[characterIndex][skill] + 1,
        };
        return newPoints;
      });
    }
  };

  const handleSkillDecrement = (characterIndex: number, skill: string) => {
    if (characterSkillPoints[characterIndex][skill] > 0) {
      setCharacterSkillPoints((prevPoints) => {
        const newPoints = [...prevPoints];
        newPoints[characterIndex] = {
          ...newPoints[characterIndex],
          [skill]: newPoints[characterIndex][skill] - 1,
        };
        return newPoints;
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        if (data?.statusCode === 200 && data?.body?.characters) {
          setCharacterCount(data.body.characters.length);
          const attributes = data.body.characters.map(
            (character: any) => character.attributes
          );
          const skills = data.body.characters.map(
            (character: any) => character.skills
          );
          setCharacterAttributes(attributes);
          setCharacterSkillPoints(skills);
        } else {
          console.error("Invalid data received:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const saveCharacters = async () => {
    const characters = Array.from({ length: characterCount }).map(
      (_, index) => ({
        attributes: characterAttributes[index],
        skills: characterSkillPoints[index],
      })
    );

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characters }),
      });

      if (response.ok) {
        alert("Characters saved successfully!");
      } else {
        console.error("Error saving characters:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving characters:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <div>
          <h2>Characters</h2>
          <button onClick={() => setCharacterCount(characterCount + 1)}>
            Add Character
          </button>
          {Array.from({ length: characterCount }).map((_, characterIndex) => (
            <div key={characterIndex} style={{ marginBottom: "20px" }}>
              <h3>Character {characterIndex + 1}</h3>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h4>Attributes</h4>
                  {ATTRIBUTE_LIST.map((attribute, index) => (
                    <div key={index}>
                      <span>{attribute}: </span>
                      <button
                        onClick={() =>
                          handleIncrement(characterIndex, attribute)
                        }
                      >
                        +
                      </button>
                      <button
                        onClick={() =>
                          handleDecrement(characterIndex, attribute)
                        }
                      >
                        -
                      </button>
                      <span>
                        {characterAttributes[characterIndex][attribute]}
                      </span>
                      <span>
                        Modifier:{" "}
                        {Math.floor(
                          (characterAttributes[characterIndex][attribute] -
                            10) /
                            2
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4>Classes</h4>
                  {Object.keys(CLASS_LIST).map((classItem, index) => (
                    <div
                      key={index}
                      style={{
                        color: meetsRequirements(
                          characterIndex,
                          CLASS_LIST[classItem]
                        )
                          ? "green"
                          : "red",
                      }}
                    >
                      {classItem}
                      <button
                        onClick={() => setNum(num === index ? -1 : index)}
                      >
                        {num === index
                          ? "Hide Requirements"
                          : "Show Requirements"}
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
                    <span>Total Points: {totalPoints(characterIndex)}</span>
                  </div>
                  <div>
                    <span>
                      Points Remaining: {pointsRemaining(characterIndex)}
                    </span>
                  </div>
                  {SKILL_LIST.map((skill, index) => {
                    const attribute = SKILL_LIST[index].attributeModifier;
                    const modifier = getModifier(
                      characterAttributes[characterIndex][attribute]
                    );
                    const total =
                      characterSkillPoints[characterIndex][skill.name] +
                      modifier;
                    return (
                      <div key={index}>
                        <span>
                          {skill.name} - points:{" "}
                          {characterSkillPoints[characterIndex][skill.name]}{" "}
                        </span>
                        <button
                          onClick={() =>
                            handleSkillIncrement(characterIndex, skill.name)
                          }
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            handleSkillDecrement(characterIndex, skill.name)
                          }
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
          ))}
        </div>
        <button onClick={saveCharacters}>Save Character</button>
      </section>
    </div>
  );
}

export default App;
