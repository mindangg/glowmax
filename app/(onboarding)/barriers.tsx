import React, { useEffect } from 'react';
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
    { key: 'dont_know', label: 'TÔI KHÔNG BIẾT BẮT ĐẦU TỪ ĐÂU' },
    { key: 'coping', label: 'TÔI ĐÃ TRÌ HOÃN HOẶC CHỈ ĐANG ĐỐI PHÓ' },
    { key: 'try_hard', label: 'TÔI KHÔNG MUỐN TRÔNG NHƯ MÌNH ĐANG CỐ GẮNG QUÁ MỨC' },
    { key: 'fraud', label: 'TÔI KHÔNG MUỐN BỊ PHÁT HIỆN LÀ GIẢ TẠO HOẶC “LOOKSMAXXING”' },
    { key: 'too_much', label: 'NÓ QUÁ NHIỀU VIỆC' },
    { key: 'go_wrong', label: 'TÔI LO LẮNG VỀ NHỮNG ĐIỀU CÓ THỂ XẢY RA KHÔNG NHƯ Ý' },
];

export default function BarriersScreen() {
    const router = useRouter();
    const { answers, setAnswer } = useOnboarding();

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
                    ĐIỀU GÌ ĐANG NGĂN CẢN{'\n'}BẠN HÀNH ĐỘNG?
                </Animated.Text>

                <Animated.View style={optionsStyle}>
                    {LEVELS.map((l) => (
                        <OptionCard
                            key={l.key}
                            label={l.label}
                            selected={answers.experience === l.key}
                            onPress={() => setAnswer('experience', l.key)}
                        />
                    ))}
                </Animated.View>

                <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
                    <FrostedButton
                        label="TIẾP TỤC"
                        onPress={() => router.push('/(onboarding)/goal')}
                        disabled={!answers.experience}
                    />
                </Animated.View>
            </View>
        </TrailBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 164,
    },
    title: {
        fontFamily: FONTS.MONO_BOLD,
        fontSize: 24,
        color: COLORS.TEXT_PRIMARY,
        textAlign: 'center',
        marginBottom: 32,
        letterSpacing: 1,
    },
    ctaWrapper: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
    },
});
