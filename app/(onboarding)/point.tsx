import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import GrainBackground from '../../components/backgrounds/GrainBackground';
import BackArrow from '../../components/ui/BackArrow';
import OptionCard from '../../components/ui/OptionCard';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { FONTS, COLORS } from '../../lib/constants';

const GOALS = [
    { key: 'normal', label: 'CHỈ CẦN MỘT CHÚT TRỢ GIÚP ĐỂ CẢI THIỆN' },
    { key: 'ready', label: 'TÔI SẴN SÀNG CHO SỰ THAY ĐỔI LỚN' },
    { key: 'life_changing', label: 'ĐIỀU NÀY SẼ THAY ĐỔI CUỘC ĐỜI TÔI' },
    { key: 'need_help', label: 'TÔI CẦN GIÚP ĐỠ, NGAY BÂY GIỜ 🥀' },
];

export default function PointScreen() {
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
        <GrainBackground>
            <BackArrow />
            <View style={styles.container}>
                <Animated.Text style={[styles.title, titleStyle]}>
                    BẠN NGHĨ MÌNH CÒN{'\n'} CÁCH MỨC XẾP HẠNG PSL{'\n'} TIỀM NĂNG BAO NHIÊU ĐIỂM?
                </Animated.Text>

                <Animated.View style={optionsStyle}>
                    {GOALS.map((g) => (
                        <OptionCard
                            key={g.key}
                            label={g.label}
                            selected={answers.goal === g.key}
                            onPress={() => setAnswer('goal', g.key)}
                        />
                    ))}
                </Animated.View>

                <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
                    <FrostedButton
                        label="TIẾP TỤC"
                        onPress={() => router.push('/(onboarding)/bad-experience')}
                        disabled={!answers.goal}
                    />
                </Animated.View>
            </View>
        </GrainBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginTop: -60
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
