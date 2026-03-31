// components/ui/MorseCodeDivider.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
    Circle,
    Rect,
    Defs,
    Filter,
    FeGaussianBlur,
    FeMerge,
    FeMergeNode,
} from 'react-native-svg';

const MORSE = [
    'd', '.', '.', 'd', '.', 'd', '.', '.', '.', '.', '.', 'd',
    '.', 'd', '.', '.', 'd', '.', '.', 'd', '.', '.', 'd',
    '.', 'd', '.', '.', 'd',
];

const DOT_R = 2.5;
const DOT_D = DOT_R * 2;
const DASH_W = 14;
const DASH_H = 3.5;
const DASH_RX = 1.8;
const GAP = 5;
const LETTER_GAP = 8;

// How far dots offset above/below the dash centerline
const DOT_OFFSET = 6;

export default function MorseCodeDivider() {
    const elements: { type: string; x: number; }[] = [];
    let x = 0;
    let dotIndex = 0; // track dot count for alternating

    MORSE.forEach((sym) => {
        if (sym === ' ') {
            x += LETTER_GAP;
            return;
        }
        if (sym === 'd') {
            elements.push({ type: 'dash', x, dotIndex: -1 });
            x += DASH_W + GAP;
        } else {
            elements.push({ type: 'dot', x, dotIndex });
            dotIndex++;
            x += DOT_D + GAP;
        }
    });

    const totalW = x;
    const SVG_W = 320;
    const offsetX = (SVG_W - totalW) / 2;

    // Vertical layout
    const TOP_CIRCLE_CY = 10;   // large dot Y — moved down a bit
    const DASH_CY = 36;          // dash centerline Y
    // dots alternate: even → above dash line, odd → below

    const SVG_H = DASH_CY + DOT_OFFSET + DOT_R + 8; // enough room for bottom dots

    return (
        <View style={styles.wrapper}>
            <Svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
                <Defs>
                    <Filter id="glowLg" x="-100%" y="-100%" width="300%" height="300%">
                        <FeGaussianBlur stdDeviation="5" result="blur" />
                        <FeMerge>
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>
                    <Filter id="glowSm" x="-100%" y="-100%" width="300%" height="300%">
                        <FeGaussianBlur stdDeviation="2.5" result="blur" />
                        <FeMerge>
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>
                </Defs>

                {/* Top center large glowing dot */}
                <Circle
                    cx={SVG_W / 2}
                    cy={TOP_CIRCLE_CY}
                    r={6}
                    fill="white"
                    filter="url(#glowLg)"
                    opacity={0.95}
                />

                {/* Morse row */}
                {elements.map((el, i) => {
                    const ex = offsetX + el.x;

                    if (el.type === 'dash') {
                        return (
                            <Rect
                                key={i}
                                x={ex}
                                y={DASH_CY - DASH_H / 2}
                                width={DASH_W}
                                height={DASH_H}
                                rx={DASH_RX}
                                fill="rgba(180,180,180,0.6)"
                            />
                        );
                    }

                    // Alternate dots above/below dash centerline
                    const isAbove = el.dotIndex % 2 === 0;
                    const cy = isAbove ? DASH_CY - DOT_OFFSET : DASH_CY + DOT_OFFSET;

                    return (
                        <Circle
                            key={i}
                            cx={ex + DOT_R}
                            cy={cy}
                            r={DOT_R}
                            fill="white"
                            filter="url(#glowSm)"
                            opacity={0.88}
                        />
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        marginVertical: 12,
    },
});