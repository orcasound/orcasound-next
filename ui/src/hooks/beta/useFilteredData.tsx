import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemo } from "react";

import { CandidateFilters } from "@/context/DataContext";
import { CombinedData } from "@/types/DataTypes";
import { allTime, customRange } from "@/utils/masterDataHelpers";

// dayjs plugin for date pickers
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default function useFilteredData(
  data: CombinedData[],
  filters: CandidateFilters,
): CombinedData[] {
  const searchQuery = filters.searchQuery;

  return useMemo(() => {
    const min = Date.now() - filters.timeRange;

    return data.filter((el: CombinedData) => {
      const category = (el.newCategory ?? "").toLowerCase();

      return (
        // uncomment this to block Orcahello data
        // el.type === "human" &&
        (filters.hydrophone === "All hydrophones" ||
          el.hydrophone === filters.hydrophone) &&
        (filters.category === "All categories" ||
          category === filters.category ||
          (filters.category === "whale + whale (ai) + sightings" &&
            ["whale (human)", "whale (ai)", "sighting"].includes(category))) &&
        (filters.timeRange === allTime ||
          filters.timeRange === customRange ||
          Date.parse(el.timestampString) >= min) &&
        (!filters.startDate ||
          dayjs(el.timestampString).isSameOrAfter(filters.startDate, "day")) &&
        dayjs(el.timestampString).isSameOrBefore(filters.endDate, "day") &&
        (searchQuery === "" ||
          (el.comments && el.comments.toLowerCase().includes(searchQuery)) ||
          category.includes(searchQuery) ||
          el.hydrophone.toLowerCase().includes(searchQuery))
      );
    });
  }, [data, filters, searchQuery]);
}
