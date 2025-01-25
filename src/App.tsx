import { useState, useEffect } from "react";
import "./App.css";
import Character from "./Character";
import { ATTRIBUTE_LIST, SKILL_LIST } from "./consts";

interface CharacterData {
  id: number;
  attributes: { [key: string]: number };
  skills: { [key: string]: number };
}

function App() {
  const githubUsername = "{aseemmittal}"; // replace with your GitHub username
  const apiUrl = `https://recruiting.verylongdomaintotestwith.ca/api/${githubUsername}/character`;

  const [characters, setCharacters] = useState<CharacterData[]>([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error fetching characters: ${response.statusText}`);
        }
        const characters = await response.json();
        if (characters.body.length > 0) {
          const data: CharacterData[] = characters.body;
          setCharacters(data);
        }
      } catch (err: any) {
        alert(err.message);
      }
    };

    fetchCharacters();
  }, [apiUrl]);

  const addCharacter = () => {
    const newCharacter: CharacterData = {
      id: characters.length + 1,
      attributes: ATTRIBUTE_LIST.reduce(
        (acc, attr) => {
          acc[attr] = 10;
          return acc;
        },
        {} as { [key: string]: number }
      ),
      skills: SKILL_LIST.reduce(
        (acc, skill) => {
          acc[skill.name] = 0;
          return acc;
        },
        {} as { [key: string]: number }
      ),
    };

    setCharacters((prev) => [...prev, newCharacter]);
  };

  const updateCharacterAttributes = (
    id: number,
    attribute: string,
    increment: boolean
  ) => {
    setCharacters((prev) =>
      prev.map((character) => {
        if (character.id === id) {
          const totalAttributes = Object.values(character.attributes).reduce(
            (sum, value) => sum + value,
            0
          );

          if (increment && totalAttributes >= 70) {
            alert(
              "Total attributes cannot exceed 70. Decrease another attribute first."
            );
            return character;
          }

          return {
            ...character,
            attributes: {
              ...character.attributes,
              [attribute]:
                character.attributes[attribute] + (increment ? 1 : -1),
            },
          };
        }
        return character;
      })
    );
  };

  const updateCharacterSkills = (
    id: number,
    skill: string,
    increment: boolean
  ) => {
    setCharacters((prev) =>
      prev.map((character) =>
        character.id === id
          ? {
              ...character,
              skills: {
                ...character.skills,
                [skill]: character.skills[skill] + (increment ? 1 : -1),
              },
            }
          : character
      )
    );
  };

  const saveCharacters = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(characters),
      });
      if (response.ok) {
        alert("Characters saved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to save characters: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error saving characters: ${error}`);
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
          <button onClick={addCharacter}>Add Character</button>
          {characters.map((character, index) => (
            <Character
              key={character.id}
              id={character.id}
              characterAttributes={character.attributes}
              characterSkillPoints={character.skills}
              handleAttributeChange={updateCharacterAttributes}
              handleSkillChange={updateCharacterSkills}
            />
          ))}
        </div>
        <button onClick={saveCharacters}>Save Characters</button>
      </section>
    </div>
  );
}

export default App;
