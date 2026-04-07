import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import TrailBackground from '../../components/backgrounds/TrailBackground';
import BackArrow from '../../components/ui/BackArrow';
import FrostedButton from '../../components/ui/FrostedButton';
import { useOnboarding } from '../../hooks/useOnboarding';
import { checkUsernameAvailable } from '../../lib/auth';
import { COLORS, FONTS } from '../../lib/constants';

// ── Validation helpers ──────────────────────────────────────────────────────

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;

/**
 * Sanitise a raw string before storing / sending:
 * – strip leading/trailing whitespace
 * – collapse inner whitespace to single space
 * – remove every character that is NOT alphanumeric, space, dot, underscore or hyphen
 */
function sanitiseUsername(raw: string): string {
  return raw
      .trim()
      .replace(/\s+/g, ' ')                      // collapse whitespace
      .replace(/[^a-zA-Z0-9 ._\-àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý]/g, '');
  // ↑ keeps basic Latin, digits, spaces, . _ - and Vietnamese unicode
}

type ValidationResult =
    | { ok: true; value: string }
    | { ok: false; message: string };

function validateUsername(raw: string): ValidationResult {
  const value = sanitiseUsername(raw);

  if (value.length === 0) {
    return { ok: false, message: 'Vui lòng nhập tên người dùng.' };
  }
  if (value.length < USERNAME_MIN) {
    return { ok: false, message: `Tên phải có ít nhất ${USERNAME_MIN} ký tự.` };
  }
  if (value.length > USERNAME_MAX) {
    return { ok: false, message: `Tên không được vượt quá ${USERNAME_MAX} ký tự.` };
  }

  // Block patterns that look like SQL injection fragments
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|TRUNCATE|CAST|CONVERT|DECLARE|FROM|WHERE|OR|AND)\b)|(['";]|--|\*|\/\*|\*\/|xp_)/i;
  if (sqlPattern.test(value)) {
    return { ok: false, message: 'Tên người dùng chứa ký tự không hợp lệ.' };
  }

  // Block HTML / script injection
  const htmlPattern = /<[^>]*>|&[a-zA-Z]+;|&#?\w+;/;
  if (htmlPattern.test(value)) {
    return { ok: false, message: 'Tên người dùng chứa ký tự không hợp lệ.' };
  }

  // Block control characters and null bytes
  // eslint-disable-next-line no-control-regex
  const controlPattern = /[\x00-\x1F\x7F]/;
  if (controlPattern.test(value)) {
    return { ok: false, message: 'Tên người dùng chứa ký tự không hợp lệ.' };
  }

  // Must start with a letter (Latin or Vietnamese)
  const startsWithLetter = /^[a-zA-Zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý]/;
  if (!startsWithLetter.test(value)) {
    return { ok: false, message: 'Tên phải bắt đầu bằng một chữ cái.' };
  }

  return { ok: true, value };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function UsernameScreen() {
  const router = useRouter();
  const { answers, setAnswer } = useOnboarding();

  const [usernameText, setUsernameText] = useState<string>(
      answers.username ? String(answers.username) : '',
  );
  const [errorMsg, setErrorMsg]           = useState<string>('');
  const [availability, setAvailability]   = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const debounceTimer                     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);
  const ctaOpacity   = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    inputOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value   = withDelay(800, withTiming(1, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const inputStyle = useAnimatedStyle(() => ({ opacity: inputOpacity.value }));
  const ctaStyle   = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  // Live-sanitise on every keystroke and debounce availability check.
  const handleChangeText = (raw: string) => {
    const capped = raw.slice(0, USERNAME_MAX + 5);
    setUsernameText(capped);
    setErrorMsg('');

    const sanitised = sanitiseUsername(capped);
    if (sanitised.length < USERNAME_MIN) {
      setAvailability('idle');
      return;
    }

    // Debounce: fire 500 ms after the user stops typing.
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setAvailability('checking');
    debounceTimer.current = setTimeout(async () => {
      const available = await checkUsernameAvailable(sanitised);
      setAvailability(available ? 'available' : 'taken');
    }, 500);
  };

  const handleContinue = () => {
    const result = validateUsername(usernameText);
    if (!result.ok) {
      setErrorMsg(result.message);
      Alert.alert('', result.message);
      return;
    }
    if (availability === 'taken') {
      const msg = 'Tên người dùng đã được sử dụng. Vui lòng chọn tên khác.';
      setErrorMsg(msg);
      Alert.alert('', msg);
      return;
    }
    setAnswer('username', result.value);
    router.push('/(onboarding)/camera');
  };

  // Button enabled when length ok AND not taken (checking = optimistic allow,
  // server will enforce uniqueness on write if check is still in-flight).
  const isValid =
    sanitiseUsername(usernameText).length >= USERNAME_MIN &&
    availability !== 'taken';

  const charCount = sanitiseUsername(usernameText).length;
  const nearLimit = charCount > USERNAME_MAX - 5;

  return (
      <TrailBackground>
        <BackArrow />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.container}>
              <Animated.Text style={[styles.title, titleStyle]}>
                TÊN CỦA BẠN LÀ GÌ?
              </Animated.Text>

              <Animated.View style={[styles.inputWrapper, inputStyle]}>
                <TextInput
                    style={[styles.input, errorMsg ? styles.inputError : null]}
                    value={usernameText}
                    onChangeText={handleChangeText}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    maxLength={USERNAME_MAX + 5}
                    placeholder="glowmax"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    selectionColor={COLORS.ACCENT_GOLD}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                    textContentType="username"
                />
              </Animated.View>

              {/* Character counter + availability indicator */}
              <Animated.View style={[inputStyle, styles.counterRow]}>
                <Text style={[styles.charCount, nearLimit && styles.charCountWarn]}>
                  {charCount}/{USERNAME_MAX}
                </Text>
                {availability === 'checking' && (
                  <Text style={styles.availChecking}>đang kiểm tra…</Text>
                )}
                {availability === 'available' && (
                  <Text style={styles.availOk}>✓ có thể dùng</Text>
                )}
                {availability === 'taken' && (
                  <Text style={styles.availTaken}>✗ đã có người dùng</Text>
                )}
              </Animated.View>

              {/* Inline error */}
              {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
              ) : null}

              {/* Rules hint */}
              <Animated.View style={[inputStyle, styles.hintWrapper]}>
                <Text style={styles.hint}>
                  Chỉ dùng chữ cái, số, dấu chấm, gạch dưới hoặc gạch ngang.
                </Text>
              </Animated.View>

              <Animated.View style={[styles.ctaWrapper, ctaStyle]}>
                <FrostedButton
                    label="TIẾP TỤC"
                    onPress={handleContinue}
                    disabled={!isValid}
                />
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </TrailBackground>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -120,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 1,
  },
  inputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    fontFamily: FONTS.MONO_BOLD,
    fontSize: 32,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ACCENT_GOLD,
    paddingBottom: 8,
    width: '90%',
  },
  inputError: {
    borderBottomColor: '#ff4d4d',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  charCount: {
    fontFamily: FONTS.MONO,
    fontSize: 12,
    color: COLORS.MUTED_GRAY,
  },
  charCountWarn: {
    color: '#f0a500',
  },
  availChecking: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.MUTED_GRAY,
    opacity: 0.6,
  },
  availOk: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: '#4caf76',
  },
  availTaken: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: '#ff4d4d',
  },
  errorText: {
    fontFamily: FONTS.MONO,
    fontSize: 13,
    color: '#ff4d4d',
    marginTop: 12,
    textAlign: 'center',
  },
  hintWrapper: {
    marginTop: 16,
  },
  hint: {
    fontFamily: FONTS.MONO,
    fontSize: 11,
    color: COLORS.MUTED_GRAY,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});