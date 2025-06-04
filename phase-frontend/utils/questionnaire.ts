export interface Condition {
  [questionId: string]: string | string[];
}

export interface Question {
  id: string;
  question: string;
  type?: string;
  options?: string[];

  condition?: Condition;
  optional?: boolean;
}

export interface QuestionnaireSection {
  [sectionName: string]: Question[];
}

export const getQuestionnaire = (
  t: (key: string, options?: any) => string | string[]
): QuestionnaireSection => {
  return {
    basics: [
      {
        id: "motherhoodStage",
        question: "Where are you in your motherhood journey?",
        type: "multi-select",

        options: [
          "Trying to conceive",
          "Currently pregnant",
          "Postpartum",
          "Parent of older children",
          "Not a parent",
        ],
      },
    ],

    hormones_and_cycles: [
      {
        id: "hasPeriods",
        question: "Do you currently get periods?",
        options: ["Yes", "No", "Not sure"],
      },
      {
        id: "trackCycle",
        question: "Do you track your menstrual cycle?",
        options: ["Yes", "No"],
        condition: { hasPeriods: "Yes" },
      },
      {
        id: "lastPeriodStart",
        question: "When did your most recent period start?",
        condition: { hasPeriods: "Yes" },
      },
      {
        id: "lastPeriodEnd",
        question: "When did it end?",
        condition: { hasPeriods: "Yes" },
      },
      {
        id: "cycleRegularity",
        question: "How would you describe your cycle's regularity?",
        options: [
          "Very regular (predictable every month)",
          "Somewhat regular",
          "Irregular",
          "I'm not sure",
        ],
        optional: true,
        condition: { hasPeriods: "Yes" },
      },
      {
        id: "flowDescription",
        question: "How would you describe your typical period flow?",
        options: ["Light", "Moderate", "Heavy", "It varies"],
        optional: true,
        condition: { hasPeriods: "Yes" },
      },
    ],

    menopause: [
      {
        id: "menopauseStatus",
        question: "Have you reached menopause or are you in perimenopause?",
        type: "select",
        options: [
          "No",
          "I'm in perimenopause",
          "I've reached menopause",
          "Not sure",
        ],
      },
      {
        id: "menopauseChanges",
        question:
          "Have you noticed changes in your cycle, symptoms, or consistency?",
        type: "select",
        options: ["Yes", "No", "Not sure"],
        condition: {
          menopauseStatus: ["I'm in perimenopause", "I've reached menopause"],
        },
      },
      {
        id: "menopauseSymptoms",
        question:
          "Which symptoms have you experienced recently? (Select all that apply)",
        type: "multi-select",
        options: [
          "Hot flashes or night sweats",
          "Trouble sleeping",
          "Mood swings or anxiety",
          "Memory issues or brain fog",
          "Irregular or missed periods",
          "Low libido or vaginal dryness",
          "Joint or muscle pain",
          "None of these",
          "Prefer not to say",
        ],
        condition: {
          menopauseStatus: ["I'm in perimenopause", "I've reached menopause"],
        },
      },
    ],

    wellness_goals: [
      {
        id: "wellnessFocus",
        question: "What’s your main focus right now?",
        type: "select",
        options: [
          "Boosting energy and mood",
          "Improving fitness or training smarter",
          "Better rest and recovery",
          "Supporting hormone health through nutrition",
          "Managing stress or feeling overwhelmed",
          "Just exploring or curious",
        ],
      },
      {
        id: "appSupportNeeds",
        question: "What kind of support are you looking for from this app?",
        type: "multi-select",
        options: [
          "Daily tips and helpful nudges",
          "In-depth education",
          "Cycle syncing guidance",
          "A space to reflect and track",
          "Just tracking, no advice for now",
        ],
      },
    ],

    lifestyle: [
      {
        id: "weeklyActivity",
        question: "How active are you in a typical week?",
        type: "select",
        options: [
          "Not active",
          "Light activity (e.g., walking, yoga)",
          "Moderate activity (3–5x/week)",
          "High intensity training / athlete",
        ],
      },
      {
        id: "sleepQuality",
        question: "How would you describe your current sleep?",
        type: "select",
        options: [
          "Restful and consistent",
          "Trouble falling asleep",
          "Waking frequently / disrupted sleep",
          "Not sleeping well at all",
        ],
      },
    ],

    health_conditions: [
      {
        id: "diagnosedConditions",
        question:
          "Have you been diagnosed with any hormone-related conditions?",
        type: "multi-select",
        options: [
          "PCOS (Polycystic Ovary Syndrome)",
          "Endometriosis",
          "Thyroid disorder",
          "PMDD (Premenstrual Dysphoric Disorder)",
          "Other",
          "No diagnosed conditions",
          "Prefer not to say",
        ],
      },
    ],
  };
};
