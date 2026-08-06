import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  CONSENT_BODY,
  HARDEST_OPTIONS,
  STAGE_OPTIONS,
} from '../../constants/onboarding';
import {
  completeOnboarding,
  isOnboardingComplete,
  recordConsent,
} from '../../db/repositories/profile';
import type { Profile } from '../../types/models';
import { colors, fonts, radii, spacing } from '../../theme';
import { ChoiceChip } from './ChoiceChip';
import { OnboardingShell } from './OnboardingShell';

type Step = 'welcome' | 'consent' | 'stage' | 'hardest';

type Props = {
  initialProfile: Profile;
  onFinished: (profile: Profile) => void;
};

export function OnboardingFlow({ initialProfile, onFinished }: Props) {
  const startStep = useMemo<Step>(() => {
    if (
      initialProfile.consentedAt &&
      initialProfile.consentVersion &&
      !isOnboardingComplete(initialProfile)
    ) {
      return 'stage';
    }
    return 'welcome';
  }, [initialProfile]);

  const [step, setStep] = useState<Step>(startStep);
  const [stage, setStage] = useState<string | null>(initialProfile.stage);
  const [hardestIds, setHardestIds] = useState<string[]>([]);
  const [otherHardest, setOtherHardest] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleHardest = (id: string) => {
    setHardestIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const errorMessage = (e: unknown, fallback: string) => {
    if (e instanceof Error && e.message) return e.message;
    if (e && typeof e === 'object' && 'message' in e) {
      const msg = (e as { message: unknown }).message;
      if (typeof msg === 'string' && msg) return msg;
    }
    if (typeof e === 'string' && e) return e;
    return fallback;
  };

  const onConsent = async () => {
    setError(null);
    setBusy(true);
    try {
      await recordConsent();
      setStep('stage');
    } catch (e) {
      setError(errorMessage(e, 'Could not save consent.'));
    } finally {
      setBusy(false);
    }
  };

  const finish = async (seed: {
    stage?: string | null;
    symptoms?: string[];
    notes?: string[];
  }) => {
    setError(null);
    setBusy(true);
    try {
      const profile = await completeOnboarding(seed);
      onFinished(profile);
    } catch (e) {
      setError(errorMessage(e, 'Could not finish setup.'));
    } finally {
      setBusy(false);
    }
  };

  const seedWithStage = () => ({
    stage: stage ?? undefined,
  });

  const onSkipRemaining = () => void finish(seedWithStage());

  const onFinishHardest = () => {
    const symptoms = HARDEST_OPTIONS.filter((o) => hardestIds.includes(o.id)).map(
      (o) => o.label,
    );
    const notes = otherHardest.trim() ? [otherHardest.trim()] : undefined;
    void finish({
      ...seedWithStage(),
      symptoms: symptoms.length ? symptoms : undefined,
      notes,
    });
  };

  if (step === 'welcome') {
    return (
      <OnboardingShell
        title="Talk. Thread remembers."
        subtitle="No streaks or forms. Just say what's going on. Thread keeps what matters for next time."
        footer={
          <PrimaryButton label="Continue" onPress={() => setStep('consent')} />
        }
      >
        <Text style={styles.body}>
          Insights come from what you already said, not another tracker.
        </Text>
      </OnboardingShell>
    );
  }

  if (step === 'consent') {
    return (
      <OnboardingShell
        title="Before you start"
        subtitle="Where your words go, in plain terms."
        footer={
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              label={busy ? 'Saving…' : 'I understand'}
              onPress={() => void onConsent()}
              disabled={busy}
            />
          </>
        }
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.body}>{CONSENT_BODY}</Text>
          {busy ? (
            <ActivityIndicator color={colors.amber} style={{ marginTop: 16 }} />
          ) : null}
        </ScrollView>
      </OnboardingShell>
    );
  }

  if (step === 'stage') {
    return (
      <OnboardingShell
        title="Where are you with this?"
        subtitle="Optional. Skip if you'd rather just talk."
        footer={
          <>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              label="Continue"
              onPress={() => setStep('hardest')}
              disabled={busy}
            />
            <PrimaryButton
              label="Skip, I'll just talk"
              variant="ghost"
              onPress={onSkipRemaining}
              disabled={busy}
            />
          </>
        }
      >
        <View style={styles.chipWrap}>
          {STAGE_OPTIONS.map((opt) => (
            <ChoiceChip
              key={opt.id}
              label={opt.label}
              selected={stage === opt.label}
              onPress={() =>
                setStage((prev) => (prev === opt.label ? null : opt.label))
              }
            />
          ))}
        </View>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title="What's hardest right now?"
      subtitle="Pick up to two, or write your own. Optional."
      footer={
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label={busy ? 'Saving…' : 'Start talking'}
            onPress={onFinishHardest}
            disabled={busy}
          />
          <PrimaryButton
            label="Skip"
            variant="ghost"
            onPress={onSkipRemaining}
            disabled={busy}
          />
        </>
      }
    >
      <View style={styles.chipWrap}>
        {HARDEST_OPTIONS.map((opt) => (
          <ChoiceChip
            key={opt.id}
            label={opt.label}
            selected={hardestIds.includes(opt.id)}
            onPress={() => toggleHardest(opt.id)}
          />
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Something else…"
        placeholderTextColor={colors.textFaint}
        value={otherHardest}
        onChangeText={setOtherHardest}
        editable={!busy}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.inter,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.textDim,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.rose,
    marginBottom: 4,
  },
});
