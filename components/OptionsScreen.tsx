import React, { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameState } from '../types';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

type OptionKind = 'multiple' | 'slider';

type OptionRow = {
  type: 'option' | 'header' | 'spacer';
  id?: 'language' | 'fullscreen' | 'audio' | 'volume' | 'display';
  label?: string;
  values?: string[];
  kind?: OptionKind;
  max?: number;
};

const OPTIONS_CONFIG: readonly OptionRow[] = [
  { type: 'header', label: 'Gioco' },
  { type: 'option', id: 'language', label: 'Lingua', kind: 'multiple', values: ['Italiano', 'Inglese', 'Francese', 'Tedesco', 'Spagnolo', 'Russo', 'Cinese Semplificato'] },
  { type: 'option', id: 'fullscreen', label: 'Schermo', kind: 'multiple', values: ['Fullscreen', 'Finestra'] },
  { type: 'spacer' },
  { type: 'header', label: 'Audio' },
  { type: 'option', id: 'audio', label: 'Suono', kind: 'multiple', values: ['On', 'Off'] },
  { type: 'option', id: 'volume', label: 'Volume', kind: 'slider', max: 10 },
  { type: 'spacer' },
  { type: 'header', label: 'Video' },
  { type: 'option', id: 'display', label: 'Visualizzazione', kind: 'multiple', values: ['Standard', 'CRT Fosfori Verdi', 'Alto Contrasto'] },
];

const firstSelectableRow = OPTIONS_CONFIG.findIndex(opt => opt.type === 'option');
const lastSelectableRow = [...OPTIONS_CONFIG].reverse().findIndex(opt => opt.type === 'option');

const VolumeBar: React.FC<{ level: number, max: number }> = ({ level, max }) => {
  const filled = '█';
  const empty = '░';
  let bar = '';
  for (let i = 0; i < max; i++) {
    bar += i < level ? filled : empty;
  }
  return <span className="font-mono">{`[${bar}]`}</span>;
};


const OptionsScreen: React.FC = () => {
    const setGameState = useGameStore((state) => state.setGameState);

    const [settings, setSettings] = useState({
        language: 0,
        fullscreen: 0,
        audio: 0,
        volume: 7,
        display: 0,
    });
    const [selectedRow, setSelectedRow] = useState(firstSelectableRow);

    const handleArrowUp = useCallback(() => {
      setSelectedRow(currentRow => {
          let nextRow = currentRow - 1;
          while (nextRow >= 0 && OPTIONS_CONFIG[nextRow].type !== 'option') {
              nextRow--;
          }
          return nextRow < 0 ? OPTIONS_CONFIG.length - 1 - lastSelectableRow : nextRow;
      });
    }, []);

    const handleArrowDown = useCallback(() => {
        setSelectedRow(currentRow => {
            let nextRow = currentRow + 1;
            while (nextRow < OPTIONS_CONFIG.length && OPTIONS_CONFIG[nextRow].type !== 'option') {
                nextRow++;
            }
            return nextRow >= OPTIONS_CONFIG.length ? firstSelectableRow : nextRow;
        });
    }, []);

    const handleChangeOption = useCallback((direction: 'left' | 'right') => {
        const option = OPTIONS_CONFIG[selectedRow];
        if (option.type !== 'option' || !option.id) return;
        
        const delta = direction === 'left' ? -1 : 1;

        setSettings(currentSettings => {
            const newSettings = { ...currentSettings };
            const key = option.id;

            if (option.kind === 'multiple' && option.values) {
                const values = option.values;
                const currentIndex = newSettings[key];
                const newIndex = (currentIndex + delta + values.length) % values.length;
                newSettings[key] = newIndex;
            } else if (option.kind === 'slider' && option.max) {
                const currentValue = newSettings[key];
                const newValue = Math.max(0, Math.min(option.max, currentValue + delta));
                newSettings[key] = newValue;
            }
            return newSettings;
        });
    }, [selectedRow]);

    const handleArrowLeft = useCallback(() => handleChangeOption('left'), [handleChangeOption]);
    const handleArrowRight = useCallback(() => handleChangeOption('right'), [handleChangeOption]);
    
    const handleExit = useCallback(() => {
        setGameState(GameState.MAIN_MENU);
    }, [setGameState]);

    useKeyboardInput({
        ArrowUp: handleArrowUp,
        w: handleArrowUp,
        ArrowDown: handleArrowDown,
        s: handleArrowDown,
        ArrowLeft: handleArrowLeft,
        a: handleArrowLeft,
        ArrowRight: handleArrowRight,
        d: handleArrowRight,
        Escape: handleExit,
    });

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-6xl mb-2 text-center">═══ IMPOSTAZIONI ═══</h1>
            <p className="text-2xl md:text-3xl mb-8 text-center">Configura le opzioni di gioco</p>
            
            <div className="w-full max-w-4xl text-3xl space-y-3">
              {OPTIONS_CONFIG.map((row, index) => {
                const isSelected = index === selectedRow;
                const optionStyle = `transition-colors duration-100 px-2 ${isSelected ? 'bg-green-400 text-black' : ''}`;

                if (row.type === 'header') {
                  return <h2 key={index} className="text-4xl pt-4">{row.label}</h2>;
                }
                if (row.type === 'spacer') {
                  return <div key={index} className="h-4" />;
                }
                if (row.type === 'option' && row.id && row.label) {
                  let valueDisplay;
                  if (row.kind === 'multiple' && row.values) {
                    valueDisplay = `< ${settings[row.id]} >`;
                    valueDisplay = `< ${row.values[settings[row.id]]} >`;
                  } else if (row.kind === 'slider' && row.max) {
                    valueDisplay = <VolumeBar level={settings.volume} max={row.max} />;
                  }

                  return (
                    <div key={row.id} className={`flex justify-between items-center ${optionStyle}`}>
                      <span>{row.label}:</span>
                      <span>{valueDisplay}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <div className="mt-auto text-2xl md:text-3xl text-center">
                [W/S/↑↓] Muovi | [A/D/←→] Cambia | [ESC] Torna al Menu
            </div>
        </div>
    );
};

export default OptionsScreen;