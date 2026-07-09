import { ScreenLayout } from '../components/ScreenLayout';
import { ScreenHeader } from '../components/ScreenHeader';
import { ProfileCard, MenuList } from '../components/ProfileCard';
import { exploreMenuItems, user } from '../data/mockData';
import type { ExploreMainScreenProps } from '../types/navigation';

export function ExploreScreen({ navigation }: ExploreMainScreenProps) {
  const handleMenuPress = (id: string) => {
    if (id === 'together') {
      navigation.navigate('Together');
    }
  };

  return (
    <ScreenLayout>
      <ScreenHeader title="Explore" subtitle="Profile, circle, and settings" />

      <ProfileCard
        name={user.fullName}
        subtitle={`${user.cycleStatus} · Member since ${user.memberSince}`}
        initial={user.firstName[0]}
      />

      <MenuList items={exploreMenuItems} onItemPress={handleMenuPress} />
    </ScreenLayout>
  );
}
