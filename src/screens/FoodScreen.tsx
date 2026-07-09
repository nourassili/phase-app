import { ScreenLayout } from '../components/ScreenLayout';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/Card';
import { SectionLabel } from '../components/SectionLabel';
import { ProteinBar } from '../components/PlanCard';
import { FoodRecipeCard } from '../components/FoodRecipeCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { proteinProgress, recipes } from '../data/mockData';
import { colors } from '../theme';
import type { FoodScreenProps } from '../types/navigation';

export function FoodScreen({ navigation }: FoodScreenProps) {
  const handleTellCoach = () => {
    navigation.navigate('Coach', {
      focusInput: true,
      placeholder: 'e.g. "had the magnesium bowl for lunch"',
    });
  };

  return (
    <ScreenLayout>
      <ScreenHeader title="Food" subtitle="Protein + magnesium focus today" />

      <Card>
        <ProteinBar
          current={proteinProgress.current}
          target={proteinProgress.target}
        />
      </Card>

      <SectionLabel label="Suggested for luteal" dotColor={colors.sage} />

      {recipes.map((recipe) => (
        <FoodRecipeCard
          key={recipe.id}
          name={recipe.name}
          description={recipe.description}
        />
      ))}

      <PrimaryButton
        label="Tell your coach what you ate"
        onPress={handleTellCoach}
        fullWidth
      />
    </ScreenLayout>
  );
}
