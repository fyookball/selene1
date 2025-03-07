import { gql } from "@apollo/client";

const GET_ACTIVE_BITCOINERS_SUMMARY = gql`
  query GetActiveBitcoinersSummary {
    activeBitcoinersSummary {
      dailyActiveCount
      dailyActivePreviousCount
      weeklyActiveCount
      weeklyActivePreviousCount
      monthlyActiveCount
      monthlyActivePreviousCount
      yearlyActiveCount
      yearlyActivePreviousCount
    }
  }
`;

export default GET_ACTIVE_BITCOINERS_SUMMARY;
