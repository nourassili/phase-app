import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootTabParamList = {
  Home: undefined;
  Train: undefined;
  Coach: { focusInput?: boolean; placeholder?: string } | undefined;
  Food: undefined;
  Explore: undefined;
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  Together: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Home'>;
export type TrainScreenProps = BottomTabScreenProps<RootTabParamList, 'Train'>;
export type CoachScreenProps = BottomTabScreenProps<RootTabParamList, 'Coach'>;
export type FoodScreenProps = BottomTabScreenProps<RootTabParamList, 'Food'>;
export type ExploreMainScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ExploreStackParamList, 'ExploreMain'>,
  BottomTabScreenProps<RootTabParamList>
>;
export type TogetherScreenProps = NativeStackScreenProps<ExploreStackParamList, 'Together'>;
