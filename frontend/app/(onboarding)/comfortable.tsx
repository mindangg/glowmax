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
    { key: 'uncomfortable', label: 'CỰC KỲ KHÔNG THOẢI MÁI & CẦN NHỮNG CẢI THIỆN LỚN' },
    { key: 'not_yet', label: 'CHƯA Ở MỨC MONG MUỐN & MUỐN TẠO RA NHỮNG THAY ĐỔI LỚN' },
    { key: 'ok', label: 'NHÌN CHUNG TÔI HÀI LÒNG, NHƯNG BIẾT MÌNH CÓ THỂ TỐT HƠN NỮA' },
    { key: 'perfect', label: 'CUỘC SỐNG CỦA TÔI HOÀN HẢO, CHỈ MUỐN BIẾT ĐIỂM PSL CỦA TÔI BAO NHIÊU' },
];

export default function BadExperienceScreen() {
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
                    THẬT LÒNG, BẠN CẢM THẤY {'\n'}THOẢI MÁI VỚI BẢN THÂN{'\n'}Ở MỨC NÀO?
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
                        onPress={() => router.push('/(onboarding)/barriers')}
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
        paddingTop: 220,
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
