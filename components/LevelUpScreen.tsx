import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCharacterStore } from '../store/characterStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
// FIX: Imported the Skill type to resolve an inference issue with Object.entries.
import { GameState, AttributeName, SkillName, Skill } from '../types';
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '../constants';

const LevelUpScreen: React.FC = () => {
    const { setGameState } = useGameStore();
    const { levelUpPending, applyLevelUp, skills } = useCharacterStore();

    const [selectedSection, setSelectedSection] = useState<'attribute' | 'skill'>('attribute');
    const [attributeIndex, setAttributeIndex] = useState(0);
    const [skillIndex, setSkillIndex] = useState(0);

    const nonProficientSkills = useMemo(() => 
        Object.entries(skills)
            // FIX: Explicitly typing `details` as `Skill` because TypeScript failed to infer it correctly.
            .filter(([, details]: [string, Skill]) => !details.proficient)
            .map(([skillName]) => skillName as SkillName)
    , [skills]);

    useEffect(() => {
        if (!levelUpPending) {
            setGameState(GameState.IN_GAME);
        }
    }, [levelUpPending, setGameState]);

    const handleNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (direction === 'left' || direction === 'right') {
            setSelectedSection(prev => prev === 'attribute' ? 'skill' : 'attribute');
        } else {
            const delta = direction === 'up' ? -1 : 1;
            if (selectedSection === 'attribute') {
                setAttributeIndex(prev => (prev + delta + ATTRIBUTES.length) % ATTRIBUTES.length);
            } else {
                setSkillIndex(prev => (prev + delta + nonProficientSkills.length) % nonProficientSkills.length);
            }
        }
    }, [selectedSection, nonProficientSkills.length]);

    const handleConfirm = useCallback(() => {
        const selectedAttribute = ATTRIBUTES[attributeIndex];
        const selectedSkill = nonProficientSkills[skillIndex];

        if (selectedAttribute && selectedSkill) {
            applyLevelUp({ attribute: selectedAttribute, skill: selectedSkill });
        }
    }, [attributeIndex, skillIndex, nonProficientSkills, applyLevelUp]);

    const handlerMap = useMemo(() => ({
        'ArrowUp': () => handleNavigate('up'),
        'w': () => handleNavigate('up'),
        'ArrowDown': () => handleNavigate('down'),
        's': () => handleNavigate('down'),
        'ArrowLeft': () => handleNavigate('left'),
        'a': () => handleNavigate('left'),
        'ArrowRight': () => handleNavigate('right'),
        'd': () => handleNavigate('right'),
        'Enter': handleConfirm,
    }), [handleNavigate, handleConfirm]);

    useKeyboardInput(handlerMap);

    return (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-8">
            <div className="w-full h-full border-8 border-double border-green-400/50 flex flex-col p-6">
                <h1 className="text-6xl text-center font-bold tracking-widest uppercase mb-6">═══ AUMENTO DI LIVELLO ═══</h1>
                <p className="text-3xl text-center text-green-400/80 mb-8">
                    Scegli come migliorare le tue abilità.
                </p>

                <div className="flex-grow flex space-x-6 overflow-hidden">
                    {/* Attributes Column */}
                    <div className={`w-1/2 h-full border-2 p-4 ${selectedSection === 'attribute' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-green-400/30'}`}>
                        <h2 className="text-4xl text-center mb-4 border-b-2 border-green-400/30 pb-2">Aumenta un Attributo (+1)</h2>
                        <ul className="space-y-2 text-4xl">
                            {ATTRIBUTES.map((attr, index) => {
                                const isSelected = index === attributeIndex && selectedSection === 'attribute';
                                return (
                                    <li key={attr} className={`pl-4 py-1 ${isSelected ? 'bg-green-400 text-black' : ''}`}>
                                        {isSelected && '> '}{ATTRIBUTE_LABELS[attr]}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Skills Column */}
                    <div className={`w-1/2 h-full border-2 p-4 overflow-y-auto ${selectedSection === 'skill' ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-green-400/30'}`} style={{ scrollbarWidth: 'none' }}>
                        <h2 className="text-4xl text-center mb-4 border-b-2 border-green-400/30 pb-2">Acquisisci Competenza</h2>
                        <ul className="space-y-2 text-4xl">
                            {nonProficientSkills.map((skill, index) => {
                                const isSelected = index === skillIndex && selectedSection === 'skill';
                                return (
                                    <li key={skill} className={`pl-4 py-1 capitalize ${isSelected ? 'bg-green-400 text-black' : ''}`}>
                                        {isSelected && '> '}{skill}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div className="flex-shrink-0 text-center text-3xl mt-6 border-t-4 border-double border-green-400/50 pt-3">
                    [←→] Seleziona Sezione | [↑↓] Seleziona Opzione | [INVIO] Conferma
                </div>
            </div>
        </div>
    );
};

export default LevelUpScreen;