import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

function seedValue(seed: string, index: number) {
  let value = index * 17 + 11;
  for (let i = 0; i < seed.length; i += 1) value = (value * 31 + seed.charCodeAt(i)) % 997;
  return value;
}

function finderCell(row: number, col: number, startRow: number, startCol: number) {
  const rowOffset = row - startRow;
  const colOffset = col - startCol;
  if (rowOffset < 0 || rowOffset > 6 || colOffset < 0 || colOffset > 6) return null;
  const edge = rowOffset === 0 || rowOffset === 6 || colOffset === 0 || colOffset === 6;
  const center = rowOffset >= 2 && rowOffset <= 4 && colOffset >= 2 && colOffset <= 4;
  return edge || center;
}

export function QrPattern({ seed, size = 196 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    const result: boolean[] = [];
    for (let row = 0; row < 21; row += 1) {
      for (let col = 0; col < 21; col += 1) {
        const finder = finderCell(row, col, 0, 0) ?? finderCell(row, col, 0, 14) ?? finderCell(row, col, 14, 0);
        result.push(finder ?? (seedValue(seed, row * 21 + col) % 3 !== 0));
      }
    }
    return result;
  }, [seed]);

  const cellSize = size / 21;
  return (
    <View style={[styles.code, { width: size, height: size, padding: cellSize }]}>
      {cells.map((isOn, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            width: cellSize + 0.3,
            height: cellSize + 0.3,
            left: cellSize + (index % 21) * cellSize,
            top: cellSize + Math.floor(index / 21) * cellSize,
            backgroundColor: isOn ? '#0B0B0D' : '#FAF7F4',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  code: {
    backgroundColor: '#FAF7F4',
    borderRadius: 12,
    overflow: 'hidden',
  },
});