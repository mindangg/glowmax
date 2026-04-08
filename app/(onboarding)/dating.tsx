import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import OptionCard from '../../components/ui/OptionCard';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { FONTS, COLORS } from '../../lib/constants';

const LEVELS = [
    { key: 'bad', label: 'RẤT TỆ' },
    { key: 'improve', label: 'TÔI CẦN CẢI THIỆN MỘT SỐ ĐIỀU' },
    { key: 'perfect', label: 'HOÀN HẢO, NHỮNG NGƯỜI THÍCH TÔI ĐỀU ĐÚNG GU CỦA TÔI' },
];

export default function DatingScreen() {
    const router = useRouter();
    const { setAnswer } = useOnboarding();
    const [selected, setSelected] = useState<string | null>(null);

    const titleOpacity = useSharedValue(0);
    const optionsOpacity = useSharedValue(0);
    const ctaOpacity = useSharedValue(0);

    useEffect(() => {
        titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
        optionsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
        ctaOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    }, []);

    const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
    const optionsStyle = useAnimatedStyle(() => ({ opacity: optionsOpacity.value }));
    const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

    return (
        <TrailBackground>
            <BackArrow />
            <View style={styles.container}>
                <Animated.Text style={[styles.title, titleStyle]}>
                    GIỮA CHÚNG TA VỚI{'\n'} NHAU THÔI, ĐỜI SỐNG HẸN{'\n'} HÒ CỦA BẠN THẾ NÀO?
                </Animated.Text>

                <Animated.View style={optionsStyle}>
                    {LEVELS.map((l) => (
                        <OptionCard
                            key={l.key}
                            label={l.label}
                            selected={selected === l.key}
                            onPress={() => { setSelected(l.key); setAnswer('experience', l.key); }}
                        />
                    ))}
                </Animated.View>

                <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
                    <FrostedButton
                        label="TIẾP TỤC"
                        onPress={() => router.push('/(onboarding)/comfortable')}
                        disabled={!selected}
                    />
                </Animated.View>
            </View>
        </TrailBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginTop: -90
    },
    title: {
        fontFamily: FONTS.MONO_BOLD,
        fontSize: 24,
        color: COLORS.TEXT_PRIMARY,
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 1,
    },
    ctaWrapper: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
    },
});
