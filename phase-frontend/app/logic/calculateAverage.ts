import { supabase } from "@/utils/supabase";

export const recalculateAverages = async (userId: string) => {
  if (!userId) return { error: new Error("User ID is required.") };

  const { data: logs, error: fetchError } = await supabase
    .from("period_logs")
    .select("start_date, end_date")
    .eq("user_id", userId)
    .order("start_date", { ascending: true });

  if (fetchError) return { error: fetchError };

  if (!logs || logs.length < 2) {
    return {
      message:
        "Not enough data to calculate new averages yet. At least two periods need to be logged.",
    };
  }

  const periodDurations = logs.map((log) => {
    const start = new Date(log.start_date + "T00:00:00");
    const end = new Date(log.end_date + "T00:00:00");

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  });

  const totalDuration = periodDurations.reduce(
    (sum, duration) => sum + duration,
    0
  );
  const newAveragePeriodDuration = Math.round(
    totalDuration / periodDurations.length
  );

  const cycleLengths = [];
  for (let i = 1; i < logs.length; i++) {
    const previousStart = new Date(logs[i - 1].start_date + "T00:00:00");
    const currentStart = new Date(logs[i].start_date + "T00:00:00");
    const diffTime = Math.abs(currentStart.getTime() - previousStart.getTime());
    cycleLengths.push(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
  const totalCycleLength = cycleLengths.reduce(
    (sum, length) => sum + length,
    0
  );
  const newAverageCycleLength =
    cycleLengths.length > 0
      ? Math.round(totalCycleLength / cycleLengths.length)
      : 28;

  const { error: updateError } = await supabase
    .from("users")
    .update({
      averageCycleLength: newAverageCycleLength,
      averagePeriodDuration: newAveragePeriodDuration,
    })
    .eq("id", userId);

  if (updateError) return { error: updateError };

  return {
    success: true,
    message: "Averages recalculated and updated successfully.",
  };
};
