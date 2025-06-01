interface FormData {
  firstName: string;
  lastName: string;
  dob: Date;
  timezone: string;
  is_pregnant?: boolean;
  profile_completed?: boolean;
}

interface Props {
  onComplete: () => void;
}

export default function BasicProfileSetup({ onComplete }: Props) {
  //TODO
}
